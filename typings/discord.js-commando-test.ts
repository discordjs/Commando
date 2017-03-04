/// <reference path='index.d.ts' />

import { Client, Command } from '../src';

const client = new Client()

client.on('message', message => {
	if (message.content === 'hello') {
		message.channel.sendMessage('o/');
	}
});

class TestCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'test'
		})
	}
}

client.login('aefsrgbr6t7u68i6t7ikjtz');