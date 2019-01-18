const path = require('path');
const { escapeMarkdown } = require('discord.js');
const { oneLine, stripIndents } = require('common-tags');
const ArgumentCollector = require('./collector');
const { permissions } = require('../util');

/** A command that can be run in a client */
class Command {
	/**
	 * @typedef {Object} ThrottlingOptions
	 * @property {number} usages - Maximum number of usages of the command allowed in the time frame.
	 * @property {number} duration - Amount of time to count the usages of the command within (in seconds).
	 */

	/**
	 * @typedef {Object} CommandInfo
	 * @property {string} name - The name of the command (must be lowercase)
	 * @property {string[]} [aliases] - Alternative names for the command (all must be lowercase)
	 * @property {boolean} [autoAliases=true] - Whether automatic aliases should be added
	 * @property {string} group - The ID of the group the command belongs to (must be lowercase)
	 * @property {string} memberName - The member name of the command in the group (must be lowercase)
	 * @property {string} description - A short description of the command
	 * @property {string} [format] - The command usage format string - will be automatically generated if not specified,
	 * and `args` is specified
	 * @property {string} [details] - A detailed description of the command and its functionality
	 * @property {string[]} [examples] - Usage examples of the command
	 * @property {boolean} [guildOnly=false] - Whether or not the command should only function in a guild channel
	 * @property {boolean} [ownerOnly=false] - Whether or not the command is usable only by an owner
	 * @property {PermissionResolvable[]} [clientPermissions] - Permissions required by the client to use the command.
	 * @property {PermissionResolvable[]} [userPermissions] - Permissions required by the user to use the command.
	 * @property {boolean} [nsfw=false] - Whether the command is usable only in NSFW channels.
	 * @property {ThrottlingOptions} [throttling] - Options for throttling usages of the command.
	 * @property {boolean} [defaultHandling=true] - Whether or not the default command handling should be used.
	 * If false, then only patterns will trigger the command.
	 * @property {ArgumentInfo[]} [args] - Arguments for the command.
	 * @property {number} [argsPromptLimit=Infinity] - Maximum number of times to prompt a user for a single argument.
	 * Only applicable if `args` is specified.
	 * @property {string} [argsType=single] - One of 'single' or 'multiple'. Only applicable if `args` is not specified.
	 * When 'single', the entire argument string will be passed to run as one argument.
	 * When 'multiple', it will be passed as multiple arguments.
	 * @property {number} [argsCount=0] - The number of arguments to parse from the command string.
	 * Only applicable when argsType is 'multiple'. If nonzero, it should be at least 2.
	 * When this is 0, the command argument string will be split into as many arguments as it can be.
	 * When nonzero, it will be split into a maximum of this number of arguments.
	 * @property {boolean} [argsSingleQuotes=true] - Whether or not single quotes should be allowed to box-in arguments
	 * in the command string.
	 * @property {RegExp[]} [patterns] - Patterns to use for triggering the command
	 * @property {boolean} [guarded=false] - Whether the command should be protected from disabling
	 * @property {boolean} [hidden=false] - Whether the command should be hidden from the help command
	 * @property {boolean} [unknown=false] - Whether the command should be run when an unknown command is used - there
	 * may only be one command registered with this property as `true`.
	 */

