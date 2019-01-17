const { Structures, escapeMarkdown, splitMessage, resolveString } = require('discord.js');
const { oneLine } = require('common-tags');
const Command = require('../commands/base');
const FriendlyError = require('../errors/friendly');
const CommandFormatError = require('../errors/command-format');

module.exports = Structures.extend('Message', Message => {
	/**
	 * An extension of the base Discord.js Message class to add command-related functionality.
	 * @extends Message
	 */
	class CommandoMessage extends Message {
		constructor(...args) {
			super(...args);

			/**
			 * Whether the message contains a command (even an unknown one)
			 * @type {boolean}
			 */
			this.isCommand = false;

			/**
			 * Command that the message triggers, if any
			 * @type {?Command}
			 */
			this.command = null;

			/**
			 * Argument string for the command
			 * @type {?string}
			 */
			this.argString = null;

			/**
			 * Pattern matches (if from a pattern trigger)
			 * @type {?string[]}
			 */
			this.patternMatches = null;

			/**
			 * Response messages sent, mapped by channel ID (set by the dispatcher after running the command)
			 * @type {?Object}
			 */
			this.responses = null;

			/**
			 * Index of the current response that will be edited, mapped by channel ID
			 * @type {?Object}
			 */
			this.responsePositions = null;
		}

		/**
		 * Initialises the message for a command
	 	 * @param {Command} [command] - Command the message triggers
	 	 * @param {string} [argString] - Argument string for the command
	 	 * @param {?Array<string>} [patternMatches] - Command pattern matches (if from a pattern trigger)
		 * @return {Message} This message
		 * @private
		 */
		initCommand(command, argString, patternMatches) {
			this.isCommand = true;
			this.command = command;
			this.argString = argString;
			this.patternMatches = patternMatches;
			return this;
		}

		/**
		 * Creates a usage string for the message's command
		 * @param {string} [argString] - A string of arguments for the command
		 * @param {string} [prefix=this.guild.commandPrefix || this.client.commandPrefix] - Prefix to use for the
		 * prefixed command format
		 * @param {User} [user=this.client.user] - User to use for the mention command format
		 * @return {string}
		 */
		usage(argString, prefix, user = this.client.user) {
			if(typeof prefix === 'undefined') {
				if(this.guild) prefix = this.guild.commandPrefix;
				else prefix = this.client.commandPrefix;
			}
			return this.command.usage(argString, prefix, user);
		}

		/**
		 * Creates a usage string for any command
		 * @param {string} [command] - A command + arg string
		 * @param {string} [prefix=this.guild.commandPrefix || this.client.commandPrefix] - Prefix to use for the
		 * prefixed command format
		 * @param {User} [user=this.client.user] - User to use for the mention command format
		 * @return {string}
		 */
		anyUsage(command, prefix, user = this.client.user) {
			if(typeof prefix === 'undefined') {
				if(this.guild) prefix = this.guild.commandPrefix;
				else prefix = this.client.commandPrefix;
			}
			return Command.usage(command, prefix, user);
		}

		/**
		 * Parses the argString into usable arguments, based on the argsType and argsCount of the command
		 * @return {string|string[]}
		 * @see {@link Command#run}
		 */
		parseArgs() {
			switch(this.command.argsType) {
				case 'single':
					return this.argString.trim().replace(
						this.command.argsSingleQuotes ? /^("|')([^]*)\1$/g : /^(")([^]*)"$/g, '$2'
					);
				case 'multiple':
					return this.constructor.parseArgs(this.argString, this.command.argsCount, this.command.argsSingleQuotes);
				default:
					throw new RangeError(`Unknown argsType "${this.argsType}".`);
			}
		}

		/**
		 * Runs the command
		 * @return {Promise<?Message|?Array<Message>>}
		 */
		async run() { // eslint-disable-line complexity
			// Obtain the member if we don't have it
			if(this.channel.type === 'text' && !this.guild.members.has(this.author.id) && !this.webhookID) {
				this.member = await this.guild.members.fetch(this.author);
			}

			// Obtain the member for the ClientUser if it doesn't already exist
			if(this.channel.type === 'text' && !this.guild.members.has(this.client.user.id)) {
				await this.guild.members.fetch(this.client.user.id);
			}

			// Make sure the command is usable in this context
			if(this.command.guildOnly && !this.guild) {
				/**
				 * Emitted when a command is prevented from running
				 * @event CommandoClient#commandBlocked
				 * @param {CommandoMessage} message - Command message that the command is running from
				 * @param {string} reason - Reason that the command was blocked
				 * (built-in reasons are `guildOnly`, `nsfw`, `permission`, `throttling`, and `clientPermissions`)
				 * @param {Object} [data] - Additional data associated with the block. Built-in reason data properties:
				 * - guildOnly: none
				 * - nsfw: none
				 * - permission: `response` ({@link string}) to send
				 * - throttling: `throttle` ({@link Object}), `remaining` ({@link number}) time in seconds
				 * - clientPermissions: `missing` ({@link Array}<{@link string}>) permission names
				 */
				this.client.emit('commandBlocked', this, 'guildOnly');
				return this.command.onBlocked(this, 'guildOnly');
			}

			// Ensure the channel is a NSFW one if required
			if(this.command.nsfw && !this.channel.nsfw) {
				this.client.emit('commandBlocked', this, 'nsfw');
				return this.command.onBlocked(this, 'nsfw');
			}

			// Ensure the user has permission to use the command
			const hasPermission = this.command.hasPermission(this);
			if(!hasPermission || typeof hasPermission === 'string') {
				const data = { response: typeof hasPermission === 'string' ? hasPermission : undefined };
				this.client.emit('commandBlocked', this, 'permission', data);
				return this.command.onBlocked(this, 'permission', data);
			}

			// Ensure the client user has the required permissions
			if(this.channel.type === 'text' && this.command.clientPermissions) {
				const missing = this.channel.permissionsFor(this.client.user).missing(this.command.clientPermissions);
				if(missing.length > 0) {
					const data = { missing };
					this.client.emit('commandBlocked', this, 'clientPermissions', data);
					return this.command.onBlocked(this, 'clientPermissions', data);
				}
			}

			// Throttle the command
			const throttle = this.command.throttle(this.author.id);
			if(throttle && throttle.usages + 1 > this.command.throttling.usages) {
				const remaining = (throttle.start + (this.command.throttling.duration * 1000) - Date.now()) / 1000;
				const data = { throttle, remaining };
				this.client.emit('commandBlocked', this, 'throttling', data);
				return this.command.onBlocked(this, 'throttling', data);
			}

			// Figure out the command arguments
			let args = this.patternMatches;
			if(!args && this.command.argsCollector) {
				const collArgs = this.command.argsCollector.args;
				const count = collArgs[collArgs.length - 1].infinite ? Infinity : collArgs.length;
				const provided = this.constructor.parseArgs(this.argString.trim(), count, this.command.argsSingleQuotes);

				const result = await this.command.argsCollector.obtain(this, provided);
				if(result.cancelled) {
					if(result.prompts.length === 0) {
						const err = new CommandFormatError(this);
						return this.reply(err.message);
					}
					/**
					 * Emitted when a command is cancelled (either by typing 'cancel' or not responding in time)
					 * @event CommandoClient#commandCancelled
					 * @param {Command} command - Command that was cancelled
					 * @param {string} reason - Reason for the command being cancelled
					 * @param {CommandoMessage} message - Command message that the command ran from (see {@link Command#run})
					 */
					this.client.emit('commandCancelled', this.command, result.cancelled, this);
					return this.reply('Cancelled command.');
				}
				args = result.values;
			}
			if(!args) args = this.parseArgs();
			const fromPattern = Boolean(this.patternMatches);

			// Run the command
			if(throttle) throttle.usages++;
			const typingCount = this.channel.typingCount;
			try {
				this.client.emit('debug', `Running command ${this.command.groupID}:${this.command.memberName}.`);
				const promise = this.command.run(this, args, fromPattern);
				/**
				 * Emitted when running a command
				 * @event CommandoClient#commandRun
				 * @param {Command} command - Command that is being run
				 * @param {Promise} promise - Promise for the command result
				 * @param {CommandoMessage} message - Command message that the command is running from (see {@link Command#run})
				 * @param {Object|string|string[]} args - Arguments for the command (see {@link Command#run})
				 * @param {boolean} fromPattern - Whether the args are pattern matches (see {@link Command#run})
				 */
				this.client.emit('commandRun', this.command, promise, this, args, fromPattern);
				const retVal = await promise;
				if(!(retVal instanceof Message || retVal instanceof Array || retVal === null || retVal === undefined)) {
					throw new TypeError(oneLine`
						Command ${this.command.name}'s run() resolved with an unknown type
						(${retVal !== null ? retVal && retVal.constructor ? retVal.constructor.name : typeof retVal : null}).
						Command run methods must return a Promise that resolve with a Message, Array of Messages, or null/undefined.
					`);
				}
				return retVal;
			} catch(err) {
				/**
				 * Emitted when a command produces an error while running
				 * @event CommandoClient#commandError
				 * @param {Command} command - Command that produced an error
				 * @param {Error} err - Error that was thrown
				 * @param {CommandoMessage} message - Command message that the command is running from (see {@link Command#run})
				 * @param {Object|string|string[]} args - Arguments for the command (see {@link Command#run})
				 * @param {boolean} fromPattern - Whether the args are pattern matches (see {@link Command#run})
				 */
				this.client.emit('commandError', this.command, err, this, args, fromPattern);
				if(this.channel.typingCount > typingCount) this.channel.stopTyping();
				if(err instanceof FriendlyError) {
					return this.reply(err.message);
				} else {
					return this.command.onError(err, this, args, fromPattern);
				}
			}
		}

		/**
		 * Responds to the command message
		 * @param {Object} [options] - Options for the response
		 * @return {Message|Message[]}
		 * @private
		 */
		respond({ type = 'reply', content, options, lang, fromEdit = false }) {
			const shouldEdit = this.responses && !fromEdit;
			if(shouldEdit) {
				if(options && options.split && typeof options.split !== 'object') options.split = {};
			}

			if(type === 'reply' && this.channel.type === 'dm') type = 'plain';
			if(type !== 'direct') {
				if(this.guild && !this.channel.permissionsFor(this.client.user).has('SEND_MESSAGES')) {
					type = 'direct';
				}
			}

			content = resolveString(content);

			switch(type) {
				case 'plain':
					if(!shouldEdit) return this.channel.send(content, options);
					return this.editCurrentResponse(channelIDOrDM(this.channel), { type, content, options });
				case 'reply':
					if(!shouldEdit) return super.reply(content, options);
					if(options && options.split && !options.split.prepend) options.split.prepend = `${this.author}, `;
					return this.editCurrentResponse(channelIDOrDM(this.channel), { type, content, options });
				case 'direct':
					if(!shouldEdit) return this.author.send(content, options);
					return this.editCurrentResponse('dm', { type, content, options });
				case 'code':
					if(!shouldEdit) return this.channel.send(content, options);
					if(options && options.split) {
						if(!options.split.prepend) options.split.prepend = `\`\`\`${lang || ''}\n`;
						if(!options.split.append) options.split.append = '\n```';
					}
					content = `\`\`\`${lang || ''}\n${escapeMarkdown(content, true)}\n\`\`\``;
					return this.editCurrentResponse(channelIDOrDM(this.channel), { type, content, options });
				default:
					throw new RangeError(`Unknown response type "${type}".`);
			}
		}

		/**
		 * Edits a response to the command message
		 * @param {Message|Message[]} response - The response message(s) to edit
		 * @param {Object} [options] - Options for the response
		 * @return {Promise<Message|Message[]>}
		 * @private
		 */
		editResponse(response, { type, content, options }) {
			if(!response) return this.respond({ type, content, options, fromEdit: true });
			if(options && options.split) content = splitMessage(content, options.split);

			let prepend = '';
			if(type === 'reply') prepend = `${this.author}, `;

			if(content instanceof Array) {
				const promises = [];
				if(response instanceof Array) {
					for(let i = 0; i < content.length; i++) {
						if(response.length > i) promises.push(response[i].edit(`${prepend}${content[i]}`, options));
						else promises.push(response[0].channel.send(`${prepend}${content[i]}`));
					}
				} else {
					promises.push(response.edit(`${prepend}${content[0]}`, options));
					for(let i = 1; i < content.length; i++) {
						promises.push(response.channel.send(`${prepend}${content[i]}`));
					}
				}
				return Promise.all(promises);
			} else {
				if(response instanceof Array) { // eslint-disable-line no-lonely-if
					for(let i = response.length - 1; i > 0; i--) response[i].delete();
					return response[0].edit(`${prepend}${content}`, options);
				} else {
					return response.edit(`${prepend}${content}`, options);
				}
			}
		}

		/**
		 * Edits the current response
		 * @param {string} id - The ID of the channel the response is in ("DM" for direct messages)
		 * @param {Object} [options] - Options for the response
		 * @return {Promise<Message|Message[]>}
		 * @private
		 */
		editCurrentResponse(id, options) {
			if(typeof this.responses[id] === 'undefined') this.responses[id] = [];
			if(typeof this.responsePositions[id] === 'undefined') this.responsePositions[id] = -1;
			this.responsePositions[id]++;
			return this.editResponse(this.responses[id][this.responsePositions[id]], options);
		}

		/**
		 * Responds with a plain message
		 * @param {StringResolvable} content - Content for the message
		 * @param {MessageOptions} [options] - Options for the message
		 * @return {Promise<Message|Message[]>}
		 */
		say(content, options) {
			if(!options && typeof content === 'object' && !(content instanceof Array)) {
				options = content;
				content = '';
			}
			return this.respond({ type: 'plain', content, options });
		}

		/**
		 * Responds with a reply message
		 * @param {StringResolvable} content - Content for the message
		 * @param {MessageOptions} [options] - Options for the message
		 * @return {Promise<Message|Message[]>}
		 */
		reply(content, options) {
			if(!options && typeof content === 'object' && !(content instanceof Array)) {
				options = content;
				content = '';
			}
			return this.respond({ type: 'reply', content, options });
		}

		/**
		 * Responds with a direct message
		 * @param {StringResolvable} content - Content for the message
		 * @param {MessageOptions} [options] - Options for the message
		 * @return {Promise<Message|Message[]>}
		 */
		direct(content, options) {
			if(!options && typeof content === 'object' && !(content instanceof Array)) {
				options = content;
				content = '';
			}
			return this.respond({ type: 'direct', content, options });
		}

		/**
		 * Responds with a code message
		 * @param {string} lang - Language for the code block
		 * @param {StringResolvable} content - Content for the message
		 * @param {MessageOptions} [options] - Options for the message
		 * @return {Promise<Message|Message[]>}
		 */
		code(lang, content, options) {
			if(!options && typeof content === 'object' && !(content instanceof Array)) {
				options = content;
				content = '';
			}
			if(typeof options !== 'object') options = {};
			options.code = lang;
			return this.respond({ type: 'code', content, options });
		}

		/**
		 * Responds with an embed
		 * @param {RichEmbed|Object} embed - Embed to send
		 * @param {StringResolvable} [content] - Content for the message
		 * @param {MessageOptions} [options] - Options for the message
		 * @return {Promise<Message|Message[]>}
		 */
		embed(embed, content = '', options) {
			if(typeof options !== 'object') options = {};
			options.embed = embed;
			return this.respond({ type: 'plain', content, options });
		}

		/**
		 * Responds with a mention + embed
		 * @param {RichEmbed|Object} embed - Embed to send
		 * @param {StringResolvable} [content] - Content for the message
		 * @param {MessageOptions} [options] - Options for the message
		 * @return {Promise<Message|Message[]>}
		 */
		replyEmbed(embed, content = '', options) {
			if(typeof options !== 'object') options = {};
			options.embed = embed;
			return this.respond({ type: 'reply', content, options });
		}

		/**
		 * Finalizes the command message by setting the responses and deleting any remaining prior ones
		 * @param {?Array<Message|Message[]>} responses - Responses to the message
		 * @private
		 */
		finalize(responses) {
			if(this.responses) this.deleteRemainingResponses();
			this.responses = {};
			this.responsePositions = {};

			if(responses instanceof Array) {
				for(const response of responses) {
					const channel = (response instanceof Array ? response[0] : response).channel;
					const id = channelIDOrDM(channel);
					if(!this.responses[id]) {
						this.responses[id] = [];
						this.responsePositions[id] = -1;
					}
					this.responses[id].push(response);
				}
			} else if(responses) {
				const id = channelIDOrDM(responses.channel);
				this.responses[id] = [responses];
				this.responsePositions[id] = -1;
			}
		}

		/**
		 * Deletes any prior responses that haven't been updated
		 * @private
		 */
		deleteRemainingResponses() {
			for(const id of Object.keys(this.responses)) {
				const responses = this.responses[id];
				for(let i = this.responsePositions[id] + 1; i < responses.length; i++) {
					const response = responses[i];
					if(response instanceof Array) {
						for(const resp of response) resp.delete();
					} else {
						response.delete();
					}
				}
			}
		}

		/**
		 * Parses an argument string into an array of arguments
		 * @param {string} argString - The argument string to parse
		 * @param {number} [argCount] - The number of arguments to extract from the string
		 * @param {boolean} [allowSingleQuote=true] - Whether or not single quotes should be allowed to wrap arguments,
		 * in addition to double quotes
		 * @return {string[]} The array of arguments
		 */
		static parseArgs(argString, argCount, allowSingleQuote = true) {
			const re = allowSingleQuote ? /\s*(?:("|')([^]*?)\1|(\S+))\s*/g : /\s*(?:(")([^]*?)"|(\S+))\s*/g;
			const result = [];
			let match = [];
			// Large enough to get all items
			argCount = argCount || argString.length;
			// Get match and push the capture group that is not null to the result
			while(--argCount && (match = re.exec(argString))) result.push(match[2] || match[3]);
			// If text remains, push it to the array as-is (except for wrapping quotes, which are removed)
			if(match && re.lastIndex < argString.length) {
				const re2 = allowSingleQuote ? /^("|')([^]*)\1$/g : /^(")([^]*)"$/g;
				result.push(argString.substr(re.lastIndex).replace(re2, '$2'));
			}
			return result;
		}
	}

	return CommandoMessage;
});

function channelIDOrDM(channel) {
	if(channel.type !== 'dm') return channel.id;
	return 'dm';
}
