const commando = require('../../../src');
const { promisify } = require('util');

module.exports = class WaitSendMessage extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'waitsendmessage',
			aliases: ['wsm', 'wait'],
			group: 'util',
			memberName: 'waitsendmessage',
			description: 'Send a message. Wait an amount of time, then edit it.',
			examples: ['waitsendmessage 5m', 'wsm 10h'],
			args: [
				{
					key: 'duration',
					prompt: 'How long would you like the message to be edited after being sent?',
					type: 'duration'
				}
			]
		});
	}

	async run(msg, { duration }) {
        // Send a message
		const sentMessage = await msg.channel.send(`Waiting ${duration} ms to edit...`);
        // Wait for the duration
		const sleep = promisify(setTimeout);
		await sleep(duration);
        // Edit the message
		return sentMessage.edit(`Successfully waited ${duration} ms!`);
	}
};
