const { SettingProvider } = require('discord.js-commando');
const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const guildSchema = new mongoose.Schema({
	id: String,
	settings: Schema.Types.Mixed
});
const Guild = mongoose.model('Guild', guildSchema);

class MongoDBProvider extends SettingProvider {
	constructor(options = {}) {
		super();

		if(options.mongoURI === undefined) {
			throw new Error('mongoURI must be specified');
		}

		mongoose.connect(options.mongoURI, { useMongoClient: true });
		mongoose.Promise = Promise;
		mongoose.set('debug', options.mongoDebug || false);

		this.listeners = new Map();
	}

	// Initialises the provider by connecting to databases and/or caching all data in memory.
	// CommandoClient#setProvider will automatically call this once the client is ready.
	async init(client) {
		this.client = client;

		this.listeners
			.set('commandPrefixChange', (guild, prefix) => this.set(guild, 'prefix', prefix))
			.set('commandStatusChange', (guild, command, enabled) => this.set(guild, `cmd:${command.name}`, enabled))
			.set('groupStatusChange', (guild, group, enabled) => this.set(guild, `grp:${group.name}`, enabled))
			.set('guildCreate', async guild => {
				const settings = await this.get(guild);
				if(!settings) return;
				this.setupGuild(guild.id, settings);
			});

		for(const [event, listener] of this.listeners) {
			client.on(event, listener);
		}

		let guilds = await Guild.find();
		for(const index in guilds) {
			let guild = guilds[index];
			if(guild.id !== 'global' && !client.guilds.has(guild.id)) {
				continue;
			}

			this.setupGuild(guild.id, guild.settings);
		}
	}

	// Removes all settings in a guild
	async clear(guild) {
		let guildObj = await this.getGuild(guild);
		await guildObj.remove();
	}

	// Destroys the provider, removing any event listeners
	destroy() {
		for(const [event, listener] of this.listeners) this.client.removeListener(event, listener);
		this.listeners.clear();
	}

	// Obtains a setting for a guild
	async get(guild, key, defValue) {
		let guildObj = await this.getGuild(guild);
		if(key === undefined) {
			return guildObj.settings;
		} else {
			if(guildObj.settings[key] === undefined) {
				return defValue;
			}

			return guildObj.settings[key];
		}
	}

	// Removes a setting from a guild
	async remove(guild, key) {
		if(key === undefined) {
			return;
		}

		let guildObj = await this.getGuild(guild);

		delete guildObj.settings[key];
		guildObj.markModified('settings');

		await guildObj.save();
	}

	// Sets a setting for a guild
	async set(guild, key, val) {
		let guildObj = await this.getGuild(guild);

		guildObj.settings[key.toLowerCase()] = val;
		guildObj.markModified('settings');

		await guildObj.save();
	}

	async getGuild(guild) {
		let guildObj = await Guild.findOne({ id: this.constructor.getGuildID(guild) });
		return guildObj;
	}

	setupGuild(guild, settings) {
		if(typeof guild !== 'string') throw new TypeError('The guild must be a guild ID or "global".');
		guild = this.client.guilds.get(guild) || null;

		if(typeof settings.prefix !== 'undefined') {
			if(guild) guild._commandPrefix = settings.prefix;
			else this.client._commandPrefix = settings.prefix;
		}

		for(const command of this.client.registry.commands.values()) this.setupGuildCommand(guild, command, settings);
		for(const group of this.client.registry.groups.values()) this.setupGuildGroup(guild, group, settings);
	}

	setupGuildCommand(guild, command, settings) {
		if(typeof settings[`cmd:${command.name}`] === 'undefined') return;
		if(guild) {
			if(!guild._commandsEnabled) guild._commandsEnabled = {};
			guild._commandsEnabled[command.name] = settings[`cmd:${command.name}`];
		} else {
			command._globalEnabled = settings[`cmd:${command.name}`];
		}
	}

	setupGuildGroup(guild, group, settings) {
		if(typeof settings[`grp:${group.id}`] === 'undefined') return;
		if(guild) {
			if(!guild._groupsEnabled) guild._groupsEnabled = {};
			guild._groupsEnabled[group.id] = settings[`grp:${group.id}`];
		} else {
			group._globalEnabled = settings[`grp:${group.id}`];
		}
	}
}

module.exports = MongoDBProvider;
