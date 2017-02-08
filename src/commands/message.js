const discord = require('discord.js');
const { stripIndents, oneLine } = require('common-tags');
const Command = require('./base');
const FriendlyError = require('../errors/friendly');
const CommandFormatError = require('../errors/command-format');

/** A container for a message that triggers a command, that command, and methods to respond */
class CommandMessage {
	/**
	 * @param {Message} message - Message that triggers the command
	 * @param {Command} [command] - Command the message triggers
	 * @param {string} [argString] - Argument string for the command
	 * @param {?Array<string>} [patternMatches] - Command pattern matches (if from a pattern trigger)
	 */
	constructor(message, command = null, argString = null, patternMatches = null) {
		/**
		 * Client that the message was sent from
		 * @name CommandMessage#client
		 * @type {CommandoClient}
		 * @readonly
		 */
		Object.defineProperty(this, 'client', { value: message.client });

		/**
		 * Message that triggers the command
		 * @type {Message}
		 */
		this.message = message;

		/**
		 * Command that the message triggers, if any
		 * @type {?Command}
		 */
		this.command = command;

		/**
		 * Argument string for the command
		 * @type {?string}
		 */
		this.argString = argString;

		/**
		 * Pattern matches (if from a pattern trigger)
		 * @type {?string[]}
		 */
		this.patternMatches = patternMatches;

		/**
		 * Response messages sent, mapped by channel ID (set by the dispatcher after running the command)
		 * @type {?Object}
		 */
		this.responses = null;

		/**
		 * The index of the current response that will be edited, mapped by channel ID
		 * @type {?Object}
		 */
		this.responsePositions = null;

		/**
		 * Number of times the user has been prompted while the arguments are being obtained
		 * @type {number}
		 * @private
		 */
		this.promptCount = 0;
	}

	/**
	 * Creates a usage string for the message's command
	 * @param {string} [argString] - A string of arguments for the command
	 * @param {string} [prefix=this.message.guild.commandPrefix || this.client.commandPrefix] - Prefix to use for the
	 * prefixed command format
	 * @param {User} [user=this.client.user] - User to use for the mention command format
	 * @return {string}
	 */
	usage(argString, prefix, user = this.client.user) {
		if(typeof prefix === 'undefined') {
			if(this.message.guild) prefix = this.message.guild.commandPrefix;
			else prefix = this.client.commandPrefix;
		}
		return this.command.usage(argString, prefix, user);
	}

