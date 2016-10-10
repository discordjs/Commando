/** A command that can be run in a client */
class Command {
	/**
	 * @typedef {Object} CommandInfo
	 * @property {string} name - The name of the command (must be lowercase)
	 * @property {string[]} [aliases] - Alternative names for the command (all must be lowercase)
	 * @property {string} group - The ID of the group the command belongs to (must be lowercase)
	 * @property {string} memberName - The member name of the command in the group (must be lowercase)
	 * @property {string} description - A short description of the command
	 * @property {string} [usage=name] - The command usage format string
	 * @property {string} [details] - A detailed description of the command and its functionality
	 * @property {string[]} [examples] - Usage examples of the command
	 * @property {boolean} [guildOnly=false] - Whether or not the command should only function in a guild channel
	 * @property {boolean} [defaultHandling=true] - Whether or not the default command handling should be used.
	 * If false, then only patterns will trigger the command.
	 * @property {string} [argsType=single] - One of 'single' or 'multiple'.
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
	 */

	/**
	 * @param {CommandoClient} client - The client the command is for
	 * @param {CommandInfo} info - The command information
	 */
	constructor(client, info) { // eslint-disable-line complexity
		if(!client) throw new Error('A client must be specified.');
		if(!info) throw new Error('Command info must be specified.');
		if(!info.name) throw new Error('Command must have a name specified.');
		if(info.name !== info.name.toLowerCase()) throw new Error('Command name must be lowercase.');
		if(info.aliases && !Array.isArray(info.aliases)) throw new TypeError('Command aliases must be an array.');
		if(info.aliases && info.aliases.some(ali => ali !== ali.toLowerCase())) {
			throw new Error('Command aliases must be lowercase.');
		}
		if(!info.group) throw new Error('Command must have a group specified.');
		if(info.group !== info.group.toLowerCase()) throw new Error('Command group must be lowercase.');
		if(!info.memberName) throw new Error('Command must have a memberName specified.');
		if(info.memberName !== info.memberName.toLowerCase()) throw new Error('Command memberName must be lowercase.');
		if(!info.description) throw new Error('Command must have a description specified.');
		if(info.examples && !Array.isArray(info.examples)) throw new TypeError('Command examples must be an array.');
		if(info.argsType && !['single', 'multiple'].includes(info.argsType)) {
			throw new RangeError('Command argsType must be one of "single" or "multiple".');
		}
		if(info.argsType === 'multiple' && info.argsCount && info.argsCount < 2) {
			throw new RangeError('Command argsCount must be at least 2.');
		}
		if(info.patterns && !Array.isArray(info.patterns)) throw new TypeError('Command patterns must be an array.');

		/**
		 * Client that this command is for
		 * @type {CommandoClient}
		 */
		this.client = client;

		/**
		 * Name of this command
		 * @type {string}
		 * @see {@link CommandInfo}
		 */
		this.name = info.name;

		/**
		 * Aliases for this command
		 * @type {string[]}
		 * @see {@link CommandInfo}
		 */
		this.aliases = info.aliases || [];

		/**
		 * ID of the group the command belongs to
		 * @type {string}
		 * @see {@link CommandInfo}
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
		 * @see {@link CommandInfo}
		 */
		this.memberName = info.memberName;

		/**
		 * Short description of the command
		 * @type {string}
		 * @see {@link CommandInfo}
		 */
		this.description = info.description;

		/**
		 * Usage format string of the command
		 * @type {string}
		 * @see {@link CommandInfo}
		 */
		this.usage = info.usage || info.name;

		/**
		 * Long description of the command
		 * @type {?string}
		 * @see {@link CommandInfo}
		 */
		this.details = info.details || null;

		/**
		 * Example usage strings
		 * @type {?string[]}
		 * @see {@link CommandInfo}
		 */
		this.examples = info.examples || null;

		/**
		 * Whether the command can only be run in a guild channel
		 * @type {boolean}
		 * @see {@link CommandInfo}
		 */
		this.guildOnly = !!info.guildOnly;

		/**
		 * Whether the default command handling is enabled for the command
		 * @type {boolean}
		 * @see {@link CommandInfo}
		 */
		this.defaultHandling = 'defaultHandling' in info ? info.defaultHandling : true;

		/**
		 * How the arguments are split when passed to the command's run method
		 * @type {string}
		 * @see {@link CommandInfo}
		 */
		this.argsType = info.argsType || 'single';

		/**
		 * Maximum number of arguments that will be split
		 * @type {number}
		 * @see {@link CommandInfo}
		 */
		this.argsCount = info.argsCount || 0;

		/**
		 * Whether single quotes are allowed to encapsulate an argument
		 * @type {boolean}
		 * @see {@link CommandInfo}
		 */
		this.argsSingleQuotes = 'argsSingleQuotes' in info ? info.argsSingleQuotes : true;

		/**
		 * Regular expression triggers
		 * @type {RegExp[]}
		 * @see {@link CommandInfo}
		 */
		this.patterns = info.patterns || null;

		/**
		 * Whether the command is protected from being disabled
		 * @type {boolean}
		 */
		this.guarded = info.guarded || false;
	}

