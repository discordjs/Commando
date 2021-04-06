const { Structures } = require('discord.js');

module.exports = Structures.extend('TextChannel', TextChannel => {
	class CommandoTextChannel extends TextChannel {
		async fetchMessages(args = {}) {
			return this.client.fetchMessages(this, args);
		}
	}

	return CommandoTextChannel;
});