	/**
	 * @param {CommandoClient} client - The client the command is for
	 * @param {CommandInfo} info - The command information
	 */
	// eslint-disable-next-line complexity
	constructor(client, info) {
		this.constructor.validateInfo(client, info);

		/**
		 * Client that this command is for
		 * @name Command#client
		 * @type {CommandoClient}
		 * @readonly
		 */
		Object.defineProperty(this, 'client', { value: client });

		/**
		 * Name of this command
		 * @type {string}
		 */
		this.name = info.name;

		/**
		 * Aliases for this command
		 * @type {string[]}
		 */
		this.aliases = info.aliases || [];
		if(typeof info.autoAliases === 'undefined' || info.autoAliases) {
			if(this.name.includes('-')) this.aliases.push(this.name.replace(/-/g, ''));
			for(const alias of this.aliases) {
				if(alias.includes('-')) this.aliases.push(alias.replace(/-/g, ''));
			}
		}

		/**
		 * ID of the group the command belongs to
		 * @type {string}
		 */
		this.groupID = info.group;

		/**
		 * The group the command belongs to, assigned upon registration
		 * @type {?CommandGroup}
		 */
		this.group = null;

		/**
		 * Name of the command within the group
		 * @type {string}
		 */
		this.memberName = info.memberName;

		/**
		 * Short description of the command
		 * @type {string}
		 */
		this.description = info.description;

		/**
		 * Usage format string of the command
		 * @type {string}
		 */
		this.format = info.format || null;

		/**
		 * Long description of the command
		 * @type {?string}
		 */
		this.details = info.details || null;

		/**
		 * Example usage strings
		 * @type {?string[]}
		 */
		this.examples = info.examples || null;

		/**
		 * Whether the command can only be run in a guild channel
		 * @type {boolean}
		 */
		this.guildOnly = Boolean(info.guildOnly);

		/**
		 * Whether the command can only be used by an owner
		 * @type {boolean}
		 */
		this.ownerOnly = Boolean(info.ownerOnly);

		/**
		 * Permissions required by the client to use the command.
		 * @type {?PermissionResolvable[]}
		 */
		this.clientPermissions = info.clientPermissions || null;

		/**
		 * Permissions required by the user to use the command.
		 * @type {?PermissionResolvable[]}
		 */
		this.userPermissions = info.userPermissions || null;

		/**
		 * Whether the command can only be used in NSFW channels
		 * @type {boolean}
		 */
		this.nsfw = Boolean(info.nsfw);

		/**
		 * Whether the default command handling is enabled for the command
		 * @type {boolean}
		 */
		this.defaultHandling = 'defaultHandling' in info ? info.defaultHandling : true;

		/**
		 * Options for throttling command usages
		 * @type {?ThrottlingOptions}
		 */
		this.throttling = info.throttling || null;

		/**
		 * The argument collector for the command
		 * @type {?ArgumentCollector}
		 */
		this.argsCollector = info.args && info.args.length ?
			new ArgumentCollector(client, info.args, info.argsPromptLimit) :
			null;
		if(this.argsCollector && typeof info.format === 'undefined') {
			this.format = this.argsCollector.args.reduce((prev, arg) => {
				const wrapL = arg.default !== null ? '[' : '<';
				const wrapR = arg.default !== null ? ']' : '>';
				return `${prev}${prev ? ' ' : ''}${wrapL}${arg.label}${arg.infinite ? '...' : ''}${wrapR}`;
			}, '');
		}

		/**
		 * How the arguments are split when passed to the command's run method
		 * @type {string}
		 */
		this.argsType = info.argsType || 'single';

		/**
		 * Maximum number of arguments that will be split
		 * @type {number}
		 */
		this.argsCount = info.argsCount || 0;

		/**
		 * Whether single quotes are allowed to encapsulate an argument
		 * @type {boolean}
		 */
		this.argsSingleQuotes = 'argsSingleQuotes' in info ? info.argsSingleQuotes : true;

		/**
		 * Regular expression triggers
		 * @type {RegExp[]}
		 */
		this.patterns = info.patterns || null;

		/**
		 * Whether the command is protected from being disabled
		 * @type {boolean}
		 */
		this.guarded = Boolean(info.guarded);

		/**
		 * Whether the command should be hidden from the help command
		 * @type {boolean}
		 */
		this.hidden = Boolean(info.hidden);

		/**
		 * Whether the command will be run when an unknown command is used
		 * @type {boolean}
		 */
		this.unknown = Boolean(info.unknown);

		/**
		 * Whether the command is enabled globally
		 * @type {boolean}
		 * @private
		 */
		this._globalEnabled = true;

		/**
		 * Current throttle objects for the command, mapped by user ID
		 * @type {Map<string, Object>}
		 * @private
		 */
		this._throttles = new Map();
	}

	/**
	 * Checks if the user has permission to use the command
	 * @param {CommandoMessage} message - The triggering command message
	 * @param {boolean} [ownerOverride=true] - Whether the bot owner(s) will always have permission
	 * @return {boolean|string} Whether the user has permission, or an error message to respond with if they don't
	 */
	hasPermission(message, ownerOverride = true) {
		if(!this.ownerOnly && !this.userPermissions) return true;
		if(ownerOverride && this.client.isOwner(message.author)) return true;

		if(this.ownerOnly && (ownerOverride || !this.client.isOwner(message.author))) {
			return `The \`${this.name}\` command can only be used by the bot owner.`;
		}

		if(message.channel.type === 'text' && this.userPermissions) {
			const missing = message.channel.permissionsFor(message.author).missing(this.userPermissions);
			if(missing.length > 0) {
				if(missing.length === 1) {
					return `The \`${this.name}\` command requires you to have the "${permissions[missing[0]]}" permission.`;
				}
				return oneLine`
					The \`${this.name}\` command requires you to have the following permissions:
					${missing.map(perm => permissions[perm]).join(', ')}
				`;
			}
		}

		return true;
	}

