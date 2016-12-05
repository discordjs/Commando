const oneLine = require('common-tags').oneLine;
const Command = require('../base');

module.exports = class PingCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'ping',
			group: 'util',
			memberName: 'ping',
			description: 'Checks the bot\'s ping to the Discord server.',
			throttling: {
				usages: 5,
				duration: 10
			}
		});
	}

	async run(msg) {
		if(!msg.editable) {
			const pingMsg = await msg.reply('Pinging...');
			return pingMsg.edit(oneLine`
				${msg.channel.type !== 'dm' ? `${msg.author},` : ''}
				Pong! The message round-trip took ${pingMsg.createdTimestamp - msg.createdTimestamp}ms.
				${this.client.ping ? `The heartbeat ping is ${Math.round(this.client.ping)}ms.` : ''}
			`);
		} else {
			await msg.edit('Pinging...');
			return msg.edit(oneLine`
				Pong! The message round-trip took ${msg.editedTimestamp - msg.createdTimestamp}ms.
				${this.client.ping ? `The heartbeat ping is ${Math.round(this.client.ping)}ms.` : ''}
			`);
		}
	}
};