	/**
	 * Creates a usage string for any command
	 * @param {string} [command] - A command + arg string
	 * @param {string} [prefix=this.message.guild.commandPrefix || this.client.commandPrefix] - Prefix to use for the
	 * prefixed command format
	 * @param {User} [user=this.client.user] - User to use for the mention command format
	 * @return {string}
	 */
	anyUsage(command, prefix, user = this.client.user) {
		if(typeof prefix === 'undefined') {
			if(this.message.guild) prefix = this.message.guild.commandPrefix;
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
				return this.argString.trim().replace(this.argsSingleQuotes ? /^("|')([^]*)\1$/g : /^(")([^]*)"$/g, '$2');
			case 'multiple':
				return this.constructor.parseArgs(this.argString, this.argsCount, this.argsSingleQuotes);
			default:
				throw new RangeError(`Unknown argsType "${this.argsType}".`);
		}
	}

	/**
	 * Obtains the values for the command's arguments
	 * @return {Array<*>|symbol}
	 */
	async obtainArgs() {
		this.client.dispatcher._awaiting.add(this.message.author.id + this.message.channel.id);
		const args = this.command.args;
		const count = args[args.length - 1].infinite ? Infinity : args.length;
		const provided = this.constructor.parseArgs(this.argString.trim(), count, this.argsSingleQuotes);
		const values = {};
		for(let i = 0; i < args.length; i++) {
			const value = await args[i].obtain(this, args[i].infinite ? provided.slice(i) : provided[i]);
			if(value === null || typeof value === 'symbol') {
				this.client.dispatcher._awaiting.delete(this.message.author.id + this.message.channel.id);
				return this.promptCount > 0 ? value : this.constructor.FORMAT_CANCEL;
			}
			values[args[i].key] = value;
		}
		this.client.dispatcher._awaiting.delete(this.message.author.id + this.message.channel.id);
		return values;
	}

	/**
	 * Runs the command
	 * @return {Promise<?Message|?Array<Message>>}
	 */
	async run() { // eslint-disable-line complexity
		// Obtain the member if we don't have it (ugly-ass if statement ahead)
		if(this.message.channel.type === 'text' && !this.message.guild.members.has(this.message.author.id) &&
			!this.message.webhookID) {
			this.message.member = await this.message.guild.fetchMember(this.message.author);
		}

		// Make sure the command is usable
		if(this.command.guildOnly && !this.message.guild) {
			/**
			 * Emitted when a command is prevented from running
			 * @event CommandoClient#commandBlocked
			 * @param {CommandMessage} message - Command message that the command is running from
			 * @param {string} reason - Reason that the command was blocked
			 * (built-in reasons are `guildOnly`, `permission`, and `throttling`)
			 */
			this.client.emit('commandBlocked', this, 'guildOnly');
			return await this.reply(`The \`${this.command.name}\` command must be used in a server channel.`);
		}
		if(!this.command.hasPermission(this)) {
			this.client.emit('commandBlocked', this, 'permission');
			return await this.reply(`You do not have permission to use the \`${this.command.name}\` command.`);
		}

		// Throttle the command
		const throttle = this.command.throttle(this.message.author.id);
		if(throttle && throttle.usages + 1 > this.command.throttling.usages) {
			const remaining = (throttle.start + (this.command.throttling.duration * 1000) - Date.now()) / 1000;
			this.client.emit('commandBlocked', this, 'throttling');
			return await this.reply(
				`You may not use the \`${this.command.name}\` command again for another ${remaining.toFixed(1)} seconds.`
			);
		}

		// Figure out the command arguments
		let args = this.patternMatches;
		if(!args && this.command.args) {
			args = await this.obtainArgs();
			if(!args) return await this.reply('Cancelled command.');
			if(args === this.constructor.SILENT_CANCEL) return null;
			if(args === this.constructor.FORMAT_CANCEL) {
				const err = new CommandFormatError(this);
				return await this.reply(err.message);
			}
		}
		if(!args) args = this.parseArgs();
		const fromPattern = Boolean(this.patternMatches);

		// Run the command
		if(throttle) throttle.usages++;
		const typingCount = this.message.channel.typingCount;
		try {
			this.client.emit('debug', `Running command ${this.command.groupID}:${this.command.memberName}.`);
			const promise = this.command.run(this, args, fromPattern);
			/**
			 * Emitted when running a command
			 * @event CommandoClient#commandRun
			 * @param {Command} command - Command that is being run
			 * @param {Promise} promise - Promise for the command result
			 * @param {CommandMessage} message - Command message that the command is running from (see {@link Command#run})
			 * @param {Object|string|string[]} args - Arguments for the command (see {@link Command#run})
			 * @param {boolean} fromPattern - Whether the args are pattern matches (see {@link Command#run})
			 */
			this.client.emit('commandRun', this.command, promise, this, args, fromPattern);
			const retVal = await promise;
			if(!(retVal instanceof discord.Message || retVal instanceof Array || retVal === null || retVal === undefined)) {
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
			 * @param {CommandMessage} message - Command message that the command is running from (see {@link Command#run})
			 * @param {Object|string|string[]} args - Arguments for the command (see {@link Command#run})
			 * @param {boolean} fromPattern - Whether the args are pattern matches (see {@link Command#run})
			 */
			this.client.emit('commandError', this.command, err, this, args, fromPattern);
			if(this.message.channel.typingCount > typingCount) this.message.channel.stopTyping();
			if(err instanceof FriendlyError) {
				return await this.reply(err.message);
			} else {
				const owners = this.client.owners;
				let ownerList = owners.map((usr, i) => {
					const or = i === owners.length - 1 && owners.length > 1 ? 'or ' : '';
					return `${or}${discord.escapeMarkdown(usr.username)}#${usr.discriminator}`;
				}).join(owners.length > 2 ? ', ' : ' ');

				const invite = this.client.options.invite;
				return await this.reply(stripIndents`
					An error occurred while running the command: \`${err.name}: ${err.message}\`
					You shouldn't ever receive an error like this.
					Please contact ${ownerList}${invite ? ` in this server: ${invite}` : '.'}
				`);
			}
		}
	}

	/**
	 * Responds to the command message
	 * @param {Object} options - Options for the response
	 * @return {Message|Message[]}
	 * @private
	 */
	respond({ type = 'reply', content, options, lang, fromEdit = false }) {
		const shouldEdit = this.responses && !fromEdit;
		if(shouldEdit) {
			if(options && options.split && typeof options.split !== 'object') options.split = {};
		}

		if(type === 'reply' && this.message.channel.type === 'dm') type = 'plain';
		if(type !== 'direct') {
			if(this.message.guild && !this.message.channel.permissionsFor(this.client.user).hasPermission('SEND_MESSAGES')) {
				type = 'direct';
			}
		}

		content = this.client.resolver.resolveString(content);

		switch(type) {
			case 'plain':
				if(!shouldEdit) return this.message.channel.sendMessage(content, options);
				return this.editCurrentResponse(channelIDOrDM(this.message.channel), { type, content, options });
			case 'reply':
				if(!shouldEdit) return this.message.reply(content, options);
				if(options && options.split && !options.split.prepend) options.split.prepend = `${this.message.author}, `;
				return this.editCurrentResponse(channelIDOrDM(this.message.channel), { type, content, options });
			case 'direct':
				if(!shouldEdit) return this.message.author.sendMessage(content, options);
				return this.editCurrentResponse('dm', { type, content, options });
			case 'code':
				if(!shouldEdit) return this.message.channel.sendCode(lang, content, options);
				if(options && options.split) {
					if(!options.split.prepend) options.split.prepend = `\`\`\`${lang || ''}\n`;
					if(!options.split.append) options.split.append = '\n```';
				}
				content = `\`\`\`${lang || ''}\n${discord.escapeMarkdown(content, true)}\n\`\`\``;
				return this.editCurrentResponse(channelIDOrDM(this.message.channel), { type, content, options });
			default:
				throw new RangeError(`Unknown response type "${type}".`);
		}
	}

	/**
	 * Edits a response to the command message
	 * @param {Message|Message[]} response - The response message(s) to edit
	 * @param {Object} options - Options for the response
	 * @return {Promise<Message|Message[]>}
	 * @private
	 */
	editResponse(response, { type, content, options }) {
		if(!response) return this.respond({ type, content, options, fromEdit: true });
		if(options && options.split) content = discord.splitMessage(content, options.split);

		let prepend = '';
		if(type === 'reply') prepend = `${this.message.author}, `;

		if(content instanceof Array) {
			const promises = [];
			if(response instanceof Array) {
				for(let i = 0; i < content.length; i++) {
					if(response.length > i) promises.push(response[i].edit(`${prepend}${content[i]}`, options));
					else promises.push(response[0].channel.sendMessage(`${prepend}${content[i]}`));
				}
			} else {
				promises.push(response.edit(`${prepend}${content[0]}`, options));
				for(let i = 1; i < content.length; i++) {
					promises.push(response.channel.sendMessage(`${prepend}${content[i]}`));
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
	 * @param {Object} options - Options for the response
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
	 * @param {MessageOptions} options - Options for the message
	 * @return {Promise<Message|Message[]>}
	 */
	say(content, options) {
		return this.respond({ type: 'plain', content, options });
	}

	/**
	 * Responds with a reply message
	 * @param {StringResolvable} content - Content for the message
	 * @param {MessageOptions} options - Options for the message
	 * @return {Promise<Message|Message[]>}
	 */
	reply(content, options) {
		return this.respond({ type: 'reply', content, options });
	}

	/**
	 * Responds with a direct message
	 * @param {StringResolvable} content - Content for the message
	 * @param {MessageOptions} options - Options for the message
	 * @return {Promise<Message|Message[]>}
	 */
	direct(content, options) {
		return this.respond({ type: 'direct', content, options });
	}

	/**
	 * Responds with a code message
	 * @param {string} lang - Language for the code block
	 * @param {StringResolvable} content - Content for the message
	 * @param {MessageOptions} options - Options for the message
	 * @return {Promise<Message|Message[]>}
	 */
	code(lang, content, options) {
		return this.respond({ type: 'code', content, options, lang });
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
		this.promptCount = 0;

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
		// default: large enough to get all items
		argCount = argCount || argString.length;
		// get match and push the capture group that is not null to the result
		while(--argCount && (match = re.exec(argString))) result.push(match[2] || match[3]);
		// if text remains, push it to the array as it is, except for wrapping quotes, which are removed from it
		if(match && re.lastIndex < argString.length) {
			const re2 = allowSingleQuote ? /^("|')([^]*)\1$/g : /^(")([^]*)"$/g;
			result.push(argString.substr(re.lastIndex).replace(re2, '$2'));
		}
		return result;
	}


	/* -------------------------------------------------------------------------------------------- *\
	|*                                          SHORTCUTS                                           *|
	|*                          Rest not, and beware, for here be dragons.                          *|
	|* Below these lines lie the fabled message method/getter shortcuts for ye olde lazy developer. *|
	\* -------------------------------------------------------------------------------------------- */

	/**
	 * Shortcut to `this.message.id`
	 * @type {string}
	 * @see {@link Message#id}
	 */
	get id() {
		return this.message.id;
	}

	/**
	 * Shortcut to `this.message.content`
	 * @type {string}
	 * @see {@link Message#content}
	 */
	get content() {
		return this.message.content;
	}

	/**
	 * Shortcut to `this.message.author`
	 * @type {User}
	 * @see {@link Message#author}
	 */
	get author() {
		return this.message.author;
	}

	/**
	 * Shortcut to `this.message.channel`
	 * @type {Channel}
	 * @see {@link Message#channel}
	 */
	get channel() {
		return this.message.channel;
	}

	/**
	 * Shortcut to `this.message.guild`
	 * @type {?Guild}
	 * @see {@link Message#guild}
	 */
	get guild() {
		return this.message.guild;
	}

	/**
	 * Shortcut to `this.message.member`
	 * @type {?GuildMember}
	 * @see {@link Message#member}
	 */
	get member() {
		return this.message.member;
	}

	/**
	 * Shortcut to `this.message.pinned`
	 * @type {boolean}
	 * @see {@link Message#pinned}
	 */
	get pinned() {
		return this.message.pinned;
	}

	/**
	 * Shortcut to `this.message.tts`
	 * @type {boolean}
	 * @see {@link Message#tts}
	 */
	get tts() {
		return this.message.tts;
	}

	/**
	 * Shortcut to `this.message.nonce`
	 * @type {string}
	 * @see {@link Message#nonce}
	 */
	get nonce() {
		return this.message.nonce;
	}

	/**
	 * Shortcut to `this.message.system`
	 * @type {boolean}
	 * @see {@link Message#system}
	 */
	get system() {
		return this.message.system;
	}

	/**
	 * Shortcut to `this.message.embeds`
	 * @type {MessageEmbed[]}
	 * @see {@link Message#embeds}
	 */
	get embeds() {
		return this.message.embeds;
	}

	/**
	 * Shortcut to `this.message.attachments`
	 * @type {Collection<string, MessageAttachment>}
	 * @see {@link Message#attachments}
	 */
	get attachments() {
		return this.message.attachments;
	}

	/**
	 * Shortcut to `this.message.reactions`
	 * @type {Collection<string, MessageReaction>}
	 * @see {@link Message#reactions}
	 */
	get reactions() {
		return this.message.reactions;
	}

	/**
	 * Shortcut to `this.message.createdTimestamp`
	 * @type {number}
	 * @see {@link Message#createdTimestamp}
	 */
	get createdTimestamp() {
		return this.message.createdTimestamp;
	}

	/**
	 * Shortcut to `this.message.createdAt`
	 * @type {Date}
	 * @see {@link Message#createdAt}
	 */
	get createdAt() {
		return this.message.createdAt;
	}

	/**
	 * Shortcut to `this.message.editedTimestamp`
	 * @type {number}
	 * @see {@link Message#editedTimestamp}
	 */
	get editedTimestamp() {
		return this.message.editedTimestamp;
	}

	/**
	 * Shortcut to `this.message.editedAt`
	 * @type {Date}
	 * @see {@link Message#editedAt}
	 */
	get editedAt() {
		return this.message.editedAt;
	}

	/**
	 * Shortcut to `this.message.mentions`
	 * @type {Object}
	 * @see {@link Message#mentions}
	 */
	get mentions() {
		return this.message.mentions;
	}

	/**
	 * Shortcut to `this.message.webhookID`
	 * @type {?string}
	 * @see {@link Message#webhookID}
	 */
	get webhookID() {
		return this.message.webhookID;
	}

	/**
	 * Shortcut to `this.message.cleanContent`
	 * @type {string}
	 * @see {@link Message#cleanContent}
	 */
	get cleanContent() {
		return this.message.cleanContent;
	}

	/**
	 * Shortcut to `this.message.edits`
	 * @type {Message[]}
	 * @see {@link Message#edits}
	 */
	get edits() {
		return this.message.edits;
	}

	/**
	 * Shortcut to `this.message.editable`
	 * @type {boolean}
	 * @see {@link Message#editable}
	 */
	get editable() {
		return this.message.editable;
	}

	/**
	 * Shortcut to `this.message.deletable`
	 * @type {boolean}
	 * @see {@link Message#deletable}
	 */
	get deletable() {
		return this.message.deletable;
	}

	/**
	 * Shortcut to `this.message.pinnable`
	 * @type {boolean}
	 * @see {@link Message#pinnable}
	 */
	get pinnable() {
		return this.message.pinnable;
	}

	/**
	 * Shortcut to `this.message.isMentioned(data)`
	 * @param {GuildChannel|User|Role|string} data - A guild channel, user, or a role, or the ID of any of these
	 * @return {boolean}
	 * @see {@link Message#isMentioned}
	 */
	isMentioned(data) {
		return this.message.isMentioned(data);
	}

	/**
	 * Shortcut to `this.message.isMemberMentioned(data)`
	 * @param {GuildMember|User} member - Member/user to check for a mention of
	 * @return {boolean}
	 * @see {@link Message#isMemberMentioned}
	 */
	isMemberMentioned(member) {
		return this.message.isMemberMentioned(member);
	}

	/**
	 * Shortcut to `this.message.edit(content)`
	 * @param {StringResolvable} content - New content for the message
	 * @returns {Promise<Message>}
	 * @see {@link Message#edit}
	 */
	edit(content) {
		return this.message.edit(content);
	}

	/**
	 * Shortcut to `this.message.editCode(content)`
	 * @param {string} lang - Language for the code block
	 * @param {StringResolvable} content - New content for the message
	 * @returns {Promise<Message>}
	 * @see {@link Message#editCode}
	 */
	editCode(lang, content) {
		return this.message.editCode(lang, content);
	}

	/**
	 * Shortcut to `this.message.react()`
	 * @param {string|Emoji|ReactionEmoji} emoji - Emoji to react with
	 * @returns {Promise<MessageReaction>}
	 * @see {@link Message#react}
	 */
	react(emoji) {
		return this.message.react(emoji);
	}

	/**
	 * Shortcut to `this.message.clearReactions()`
	 * @returns {Promise<Message>}
	 * @see {@link Message#clearReactions}
	 */
	clearReactions() {
		return this.message.clearReactions();
	}

	/**
	 * Shortcut to `this.message.pin()`
	 * @returns {Promise<Message>}
	 * @see {@link Message#pin}
	 */
	pin() {
		return this.message.pin();
	}

	/**
	 * Shortcut to `this.message.unpin()`
	 * @returns {Promise<Message>}
	 * @see {@link Message#unpin}
	 */
	unpin() {
		return this.message.unpin();
	}

	/**
	 * Shortcut to `this.message.delete()`
	 * @param {number} [timeout=0] - How long to wait to delete the message in milliseconds
	 * @returns {Promise<Message>}
	 * @see {@link Message#delete}
	 */
	delete(timeout) {
		return this.message.delete(timeout);
	}

	/**
	 * Shortcut to `this.message.fetchWebhook()`
	 * @returns {Promise<?Webhook>}
	 * @see {@link Message#fetchWebhook}
	 */
	fetchWebhook() {
		return this.message.fetchWebhook();
	}
}

/**
 * Silently cancels a running command
 * @type {symbol}
 */
CommandMessage.SILENT_CANCEL = Symbol('silent command cancel');

/**
 * Cancels a running command with a format error
 * @type {symbol}
 */
CommandMessage.FORMAT_CANCEL = Symbol('format command cancel');

function channelIDOrDM(channel) {
	if(channel.type !== 'dm') return channel.id;
	return 'dm';
}

module.exports = CommandMessage;
