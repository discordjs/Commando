/** A group for commands. Whodathunkit? */
class CommandGroup {
	/**
	 * @param {CommandoClient} client - The client the group is for
	 * @param {string} id - The ID for the group
	 * @param {string} [name=id] - The name of the group
	 * @param {boolean} [guarded=false] - Whether the group should be protected from disabling
	 * @param {Command[]} [commands=[]] - The commands that the group contains
	 */
	constructor(client, id, name, guarded, commands) {
		if(!client) throw new Error('A client must be specified.');
		if(!id) throw new Error('An ID must be specified.');
		if(commands && !Array.isArray(commands)) throw new TypeError('Commands must be an array.');
		if(id !== id.toLowerCase()) throw new Error('Group ID must be lowercase.');

		/**
		 * Client that this group is for
		 * @type {CommandoClient}
		 */
		this.client = client;

		/**
		 * ID of this group
		 * @type {string}
		 */
		this.id = id;

		/**
		 * Name of this group
		 * @type {string}
		 */
		this.name = name || id;

		/**
		 * The commands in this group (added upon their registration)
		 * @type {Command[]}
		 */
		this.commands = commands || [];

		/**
		 * Whether or not this group is protected from being disabled
		 * @type {boolean}
		 */
		this.guarded = guarded || false;
	}

	/**
	 * Enables or disables the group in a guild
	 * @param {GuildResolvable} guild - Guild to enable/disable the group in
	 * @param {boolean} enabled - Whether the group should be enabled or disabled
	 */
	setEnabledIn(guild, enabled) {
		guild = this.client.resolver.resolveGuild(guild);
		guild.setGroupEnabled(this, enabled);
	}

	/**
	 * Checks if the group is enabled in a guild
	 * @param {GuildResolvable} guild - Guild to check in
	 * @return {boolean} Whether or not the group is enabled
	 */
	isEnabledIn(guild) {
		guild = this.client.resolver.resolveGuild(guild);
		return guild.isGroupEnabled(this);
	}
}

module.exports = CommandGroup;
