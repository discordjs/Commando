const discord = require('discord.js');
const CommandRegistry = require('./registry');
const CommandDispatcher = require('./dispatcher');

/** Discord.js Client with a command framework */
class CommandoClient extends discord.Client {
	/**
	 * Options for a CommandoClient
	 * @typedef {ClientOptions} CommandoClientOptions
	 * @property {boolean} [selfbot=false] - Whether the command dispatcher should be in selfbot mode
	 * @property {string} [commandPrefix=!] - Default command prefix
	 * @property {number} [commandEditableDuration=30] - Time in seconds that command messages should be editable
	 * @property {boolean} [nonCommandEditable=true] - Whether messages without commands can be edited to a command
	 * @property {string} [owner] - ID of the bot owner's Discord user
	 * @property {string} [invite] - Invite URL to the bot's support server
	 */

	/**
	 * @param {CommandoClientOptions} [options] - Options for the client
	 */
	constructor(options = {}) {
		if(typeof options.selfbot === 'undefined') options.selfbot = true;
		if(typeof options.commandPrefix === 'undefined') options.commandPrefix = '!';
		if(typeof options.commandEditableDuration === 'undefined') options.commandEditableDuration = 30;
		if(typeof options.nonCommandEditable === 'undefined') options.nonCommandEditable = true;
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
}

module.exports = CommandoClient;
