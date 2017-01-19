const discord = require('discord.js');
const CommandRegistry = require('./registry');
const CommandDispatcher = require('./dispatcher');
const GuildSettingsHelper = require('./providers/helper');

/**
 * Discord.js Client with a command framework
 * @extends {Client}
 */
class CommandoClient extends discord.Client {
	/**
	 * Options for a CommandoClient
	 * @typedef {ClientOptions} CommandoClientOptions
	 * @property {boolean} [selfbot=false] - Whether the command dispatcher should be in selfbot mode
	 * @property {string} [commandPrefix=!] - Default command prefix
	 * @property {number} [commandEditableDuration=30] - Time in seconds that command messages should be editable
	 * @property {boolean} [nonCommandEditable=true] - Whether messages without commands can be edited to a command
	 * @property {boolean} [unknownCommandResponse=true] - Whether the bot should respond to an unknown command
	 * @property {string} [owner] - ID of the bot owner's Discord user
	 * @property {string} [invite] - Invite URL to the bot's support server
	 */

	/**
	 * @param {CommandoClientOptions} [options] - Options for the client
	 */
	constructor(options = {}) {
		if(typeof options.selfbot === 'undefined') options.selfbot = false;
		if(typeof options.commandPrefix === 'undefined') options.commandPrefix = '!';
		if(options.commandPrefix === null) options.commandPrefix = '';
		if(typeof options.commandEditableDuration === 'undefined') options.commandEditableDuration = 30;
		if(typeof options.nonCommandEditable === 'undefined') options.nonCommandEditable = true;
		if(typeof options.unknownCommandResponse === 'undefined') options.unknownCommandResponse = true;
		super(options);

		/**
		 * The client's command registry
		 * @type {CommandRegistry}
		 */
		this.registry = new CommandRegistry(this);

		/**
		 * The client's command dispatcher
		 * @type {CommandDispatcher}
		 */
		this.dispatcher = new CommandDispatcher(this, this.registry);

		/**
		 * The client's setting provider
		 * @type {?SettingProvider}
		 */
		this.provider = null;

		/**
		 * Shortcut to use setting provider methods for the global settings
		 * @type {GuildSettingsHelper}
		 */
		this.settings = new GuildSettingsHelper(this, null);

		this._commandPrefix = null;

		// Set up command handling
		const msgErr = err => { this.emit('error', err); };
		this.on('message', message => { this.dispatcher.handleMessage(message).catch(msgErr); });
		this.on('messageUpdate', (oldMessage, newMessage) => {
			this.dispatcher.handleMessage(newMessage, oldMessage).catch(msgErr);
		});

		// Fetch the owner
		if(options.owner) {
			this.once('ready', () => {
				this.fetchUser(options.owner).catch((err) => { this.emit('error', err); });
			});
		}
	}

	/**
	 * Global command prefix. An empty string indicates that there is no default prefix, and only mentions will be used.
	 * Setting to `null` means that the default prefix from {@link CommandoClient#options} will be used instead.
	 * @type {string}
	 * @emits {@link CommandoClient#commandPrefixChange}
	 */
	get commandPrefix() {
		if(typeof this._commandPrefix === 'undefined' || this._commandPrefix === null) return this.options.commandPrefix;
		return this._commandPrefix;
	}

	set commandPrefix(prefix) {
		this._commandPrefix = prefix;
		this.emit('commandPrefixChange', null, this._commandPrefix);
	}

	/**
	 * Sets the setting provider to use, and initialises it once the client is ready
	 * @param {SettingProvider|Promise<SettingProvider>} provider Provider to use
	 * @return {Promise<void>}
	 */
	async setProvider(provider) {
		provider = await provider;
		this.provider = provider;

		if(this.readyTimestamp) {
			this.emit('debug', `Provider set to ${provider.constructor.name}. Initialising...`);
			await provider.init(this);
			this.emit('debug', 'Provider finished initialisation.');
			return undefined;
		}

		this.emit('debug', `Provider set to ${provider.constructor.name}. Will initialise once ready.`);
		await new Promise(resolve => {
			this.once('ready', () => {
				this.emit('debug', `Initialising provider...`);
				resolve(provider.init(this));
			});
		});

		this.emit('debug', 'Provider finished initialisation.');
		return undefined;
	}

	destroy() {
		super.destroy().then(() => this.provider ? this.provider.destroy() : undefined);
	}
}

module.exports = CommandoClient;
