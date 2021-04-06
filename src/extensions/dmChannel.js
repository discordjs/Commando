const { Structures } = require('discord.js');

module.exports = Structures.extend('DMChannel', DMChannel => {
	class CommandoDMChannel extends DMChannel {
		async fetchMessages(args = {}) {
			return this.client.fetchMessages(this, args);
		}
	}

	return CommandoDMChannel;
});