	/**
	 * Runs the command
	 * @param {CommandoMessage} message - The message the command is being run for
	 * @param {Object|string|string[]} args - The arguments for the command, or the matches from a pattern.
	 * If args is specified on the command, thise will be the argument values object. If argsType is single, then only
	 * one string will be passed. If multiple, an array of strings will be passed. When fromPattern is true, this is the
	 * matches array from the pattern match
	 * (see [RegExp#exec](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec)).
	 * @param {boolean} fromPattern - Whether or not the command is being run from a pattern match
	 * @return {Promise<?Message|?Array<Message>>}
	 * @abstract
	 */
	async run(message, args, fromPattern) { // eslint-disable-line no-unused-vars, require-await
		throw new Error(`${this.constructor.name} doesn't have a run() method.`);
	}

	/**
	 * Called when the command is prevented from running
	 * @param {CommandMessage} message - Command message that the command is running from
	 * @param {string} reason - Reason that the command was blocked
	 * (built-in reasons are `guildOnly`, `nsfw`, `permission`, `throttling`, and `clientPermissions`)
	 * @param {Object} [data] - Additional data associated with the block. Built-in reason data properties:
	 * - guildOnly: none
	 * - nsfw: none
	 * - permission: `response` ({@link string}) to send
	 * - throttling: `throttle` ({@link Object}), `remaining` ({@link number}) time in seconds
	 * - clientPermissions: `missing` ({@link Array}<{@link string}>) permission names
	 * @returns {Promise<?Message|?Array<Message>>}
	 */
	onBlocked(message, reason, data) { // eslint-disable-line no-unused-vars
		switch(reason) {
			case 'guildOnly':
				return message.reply(`The \`${this.name}\` command must be used in a server channel.`);
			case 'nsfw':
				return message.reply(`The \`${this.name}\` command can only be used in NSFW channels.`);
			case 'permission': {
				if(data.response) return message.reply(data.response);
				return message.reply(`You do not have permission to use the \`${this.name}\` command.`);
			}
			case 'clientPermissions': {
				if(data.missing.length === 1) {
					return message.reply(
						`I need the "${permissions[data.missing[0]]}" permission for the \`${this.name}\` command to work.`
					);
				}
				return message.reply(oneLine`
					I need the following permissions for the \`${this.name}\` command to work:
					${data.missing.map(perm => permissions[perm]).join(', ')}
				`);
			}
			case 'throttling': {
				return message.reply(
					`You may not use the \`${this.name}\` command again for another ${data.remaining.toFixed(1)} seconds.`
				);
			}
			default:
				return null;
		}
	}

	/**
	 * Called when the command produces an error while running
	 * @param {Error} err - Error that was thrown
	 * @param {CommandMessage} message - Command message that the command is running from (see {@link Command#run})
	 * @param {Object|string|string[]} args - Arguments for the command (see {@link Command#run})
	 * @param {boolean} fromPattern - Whether the args are pattern matches (see {@link Command#run})
	 * @returns {Promise<?Message|?Array<Message>>}
	 */
	onError(err, message, args, fromPattern) { // eslint-disable-line no-unused-vars
		const owners = this.client.owners;
		const ownerList = owners ? owners.map((usr, i) => {
			const or = i === owners.length - 1 && owners.length > 1 ? 'or ' : '';
			return `${or}${escapeMarkdown(usr.username)}#${usr.discriminator}`;
		}).join(owners.length > 2 ? ', ' : ' ') : '';

		const invite = this.client.options.invite;
		return message.reply(stripIndents`
			An error occurred while running the command: \`${err.name}: ${err.message}\`
			You shouldn't ever receive an error like this.
			Please contact ${ownerList || 'the bot owner'}${invite ? ` in this server: ${invite}` : '.'}
		`);
	}

