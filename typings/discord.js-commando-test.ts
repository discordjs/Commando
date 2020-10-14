/// <reference path='index.d.ts' />

import { Message } from 'discord.js';
import { Command, CommandoMessage, CommandoClient } from 'discord.js-commando';

const client = new CommandoClient();

client.on('message', (message: Message) => {
	if (message.content === 'hello') {
		message.channel.send('o/');
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

	public hasPermission(message: CommandoMessage): boolean {
		return true;
	}

	public async run(message: CommandoMessage, args: {} | string | string[]): Promise<Message | Message[]> {
		return message.say('test');
	}
}

client.login('aefsrgbr6t7u68i6t7ikjtz.sdfdsujhfisudhfsd.dufhsdufh8ehf8hw8ehf83h4thushdg');
