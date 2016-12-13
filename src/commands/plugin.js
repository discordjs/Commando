const Command = require('./base');

/** A class that encapsulates a plugin */
class CommandPlugin {
	/**
	 * @param {CommandoClient} client - The client that this plugin is for
	 * @param {string} groupId - The ID for the group all the plugin's commands belong to
	 * @param {string} groupName - The name for the group
	 */
	constructor(client, groupId, groupName) {
		/**
		 * Client that this plugin is for
		 * @name CommandPlugin#client
		 * @type {CommandoClient}
		 */
		this.client = client;

		/**
		 * The ID for the group all the plugin's commands should belong to
		 * @type {string}
		 */
		this.groupId = groupId || 'default';

		/**
		 * The name for the group group
		 * @type {string}
		 */
		this.groupName = groupName || 'Default';

		// register the group
		client.registry.registerGroup(this.groupId, this.groupName);
	}

	/**
	 * Adds a command to this plugin
	 * @param {Object} info - Command info
	 */
	addCommand(info) {
		info.group = this.groupId;
        if(typeof info.run === "function")
		    info.run = info.run.bind(this);
		this.client.registry.registerCommand(new Command(this.client, info));
	}
}

module.exports = CommandPlugin;
