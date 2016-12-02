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
		 * Client that the provider is for (set once the client is ready, after using {@link Client#setProvider})
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
		client
			.on('commandPrefixChange', (guild, prefix) => this.set(guild, 'prefix', prefix))
			.on('commandStatusChange', (guild, command, enabled) => this.set(guild, `cmd-${command.name}`, enabled))
			.on('groupStatusChange', (guild, group, enabled) => this.set(guild, `grp-${group.name}`, enabled))
			.on('commandRegistered', command => {
				for(const [guild, settings] of this.settings) {
					if(!client.guilds.has(guild)) continue;
					if(typeof settings[`cmd-${command.name}`] !== 'undefined') {
						command.setEnabledIn(guild, settings[`cmd-${command.name}`]);
					}
				}
			})
			.on('guildCreate', guild => {
				const settings = this.settings.get(guild.id);
				if(!settings) return;
				this.setupGuild(guild.id, settings);
			});
	}

	async destroy() {
		// do nothing
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
			if(!guild) this.client.commandPrefix = settings.prefix;
			else guild.commandPrefix = settings.prefix;
		}

		// Load all command statuses
		for(const command of this.client.registry.commands.values()) {
			if(typeof settings[`cmd-${command.name}`] !== 'undefined') {
				command.setEnabledIn(guild, settings[`cmd-${command.name}`]);
			}
		}

		// Load all group statuses
		for(const group of this.client.registry.groups.values()) {
			if(typeof settings[`grp-${group.name}`] !== 'undefined') {
				group.setEnabledIn(guild, settings[`grp-${group.name}`]);
			}
		}
	}
}

module.exports = SQLiteProvider;
