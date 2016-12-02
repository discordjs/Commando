const SettingProvider = require('./base');

/**
 * Uses an SQLite database to store settings with guilds
 * @extends {SettingProvider}
 */
class SQLiteProvider extends SettingProvider {
	/**
	 * @external SQLiteDatabase
	 * @see {@link https://www.npmjs.com/package/sqlite}
	 */

	/**
	 * @param {SQLiteDatabase} db Database for the provider
	 */
	constructor(db) {
		super();

		/**
		 * Database that will be used for storing/retrieving settings
		 * @type {SQLiteDatabase}
		 */
		this.db = db;

		/**
		 * Client that the provider is for (set once the client is ready, after using {@link CommandoClient#setProvider})
		 * @type {?CommandoClient}
		 */
		this.client = null;

		/**
		 * Settings cached in memory, mapped by guild ID (or 'global')
		 * @type {Map}
		 * @private
		 */
		this.settings = new Map();

		/**
		 * Listeners on the Client, mapped by the event name
		 * @type {Map}
		 * @private
		 */
		this.listeners = new Map();

		/**
		 * Prepared statement to insert or replace a settings row
		 * @type {SQLiteStatement}
		 * @private
		 */
		this.insertOrReplaceStmt = null;

		/**
		 * Prepared statement to delete an entire settings row
		 * @type {SQLiteStatement}
		 * @private
		 */
		this.deleteStmt = null;

		/**
		 * @external SQLiteStatement
		 * @see {@link https://www.npmjs.com/package/sqlite}
		 */
	}

	async init(client) {
		this.client = client;
		await this.db.run('CREATE TABLE IF NOT EXISTS settings (guild INTEGER PRIMARY KEY, settings TEXT)');

		// Load all settings
		const rows = await this.db.all('SELECT CAST(guild as TEXT) as guild, settings FROM settings');
		for(const row of rows) {
			const settings = JSON.parse(row.settings);
			this.settings.set(row.guild || 'global', settings);
			if(row.guild !== 'global' && !client.guilds.has(row.guild)) continue;
			this.setupGuild(row.guild || 'global', settings);
		}

		// Prepare statements
		const statements = await Promise.all([
			this.db.prepare('INSERT OR REPLACE INTO settings VALUES(?, ?)'),
			this.db.prepare('DELETE FROM settings WHERE guild = ?')
		]);
		this.insertOrReplaceStmt = statements[0];
		this.deleteStmt = statements[1];

		// Listen for changes
		this.listeners
			.set('commandPrefixChange', (guild, prefix) => this.set(guild, 'prefix', prefix))
			.set('commandStatusChange', (guild, command, enabled) => this.set(guild, `cmd-${command.name}`, enabled))
			.set('groupStatusChange', (guild, group, enabled) => this.set(guild, `grp-${group.name}`, enabled))
			.set('guildCreate', guild => {
				const settings = this.settings.get(guild.id);
				if(!settings) return;
				this.setupGuild(guild.id, settings);
			})
			.set('commandRegister', command => {
				for(const [guild, settings] of this.settings) {
					if(guild !== 'global' && !client.guilds.has(guild)) continue;
					this.setupGuildCommand(client.guilds.get(guild), command, settings);
				}
			})
			.set('groupRegister', group => {
				for(const [guild, settings] of this.settings) {
					if(guild !== 'global' && !client.guilds.has(guild)) continue;
					this.setupGuildGroup(client.guilds.get(guild), group, settings);
				}
			});
		for(const [event, listener] of this.listeners) client.on(event, listener);
	}

	async destroy() {
		// Finalise prepared statements
		await Promise.all([
			this.insertOrReplaceStmt.finalize(),
			this.deleteStmt.finalize()
		]);

		// Remove all listeners from the client
		for(const [event, listener] of this.listeners) this.client.removeListener(event, listener);
		this.listeners.clear();
	}

	get(guild, key, defVal) {
		const settings = this.settings.get(this.constructor.getGuildID(guild));
		return settings ? settings[key] || defVal : defVal;
	}

	async set(guild, key, val) {
		guild = this.constructor.getGuildID(guild);
		let settings = this.settings.get(guild);
		if(!settings) {
			settings = {};
			this.settings.set(guild, settings);
		}

		settings[key] = val;
		await this.insertOrReplaceStmt.run(guild !== 'global' ? guild : null, JSON.stringify(settings));
		return val;
	}

	async remove(guild, key) {
		guild = this.constructor.getGuildID(guild);
		const settings = this.settings.get(guild);
		if(!settings || typeof settings[key] === 'undefined') return undefined;

		const val = settings[key];
		settings[key] = undefined;
		await this.insertOrReplaceStmt.run(guild !== 'global' ? guild : null, JSON.stringify(settings));
		return val;
	}

	async clear(guild) {
		guild = this.constructor.getGuildID(guild);
		const settings = this.settings.get(guild);
		if(!settings) return;
		await this.deleteStmt.run(guild !== 'global' ? guild : null);
	}

	/**
	 * Loads all settings for a guild
	 * @param {string} guild Guild ID to load the settings of (or 'global')
	 * @param {Object} settings Settings to load
	 * @private
	 */
	setupGuild(guild, settings) {
		if(typeof guild !== 'string') throw new TypeError('The guild must be a guild ID or "global".');
		guild = this.client.guilds.get(guild) || null;

		// Load the command prefix
		if(settings.prefix) {
			if(guild) guild._commandPrefix = settings.prefix;
			else this.client._commandPrefix = settings.prefix;
		}

		// Load all command/group statuses
		for(const command of this.client.registry.commands.values()) this.setupGuildCommand(guild, command, settings);
		for(const group of this.client.registry.groups.values()) this.setupGuildGroup(guild, group, settings);
	}

	/**
	 * Sets up a command's status in a guild from the guild's settings
	 * @param {?Guild} guild Guild to set the status in
	 * @param {Command} command Command to set the status of
	 * @param {Object} settings Settings of the guild
	 * @private
	 */
	setupGuildCommand(guild, command, settings) {
		if(typeof settings[`cmd-${command.name}`] === 'undefined') return;
		if(guild) {
			if(!guild._commandsEnabled) guild._commandsEnabled = {};
			guild._commandsEnabled[command.name] = settings[`cmd-${command.name}`];
		} else {
			command._globalEnabled = settings[`cmd-${command.name}`];
		}
	}

	/**
	 * Sets up a group's status in a guild from the guild's settings
	 * @param {?Guild} guild Guild to set the status in
	 * @param {CommandGroup} group Group to set the status of
	 * @param {Object} settings Settings of the guild
	 * @private
	 */
	setupGuildGroup(guild, group, settings) {
		if(typeof settings[`grp-${group.name}`] === 'undefined') return;
		if(guild) {
			if(!guild._groupsEnabled) guild._groupsEnabled = {};
			guild._groupsEnabled[group.name] = settings[`grp-${group.name}`];
		} else {
			group._globalEnabled = settings[`grp-${group.name}`];
		}
	}
}

module.exports = SQLiteProvider;
