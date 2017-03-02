/// <reference path='index.d.ts' />

import { Client } from '../src';

const client = new Client()

client.on('message', message => {
	if (message.content === 'hello') {
		message.channel.sendMessage('o/');
	}
});

client.login('aefsrgbr6t7u68i6t7ikjtz');