	/**
	 * Checks a user's permission in a guild
	 * @param {Guild} guild - The guild to test the user's permission in
	 * @param {User} user - The user to test the permission of
	 * @return {boolean} Whether or not the user has permission to use the command
	 */
	hasPermission(guild, user) { // eslint-disable-line no-unused-vars
		return true;
	}

	/**
	 * Runs the command
	 * @param {Message} message - The message the command is being run for
	 * @param {string[]} args - The arguments for the command, or the matches from a pattern
	 * @param {boolean} fromPattern - Whether or not the command is being run from a pattern match or not
	 * @return {Promise<CommandResult|string[]|string>} The result of running the command
	 */
	async run(message, args, fromPattern) { // eslint-disable-line no-unused-vars
		throw new Error(`${this.constructor.name} doesn't have a run() method.`);
	}

	/**
	 * Enables or disables the command in a guild
	 * @param {GuildResolvable} guild - Guild to enable/disable the command in
	 * @param {boolean} enabled - Whether the command should be enabled or disabled
	 */
	setEnabledIn(guild, enabled) {
		guild = this.client.resolver.resolveGuild(guild);
		guild.setCommandEnabled(this, enabled);
	}

	/**
	 * Checks if the command is enabled in a guild
	 * @param {GuildResolvable} guild - Guild to check in
	 * @return {boolean} Whether or not the command is enabled
	 */
	isEnabledIn(guild) {
		guild = this.client.resolver.resolveGuild(guild);
		return guild.isCommandEnabled(this);
	}

	/**
	 * Checks if the command is usable for a message
	 * @param {?Message} message - The message
	 * @return {boolean} Whether or not the command is usable
	 */
	isUsable(message = null) {
		if(this.guildOnly && message && !message.guild) return false;
		return !message || (this.isEnabledIn(message.guild) && this.hasPermission(message));
	}

	makeUsage(argString, guild = null, onlyMention = false) {
		return this.constructor.usage(this.client, `${this.name}${argString ? ` ${argString}` : ''}`, guild, onlyMention);
	}

	static usage(client, command, guild = null, onlyMention = false) {
		const nbcmd = command.replace(/ /g, '\xa0');
		if(!guild && !onlyMention) return `\`${nbcmd}\``;
		if(guild) guild = client.resolver.resolveGuild(guild);
		let prefixAddon = '';
		if(!onlyMention) {
			let prefix = (guild ? guild.commandPrefix : client.options.commandPrefix).replace(/ /g, '\xa0');
			if(prefix.length > 1 && !prefix.endsWith('\xa0')) prefix += '\xa0';
			prefixAddon = prefix ? `\`${prefix}${nbcmd}\` or ` : '';
		}
		const user = `${client.user.username.replace(/ /g, '\xa0')}#${client.user.discriminator}`;
		return `${prefixAddon}\`@${user}\xa0${nbcmd}\``;
	}
}

module.exports = Command;
