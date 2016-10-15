const EventEmitter = require('events').EventEmitter;
const escapeRegex = require('escape-string-regexp');
const Command = require('./command');
const CommandMessage = require('./command-message');

/** Handles parsing messages and running commands from them */
class CommandDispatcher extends EventEmitter {
	/**
	 * @param {CommandoClient} client - Client the dispatcher is for
	 * @param {CommandRegistry} registry - Registry the dispatcher will use
	 */
	constructor(client, registry) {
		super();

		/**
		 * Client this dispatcher handles messages for
		 * @type {CommandoClient}
		 */
		this.client = client;

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

		this._commandPatterns = {};
		this._results = new Map();
	}

	/**
	 * A function that can block the usage of a command - these functions are passed the command message that is
	 * triggering the command. They should return `false` if the command should *not* be blocked. If the command *should*
	 * be blocked, they should return one of the following:
	 * - A single string identifying the reason the command is blocked
	 * - An array of the above string as element 0, and a response promise or `null` as element 1
	 * @typedef {function} Inhibitor
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
		if(message.author.bot) return;
		else if(this.client.options.selfbot && message.author.id !== this.client.user.id) return;
		else if(!this.client.options.selfbot && message.author.id === this.client.user.id) return;

		// Make sure the edit actually changed the message content
		if(oldMessage && message.content === oldMessage.content) return;

		// Parse the message, and get the old result if it exists
		let cmdMsg = this.parseMessage(message);
		let oldCmdMsg;
		if(oldMessage) {
			oldCmdMsg = this._results.get(oldMessage.id);
			if(cmdMsg && oldCmdMsg) {
				cmdMsg.responses = oldCmdMsg.responses;
				cmdMsg.responsePositions = oldCmdMsg.responsePositions;
			}
		}

		// Run the command, or reply with an error
		let responses;
		if(cmdMsg) {
			const inhibited = this.inhibit(cmdMsg);

			if(!inhibited) {
				if(cmdMsg.command) {
					if(message.guild && !message.guild.isCommandEnabled(cmdMsg.command)) {
						responses = await cmdMsg.reply(`The \`${cmdMsg.command.name}\` command is disabled.`);
					} else if(!oldMessage || typeof oldCmdMsg !== 'undefined') {
						responses = await cmdMsg.run();
						if(typeof responses === 'undefined') responses = null;
					}
				} else {
					this.client.emit('unknownCommand', cmdMsg);
					responses = await cmdMsg.reply(
						`Unknown command. Use ${Command.usage(
							'help', message.guild ? message.guild.commandPrefix : null, message.guild ? this.client.user : null
						)} to view the list of all commands.`
					);
				}
			} else {
				responses = await inhibited[1];
			}

			cmdMsg._finalize(responses);
		} else if(oldCmdMsg) {
			oldCmdMsg._finalize(null);
			if(this.client.options.nonCommandEditable <= 0) this._results.delete(message.id);
		}

		this.cacheCommandMessage(message, oldMessage, cmdMsg, responses);
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
		if(this.client.options.commandEditableDuration > 0) {
			if(cmdMsg || this.client.options.nonCommandEditable) {
				if(responses !== null) {
					this._results.set(message.id, cmdMsg);
					if(!oldMessage) {
						setTimeout(() => { this._results.delete(message.id); }, this.client.options.commandEditableDuration * 1000);
					}
				} else {
					this._results.delete(message.id);
				}
			}
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
		for(const command of this.client.registry.commands) {
			if(!command.patterns) continue;
			for(const pattern of command.patterns) {
				const matches = pattern.exec(message.content);
				if(matches) return new CommandMessage(message, command, null, matches);
			}
		}

		// Find the command to run with default command handling
		const gp = message.guild ? message.guild.id : 'global';
		if(!this._commandPatterns[gp]) this.buildCommandPattern(message.guild);
		let cmdMsg = this.matchDefault(message, this._commandPatterns[gp], 2);
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
		const commands = this.client.registry.findCommands(matches[commandNameIndex], true);
		if(commands.length !== 1 || !commands[0].defaultHandling) return new CommandMessage(message, null);
		const argString = message.content.substring(matches[1].length + (matches[2] ? matches[2].length : 0));
		return new CommandMessage(message, commands[0], argString);
	}

	/**
	 * Creates a regular expression to match the command prefix and name in a message
	 * @param {?Guild} guild - The Guild that the message is from
	 * @return {RegExp}
	 * @private
	 */
	buildCommandPattern(guild) {
		let prefix = guild ? guild.commandPrefix : this.client.options.commandPrefix;
		if(prefix === 'none') prefix = '';
		const escapedPrefix = escapeRegex(prefix);
		const prefixPatternPiece = prefix ? `${escapedPrefix}\\s*|` : '';
		const pattern = new RegExp(
			`^(${prefixPatternPiece}<@!?${this.client.user.id}>\\s+(?:${escapedPrefix})?)([^\\s]+)`, 'i'
		);
		this._commandPatterns[guild ? guild.id : 'global'] = pattern;
		this.client.emit('commandPatternBuilt', guild, prefix, pattern);
		return pattern;
	}
}

module.exports = CommandDispatcher;
