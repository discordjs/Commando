const SettingProvider = require('./base');

/**
 * Uses an SQLite database to store settings with guilds
 * @extends {SettingProvider}
 */
class SyncSQLiteProvider extends SettingProvider {
	/**
	 * @external SyncSQLiteDatabase
	 * @see {@link https://www.npmjs.com/package/better-sqlite3}
	 */

	/**
	 * @param {SyncSQLiteDatabase} conn - Database Connection for the provider
	 */
	constructor(conn) {
		super();

		/**
		 * Database that will be used for storing/retrieving settings
		 * @type {SyncSQLiteDatabase}
		 */
		this.conn = conn;

		/**
		 * Client that the provider is for (set once the client is ready, after using {@link CommandoClient#setProvider})
		 * @name SyncSQLiteProvider#client
		 * @type {CommandoClient}
		 * @readonly
		 */
		Object.defineProperty(this, 'client', { value: null, writable: true });

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
		 * @type {SyncSQLiteStatement}
		 * @private
		 */
		this.insertOrReplaceStmt = null;

		/**
		 * Prepared statement to delete an entire settings row
		 * @type {SyncSQLiteStatement}
		 * @private
		 */
		this.deleteStmt = null;

		/**
		 * @external SyncSQLiteStatement
		 * @see {@link https://www.npmjs.com/package/better-sqlite3}
		 */
	}

	init(client) {
		this.client = client;
		this.conn.prepare('CREATE TABLE IF NOT EXISTS settings (guild INTEGER PRIMARY KEY, settings TEXT)').run();

		// Load all settings
		const rows = this.conn.prepare('SELECT CAST(guild as TEXT) as guild, settings FROM settings').all();
		for(const row of rows) {
			let settings;
			try {
				settings = JSON.parse(row.settings);
			} catch(err) {
				client.emit('warn', `SyncSQLiteProvider couldn't parse the settings stored for guild ${row.guild}.`);
				continue;
			}

			const guild = row.guild !== '0' ? row.guild : 'global';
			this.settings.set(guild, settings);
			if(guild !== 'global' && !client.guilds.cache.has(row.guild)) continue;
			this.setupGuild(guild, settings);
		}

		// Prepare statements
		this.insertOrReplaceStmt = this.conn.prepare('INSERT OR REPLACE INTO settings VALUES(?, ?)');
		this.deleteStmt = this.conn.prepare('DELETE FROM settings WHERE guild = ?');

		// Listen for changes
		this.listeners
			.set('commandPrefixChange', (guild, prefix) => this.set(guild, 'prefix', prefix))
			.set('commandStatusChange', (guild, command, enabled) => this.set(guild, `cmd-${command.name}`, enabled))
			.set('groupStatusChange', (guild, group, enabled) => this.set(guild, `grp-${group.id}`, enabled))
			.set('guildCreate', guild => {
				const settings = this.settings.get(guild.id);
				if(!settings) return;
				this.setupGuild(guild.id, settings);
			})
			.set('commandRegister', command => {
				for(const [guild, settings] of this.settings) {
					if(guild !== 'global' && !client.guilds.cache.has(guild)) continue;
					this.setupGuildCommand(client.guilds.cache.get(guild), command, settings);
				}
			})
			.set('groupRegister', group => {
				for(const [guild, settings] of this.settings) {
					if(guild !== 'global' && !client.guilds.cache.has(guild)) continue;
					this.setupGuildGroup(client.guilds.cache.get(guild), group, settings);
				}
			});
		for(const [event, listener] of this.listeners) client.on(event, listener);
	}

	destroy() {
		// Remove all listeners from the client
		for(const [event, listener] of this.listeners) this.client.removeListener(event, listener);
		this.listeners.clear();
	}

	get(guild, key, defVal) {
		const settings = this.settings.get(this.constructor.getGuildID(guild));
		return settings ? typeof settings[key] !== 'undefined' ? settings[key] : defVal : defVal;
	}

	set(guild, key, val) {
		guild = this.constructor.getGuildID(guild);
		let settings = this.settings.get(guild);
		if(!settings) {
			settings = {};
			this.settings.set(guild, settings);
		}

		settings[key] = val;
		this.insertOrReplaceStmt.run(guild !== 'global' ? guild : 0, JSON.stringify(settings));
		if(guild === 'global') this.updateOtherShards(key, val);
		return val;
	}

	remove(guild, key) {
		guild = this.constructor.getGuildID(guild);
		const settings = this.settings.get(guild);
		if(!settings || typeof settings[key] === 'undefined') return undefined;

		const val = settings[key];
		settings[key] = undefined;
		this.insertOrReplaceStmt.run(guild !== 'global' ? guild : 0, JSON.stringify(settings));
		if(guild === 'global') this.updateOtherShards(key, undefined);
		return val;
	}

	clear(guild) {
		guild = this.constructor.getGuildID(guild);
		if(!this.settings.has(guild)) return;
		this.settings.delete(guild);
		this.deleteStmt.run(guild !== 'global' ? guild : 0);
	}

	/**
	 * Loads all settings for a guild
	 * @param {string} guild - Guild ID to load the settings of (or 'global')
	 * @param {Object} settings - Settings to load
	 * @private
	 */
	setupGuild(guild, settings) {
		if(typeof guild !== 'string') throw new TypeError('The guild must be a guild ID or "global".');
		guild = this.client.guilds.cache.get(guild) || null;

		// Load the command prefix
		if(typeof settings.prefix !== 'undefined') {
			if(guild) guild._commandPrefix = settings.prefix;
			else this.client._commandPrefix = settings.prefix;
		}

		// Load all command/group statuses
		for(const command of this.client.registry.commands.values()) this.setupGuildCommand(guild, command, settings);
		for(const group of this.client.registry.groups.values()) this.setupGuildGroup(guild, group, settings);
	}

	/**
	 * Sets up a command's status in a guild from the guild's settings
	 * @param {?CommandoGuild} guild - Guild to set the status in
	 * @param {Command} command - Command to set the status of
	 * @param {Object} settings - Settings of the guild
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
	 * Sets up a command group's status in a guild from the guild's settings
	 * @param {?CommandoGuild} guild - Guild to set the status in
	 * @param {CommandGroup} group - Group to set the status of
	 * @param {Object} settings - Settings of the guild
	 * @private
	 */
	setupGuildGroup(guild, group, settings) {
		if(typeof settings[`grp-${group.id}`] === 'undefined') return;
		if(guild) {
			if(!guild._groupsEnabled) guild._groupsEnabled = {};
			guild._groupsEnabled[group.id] = settings[`grp-${group.id}`];
		} else {
			group._globalEnabled = settings[`grp-${group.id}`];
		}
	}

	/**
	 * Updates a global setting on all other shards if using the {@link ShardingManager}.
	 * @param {string} key - Key of the setting to update
	 * @param {*} val - Value of the setting
	 * @private
	 */
	updateOtherShards(key, val) {
		if(!this.client.shard) return;
		key = JSON.stringify(key);
		val = typeof val !== 'undefined' ? JSON.stringify(val) : 'undefined';
		this.client.shard.broadcastEval(`
			const ids = [${this.client.shard.ids.join(',')}];
			if(!this.shard.ids.some(id => ids.includes(id)) && this.provider && this.provider.settings) {
				let global = this.provider.settings.get('global');
				if(!global) {
					global = {};
					this.provider.settings.set('global', global);
				}
				global[${key}] = ${val};
			}
		`);
	}
}

module.exports = SyncSQLiteProvider;
