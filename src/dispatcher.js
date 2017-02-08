const escapeRegex = require('escape-string-regexp');
const CommandMessage = require('./commands/message');

/** Handles parsing messages and running commands from them */
class CommandDispatcher {
	/**
	 * @param {CommandoClient} client - Client the dispatcher is for
	 * @param {CommandRegistry} registry - Registry the dispatcher will use
	 */
	constructor(client, registry) {
		/**
		 * Client this dispatcher handles messages for
		 * @name CommandDispatcher#client
		 * @type {CommandoClient}
		 * @readonly
		 */
		Object.defineProperty(this, 'client', { value: client });

		/**
		 * Registry this dispatcher uses
		 * @type {CommandRegistry}
		 */
		this.registry = registry;

		/**
		 * Functions that can block commands from running
		 * @type {Set<function>}
		 */
		this.inhibitors = new Set();

		/**
		 * Map object of {@link RegExp}s that match command messages, mapped by string prefix
		 * @type {Object}
		 * @private
		 */
		this._commandPatterns = {};

		/**
		 * Old command message results, mapped by original message ID
		 * @type {Map<string, CommandMessage>}
		 * @private
		 */
		this._results = new Map();

		/**
		 * Tuples in string form of user ID and channel ID that are currently awaiting messages from a user in a channel
		 * @type {Set<string>}
		 * @private
		 */
		this._awaiting = new Set();
	}

	/**
	 * A function that can block the usage of a command - these functions are passed the command message that is
	 * triggering the command. They should return `false` if the command should *not* be blocked. If the command *should*
	 * be blocked, they should return one of the following:
	 * - A single string identifying the reason the command is blocked
	 * - An array of the above string as element 0, and a response promise or `null` as element 1
	 * @typedef {Function} Inhibitor
	 */

	/**
	 * Adds an inhibitor
	 * @param {Inhibitor} inhibitor - The inhibitor function to add
	 * @return {boolean} Whether the addition was successful
	 * @example
	 * client.dispatcher.addInhibitor(msg => {
	 *   if(blacklistedUsers.has(msg.author.id)) return 'blacklisted';
	 * });
	 * @example
	 * client.dispatcher.addInhibitor(msg => {
	 * 	if(!coolUsers.has(msg.author.id)) return ['cool', msg.reply('You\'re not cool enough!')];
	 * });
	 */
	addInhibitor(inhibitor) {
		if(typeof inhibitor !== 'function') throw new TypeError('The inhibitor must be a function.');
		if(this.inhibitors.has(inhibitor)) return false;
		this.inhibitors.add(inhibitor);
		return true;
	}

	/**
	 * Removes an inhibitor
	 * @param {Inhibitor} inhibitor - The inhibitor function to remove
	 * @return {boolean} Whether the removal was successful
	 */
	removeInhibitor(inhibitor) {
		if(typeof inhibitor !== 'function') throw new TypeError('The inhibitor must be a function.');
		return this.inhibitors.delete(inhibitor);
	}

	// eslint-disable-next-line valid-jsdoc
	/**
	 * Handle a new message or a message update
	 * @param {Message} message - The message to handle
	 * @param {Message} [oldMessage] - The old message before the update
	 * @return {Promise<void>}
	 * @private
	 */
	async handleMessage(message, oldMessage) {
		if(!this.shouldHandleMessage(message, oldMessage)) return;

		// Parse the message, and get the old result if it exists
		let cmdMsg, oldCmdMsg;
		if(oldMessage) {
			oldCmdMsg = this._results.get(oldMessage.id);
			if(!oldCmdMsg && !this.client.options.nonCommandEditable) return;
			cmdMsg = this.parseMessage(message);
			if(cmdMsg && oldCmdMsg) {
				cmdMsg.responses = oldCmdMsg.responses;
				cmdMsg.responsePositions = oldCmdMsg.responsePositions;
			}
		} else {
			cmdMsg = this.parseMessage(message);
		}

		// Run the command, or reply with an error
		let responses;
		if(cmdMsg) {
			const inhibited = this.inhibit(cmdMsg);

			if(!inhibited) {
				if(cmdMsg.command) {
					if(!cmdMsg.command.isEnabledIn(message.guild)) {
						responses = await cmdMsg.reply(`The \`${cmdMsg.command.name}\` command is disabled.`);
					} else if(!oldMessage || typeof oldCmdMsg !== 'undefined') {
						responses = await cmdMsg.run();
						if(typeof responses === 'undefined') responses = null; // eslint-disable-line max-depth
					}
				} else {
					/**
					 * Emitted when an unknown command is triggered
					 * @event CommandoClient#unknownCommand
					 * @param {CommandMessage} message - Command message that triggered the command
					 */
					this.client.emit('unknownCommand', cmdMsg);
					if(this.client.options.unknownCommandResponse) {
						responses = await cmdMsg.reply(
							`Unknown command. Use ${cmdMsg.anyUsage(
								'help',
								message.guild ? undefined : null,
								message.guild ? undefined : null
							)} to view the list of all commands.`
						);
					}
				}
			} else {
				responses = await inhibited[1];
			}

			cmdMsg.finalize(responses);
		} else if(oldCmdMsg) {
			oldCmdMsg.finalize(null);
			if(!this.client.options.nonCommandEditable) this._results.delete(message.id);
		}

		this.cacheCommandMessage(message, oldMessage, cmdMsg, responses);
	}

