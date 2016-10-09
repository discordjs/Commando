const EventEmitter = require('events').EventEmitter;
const escapeRegex = require('escape-string-regexp');
const Command = require('./command');
const CommandMessage = require('./command-message');

/** Handles parsing messages and running commands from them */
module.exports = class CommandDispatcher extends EventEmitter {
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

		this._guildCommandPatterns = {};
		this._results = new Map();
	}

	/**
	 * Handle a new message or a message update
	 * @param {Message} message - The message to handle
	 * @param {Message} [oldMessage] - The old message before the update
	 * @return {Promise<void>}
	 */
	async handleMessage(message, oldMessage) {
		if(message.author.bot) return;
		else if(this.client.options.selfbot && message.author.id !== this.client.user.id) return;
		else if(!this.client.options.selfbot && message.author.id === this.client.user.id) return;

		// Make sure the edit actually changed the message content
		if(oldMessage && message.content === oldMessage.content) return;

		// Parse the message, and get the old result if it exists
		let cmdMsg = this._parseMessage(message);
		let oldCmdMsg;
		if(oldMessage) {
			oldCmdMsg = this._results.get(oldMessage.id);
			if(cmdMsg && oldCmdMsg) cmdMsg.responses = oldCmdMsg.responses;
		}

		// Run the command, or reply with an error
		let responses;
		if(cmdMsg) {
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
					`Unknown command. Use ${Command.usage(this.client, 'help', message.guild)} to view the list of all commands.`
				);
			}

			cmdMsg._finalize(responses);
		} else if(oldCmdMsg && this.client.options.nonCommandEditable) {
			cmdMsg = oldCmdMsg;
			cmdMsg._finalize(null);
		}

		// Cache the message
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
	 */
	_parseMessage(message) {
		// Find the command to run by patterns
		for(const command of this.client.registry.commands) {
			if(!command.patterns) continue;
			for(const pattern of command.patterns) {
				const matches = pattern.exec(message.content);
				if(matches) return new CommandMessage(message, command, null, matches);
			}
		}

		// Find the command to run with default command handling
		const gp = message.guild ? message.guild.id : '-';
		if(!this._guildCommandPatterns[gp]) this._guildCommandPatterns[gp] = this._buildCommandPattern(message.guild);
		let cmdMsg = this._matchDefault(message, this._guildCommandPatterns[gp], 2);
		if(!cmdMsg && !message.guild && !this.client.options.selfbot) cmdMsg = this._matchDefault(message, /^([^\s]+)/i);
		return cmdMsg;
	}

	/**
	 * Matches a message against a guild command pattern
	 * @param {Message} message - The message
	 * @param {RegExp} pattern - The pattern to match against
	 * @param {number} commandNameIndex - The index of the command name in the pattern matches
	 * @return {?CommandMessage}
	 */
	_matchDefault(message, pattern, commandNameIndex = 1) {
		const matches = pattern.exec(message.content);
		if(!matches) return null;
		const commands = this.client.registry.findCommands(matches[commandNameIndex]);
		if(commands.length !== 1 || !commands[0].defaultHandling) return new CommandMessage(message, null);
		const argString = message.content.substring(matches[1].length + (matches[2] ? matches[2].length : 0));
		return new CommandMessage(message, commands[0], argString);
	}

	/**
	 * Creates a regular expression to match the command prefix and name in a message
	 * @param {?Guild} guild - The Guild that the message is from
	 * @return {RegExp}
	 */
	_buildCommandPattern(guild) {
		let prefix = guild ? guild.commandPrefix : this.client.options.commandPrefix;
		if(prefix === 'none') prefix = '';
		const escapedPrefix = escapeRegex(prefix);
		const prefixPatternPiece = prefix ? `${escapedPrefix}\\s*|` : '';
		const pattern = new RegExp(
			`^(${prefixPatternPiece}<@!?${this.client.user.id}>\\s+(?:${escapedPrefix})?)([^\\s]+)`, 'i'
		);
		this.client.emit('commandPatternBuilt', guild, prefix, pattern);
		return pattern;
	}
};

/**
 * @typedef {Object} CommandResult
 * @property {string[]} [plain] - Strings to send plain messages for
 * @property {string[]} [reply] - Strings to send reply messages for
 * @property {string[]} [direct] - Strings to send direct messages for
 * @property {boolean} [editable=true] - Whether or not the command message is editable
 */