	/**
	 * Creates/obtains the throttle object for a user, if necessary (owners are excluded)
	 * @param {string} userID - ID of the user to throttle for
	 * @return {?Object}
	 * @private
	 */
	throttle(userID) {
		if(!this.throttling || this.client.isOwner(userID)) return null;

		let throttle = this._throttles.get(userID);
		if(!throttle) {
			throttle = {
				start: Date.now(),
				usages: 0,
				timeout: this.client.setTimeout(() => {
					this._throttles.delete(userID);
				}, this.throttling.duration * 1000)
			};
			this._throttles.set(userID, throttle);
		}

		return throttle;
	}

	/**
	 * Enables or disables the command in a guild
	 * @param {?GuildResolvable} guild - Guild to enable/disable the command in
	 * @param {boolean} enabled - Whether the command should be enabled or disabled
	 */
	setEnabledIn(guild, enabled) {
		if(typeof guild === 'undefined') throw new TypeError('Guild must not be undefined.');
		if(typeof enabled === 'undefined') throw new TypeError('Enabled must not be undefined.');
		if(this.guarded) throw new Error('The command is guarded.');
		if(!guild) {
			this._globalEnabled = enabled;
			this.client.emit('commandStatusChange', null, this, enabled);
			return;
		}
		guild = this.client.guilds.resolve(guild);
		guild.setCommandEnabled(this, enabled);
	}

	/**
	 * Checks if the command is enabled in a guild
	 * @param {?GuildResolvable} guild - Guild to check in
	 * @param {boolean} [bypassGroup] - Whether to bypass checking the group's status
	 * @return {boolean}
	 */
	isEnabledIn(guild, bypassGroup) {
		if(this.guarded) return true;
		if(!guild) return this.group._globalEnabled && this._globalEnabled;
		guild = this.client.guilds.resolve(guild);
		return (bypassGroup || guild.isGroupEnabled(this.group)) && guild.isCommandEnabled(this);
	}

	/**
	 * Checks if the command is usable for a message
	 * @param {?Message} message - The message
	 * @return {boolean}
	 */
	isUsable(message = null) {
		if(!message) return this._globalEnabled;
		if(this.guildOnly && message && !message.guild) return false;
		const hasPermission = this.hasPermission(message);
		return this.isEnabledIn(message.guild) && hasPermission && typeof hasPermission !== 'string';
	}

	/**
	 * Creates a usage string for the command
	 * @param {string} [argString] - A string of arguments for the command
	 * @param {string} [prefix=this.client.commandPrefix] - Prefix to use for the prefixed command format
	 * @param {User} [user=this.client.user] - User to use for the mention command format
	 * @return {string}
	 */
	usage(argString, prefix = this.client.commandPrefix, user = this.client.user) {
		return this.constructor.usage(`${this.name}${argString ? ` ${argString}` : ''}`, prefix, user);
	}

	/**
	 * Reloads the command
	 */
	reload() {
		let cmdPath, cached, newCmd;
		try {
			cmdPath = this.client.registry.resolveCommandPath(this.groupID, this.memberName);
			cached = require.cache[cmdPath];
			delete require.cache[cmdPath];
			newCmd = require(cmdPath);
		} catch(err) {
			if(cached) require.cache[cmdPath] = cached;
			try {
				cmdPath = path.join(__dirname, this.groupID, `${this.memberName}.js`);
				cached = require.cache[cmdPath];
				delete require.cache[cmdPath];
				newCmd = require(cmdPath);
			} catch(err2) {
				if(cached) require.cache[cmdPath] = cached;
				if(err2.message.includes('Cannot find module')) throw err; else throw err2;
			}
		}

		this.client.registry.reregisterCommand(newCmd, this);
	}

	/**
	 * Unloads the command
	 */
	unload() {
		const cmdPath = this.client.registry.resolveCommandPath(this.groupID, this.memberName);
		if(!require.cache[cmdPath]) throw new Error('Command cannot be unloaded.');
		delete require.cache[cmdPath];
		this.client.registry.unregisterCommand(this);
	}

	/**
	 * Creates a usage string for a command
	 * @param {string} command - A command + arg string
	 * @param {string} [prefix] - Prefix to use for the prefixed command format
	 * @param {User} [user] - User to use for the mention command format
	 * @return {string}
	 */
	static usage(command, prefix = null, user = null) {
		const nbcmd = command.replace(/ /g, '\xa0');
		if(!prefix && !user) return `\`\`${nbcmd}\`\``;

		let prefixPart;
		if(prefix) {
			if(prefix.length > 1 && !prefix.endsWith(' ')) prefix += ' ';
			prefix = prefix.replace(/ /g, '\xa0');
			prefixPart = `\`\`${prefix}${nbcmd}\`\``;
		}

		let mentionPart;
		if(user) mentionPart = `\`\`@${user.username.replace(/ /g, '\xa0')}#${user.discriminator}\xa0${nbcmd}\`\``;

		return `${prefixPart || ''}${prefix && user ? ' or ' : ''}${mentionPart || ''}`;
	}

