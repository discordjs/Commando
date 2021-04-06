const { Structures } = require('discord.js');

module.exports = Structures.extend('NewsChannel', NewsChannel => {
	class CommandoNewsChannel extends NewsChannel {
		async fetchMessages(args = {}) {
			return this.client.fetchMessages(this, args);
		}
	}

	return CommandoNewsChannel;
});
