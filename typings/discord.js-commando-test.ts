/// <reference path='index.d.ts' />


import { Command, CommandoClient, CommandMessage } from 'discord.js-commando';
import { Message } from 'discord.js';

const client = new CommandoClient({})

client.on('message', (message: Message) => {
	if (message.content === 'hello') {
		message.channel.sendMessage('o/');
	}
});

class TestCommand extends Command {
	constructor(client: CommandoClient) {
		super(client, {
			name: 'test',
			group: 'test',
			memberName: 'test',
			description: 'test'
		});
	}

	hasPermission(message: CommandMessage): boolean {
		return true;
	}

	public async run(message: CommandMessage, args: {} | string | string[]): Promise<Message | Message[]> {
		return message.say('test');
	}
}

client.login('aefsrgbr6t7u68i6t7ikjtz.sdfdsujhfisudhfsd.dufhsdufh8ehf8hw8ehf83h4thushdg');