	/**
	 * Check whether a message should be handled
	 * @param {Message} message - The message to handle
	 * @param {Message} [oldMessage] - The old message before the update
	 * @return {boolean}
	 * @private
	 */
	shouldHandleMessage(message, oldMessage) {
		if(message.author.bot) return false;
		else if(this.client.options.selfbot && message.author.id !== this.client.user.id) return false;
		else if(!this.client.options.selfbot && message.author.id === this.client.user.id) return false;

		// Ignore messages from users that the bot is already waiting for input from
		if(this._awaiting.has(message.author.id + message.channel.id)) return false;

		// Make sure the edit actually changed the message content
		if(oldMessage && message.content === oldMessage.content) return false;

		return true;
	}

	/**
	 * Inhibits a command message
	 * @param {CommandMessage} cmdMsg - Command message to inhibit
	 * @return {?Array} [reason, ?response]
	 * @private
	 */
	inhibit(cmdMsg) {
		for(const inhibitor of this.inhibitors) {
			const inhibited = inhibitor(cmdMsg);
			if(inhibited) {
				this.client.emit('commandBlocked', cmdMsg, inhibited instanceof Array ? inhibited[0] : inhibited);
				return inhibited instanceof Array ? inhibited : [inhibited, undefined];
			}
		}
		return null;
	}

	/**
	 * Caches a command message to be editable
	 * @param {Message} message - Triggering message
	 * @param {Message} oldMessage - Triggering message's old version
	 * @param {CommandMessage} cmdMsg - Command message to cache
	 * @param {Message|Message[]} responses - Responses to the message
	 * @private
	 */
	cacheCommandMessage(message, oldMessage, cmdMsg, responses) {
		if(this.client.options.commandEditableDuration <= 0) return;
		if(!cmdMsg && !this.client.options.nonCommandEditable) return;
		if(responses !== null) {
			this._results.set(message.id, cmdMsg);
			if(!oldMessage) {
				setTimeout(() => { this._results.delete(message.id); }, this.client.options.commandEditableDuration * 1000);
			}
		} else {
			this._results.delete(message.id);
		}
	}

	/**
	 * Parses a message to find details about command usage in it
	 * @param {Message} message - The message
	 * @return {?CommandMessage}
	 * @private
	 */
	parseMessage(message) {
		// Find the command to run by patterns
		for(const command of this.registry.commands) {
			if(!command.patterns) continue;
			for(const pattern of command.patterns) {
				const matches = pattern.exec(message.content);
				if(matches) return new CommandMessage(message, command, null, matches);
			}
		}

		// Find the command to run with default command handling
		const prefix = message.guild ? message.guild.commandPrefix : this.client.commandPrefix;
		if(!this._commandPatterns[prefix]) this.buildCommandPattern(prefix);
		let cmdMsg = this.matchDefault(message, this._commandPatterns[prefix], 2);
		if(!cmdMsg && !message.guild && !this.client.options.selfbot) cmdMsg = this.matchDefault(message, /^([^\s]+)/i);
		return cmdMsg;
	}

	/**
	 * Matches a message against a guild command pattern
	 * @param {Message} message - The message
	 * @param {RegExp} pattern - The pattern to match against
	 * @param {number} commandNameIndex - The index of the command name in the pattern matches
	 * @return {?CommandMessage}
	 * @private
	 */
	matchDefault(message, pattern, commandNameIndex = 1) {
		const matches = pattern.exec(message.content);
		if(!matches) return null;
		const commands = this.registry.findCommands(matches[commandNameIndex], true);
		if(commands.length !== 1 || !commands[0].defaultHandling) return new CommandMessage(message, null);
		const argString = message.content.substring(matches[1].length + (matches[2] ? matches[2].length : 0));
		return new CommandMessage(message, commands[0], argString);
	}

	/**
	 * Creates a regular expression to match the command prefix and name in a message
	 * @param {?string} prefix - Prefix to build the pattern for
	 * @return {RegExp}
	 * @private
	 */
	buildCommandPattern(prefix) {
		let pattern;
		if(prefix) {
			const escapedPrefix = escapeRegex(prefix);
			pattern = new RegExp(
				`^(${escapedPrefix}\\s*|<@!?${this.client.user.id}>\\s+(?:${escapedPrefix})?)([^\\s]+)`, 'i'
			);
		} else {
			pattern = new RegExp(`(^<@!?${this.client.user.id}>\\s+)([^\\s]+)`, 'i');
		}
		this._commandPatterns[prefix] = pattern;
		this.client.emit('debug', `Built command pattern for prefix "${prefix}": ${pattern}`);
		return pattern;
	}
}

module.exports = CommandDispatcher;
