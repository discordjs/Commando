const discord = require('discord.js');

/** A group for commands. Whodathunkit? */
class CommandGroup {
	/**
	 * @param {CommandoClient} client - The client the group is for
	 * @param {string} id - The ID for the group
	 * @param {string} [name=id] - The name of the group
	 * @param {boolean} [guarded=false] - Whether the group should be protected from disabling
	 */
	constructor(client, id, name, guarded = false) {
		if(!client) throw new Error('A client must be specified.');
		if(typeof id !== 'string') throw new TypeError('Group ID must be a string.');
		if(id !== id.toLowerCase()) throw new Error('Group ID must be lowercase.');

		/**
		 * Client that this group is for
		 * @name CommandGroup#client
		 * @type {CommandoClient}
		 * @readonly
		 */
		Object.defineProperty(this, 'client', { value: client });

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
		 * @type {Collection<string, Command>}
		 */
		this.commands = new discord.Collection();

		/**
		 * Whether or not this group is protected from being disabled
		 * @type {boolean}
		 */
		this.guarded = guarded;

		this._globalEnabled = true;
	}

	/**
	 * Enables or disables the group in a guild
	 * @param {?GuildResolvable} guild - Guild to enable/disable the group in
	 * @param {boolean} enabled - Whether the group should be enabled or disabled
	 */
	setEnabledIn(guild, enabled) {
		if(typeof guild === 'undefined') throw new TypeError('Guild must not be undefined.');
		if(typeof enabled === 'undefined') throw new TypeError('Enabled must not be undefined.');
		if(this.guarded) throw new Error('The group is guarded.');
		if(!guild) {
			this._globalEnabled = enabled;
			this.client.emit('groupStatusChange', null, this, enabled);
			return;
		}
		guild = this.client.guilds.resolve(guild);
		guild.setGroupEnabled(this, enabled);
	}

	/**
	 * Checks if the group is enabled in a guild
	 * @param {?GuildResolvable} guild - Guild to check in
	 * @return {boolean} Whether or not the group is enabled
	 */
	isEnabledIn(guild) {
		if(this.guarded) return true;
		if(!guild) return this._globalEnabled;
		guild = this.client.guilds.resolve(guild);
		return guild.isGroupEnabled(this);
	}

	/**
	 * Reloads all of the group's commands
	 */
	reload() {
		for(const command of this.commands.values()) command.reload();
	}
}

module.exports = CommandGroup;