	/**
	 * Validates the constructor parameters
	 * @param {CommandoClient} client - Client to validate
	 * @param {CommandInfo} info - Info to validate
	 * @private
	 */
	static validateInfo(client, info) { // eslint-disable-line complexity
		if(!client) throw new Error('A client must be specified.');
		if(typeof info !== 'object') throw new TypeError('Command info must be an Object.');
		if(typeof info.name !== 'string') throw new TypeError('Command name must be a string.');
		if(info.name !== info.name.toLowerCase()) throw new Error('Command name must be lowercase.');
		if(info.aliases && (!Array.isArray(info.aliases) || info.aliases.some(ali => typeof ali !== 'string'))) {
			throw new TypeError('Command aliases must be an Array of strings.');
		}
		if(info.aliases && info.aliases.some(ali => ali !== ali.toLowerCase())) {
			throw new RangeError('Command aliases must be lowercase.');
		}
		if(typeof info.group !== 'string') throw new TypeError('Command group must be a string.');
		if(info.group !== info.group.toLowerCase()) throw new RangeError('Command group must be lowercase.');
		if(typeof info.memberName !== 'string') throw new TypeError('Command memberName must be a string.');
		if(info.memberName !== info.memberName.toLowerCase()) throw new Error('Command memberName must be lowercase.');
		if(typeof info.description !== 'string') throw new TypeError('Command description must be a string.');
		if('format' in info && typeof info.format !== 'string') throw new TypeError('Command format must be a string.');
		if('details' in info && typeof info.details !== 'string') throw new TypeError('Command details must be a string.');
		if(info.examples && (!Array.isArray(info.examples) || info.examples.some(ex => typeof ex !== 'string'))) {
			throw new TypeError('Command examples must be an Array of strings.');
		}
		if(info.clientPermissions) {
			if(!Array.isArray(info.clientPermissions)) {
				throw new TypeError('Command clientPermissions must be an Array of permission key strings.');
			}
			for(const perm of info.clientPermissions) {
				if(!permissions[perm]) throw new RangeError(`Invalid command clientPermission: ${perm}`);
			}
		}
		if(info.userPermissions) {
			if(!Array.isArray(info.userPermissions)) {
				throw new TypeError('Command userPermissions must be an Array of permission key strings.');
			}
			for(const perm of info.userPermissions) {
				if(!permissions[perm]) throw new RangeError(`Invalid command userPermission: ${perm}`);
			}
		}
		if(info.throttling) {
			if(typeof info.throttling !== 'object') throw new TypeError('Command throttling must be an Object.');
			if(typeof info.throttling.usages !== 'number' || isNaN(info.throttling.usages)) {
				throw new TypeError('Command throttling usages must be a number.');
			}
			if(info.throttling.usages < 1) throw new RangeError('Command throttling usages must be at least 1.');
			if(typeof info.throttling.duration !== 'number' || isNaN(info.throttling.duration)) {
				throw new TypeError('Command throttling duration must be a number.');
			}
			if(info.throttling.duration < 1) throw new RangeError('Command throttling duration must be at least 1.');
		}
		if(info.args && !Array.isArray(info.args)) throw new TypeError('Command args must be an Array.');
		if('argsPromptLimit' in info && typeof info.argsPromptLimit !== 'number') {
			throw new TypeError('Command argsPromptLimit must be a number.');
		}
		if('argsPromptLimit' in info && info.argsPromptLimit < 0) {
			throw new RangeError('Command argsPromptLimit must be at least 0.');
		}
		if(info.argsType && !['single', 'multiple'].includes(info.argsType)) {
			throw new RangeError('Command argsType must be one of "single" or "multiple".');
		}
		if(info.argsType === 'multiple' && info.argsCount && info.argsCount < 2) {
			throw new RangeError('Command argsCount must be at least 2.');
		}
		if(info.patterns && (!Array.isArray(info.patterns) || info.patterns.some(pat => !(pat instanceof RegExp)))) {
			throw new TypeError('Command patterns must be an Array of regular expressions.');
		}
	}
}

module.exports = Command;
