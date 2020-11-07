const commando = require('../../../src');

module.exports = class TestService extends commando.Service {
	constructor(client) {
		super(client);
		this.name = 'test-service';
	}
	load() {
		this.client.on('message', msg => {
			if(msg.content.startsWith('hello') && !msg.bot) {
				msg.channel.send('Hello there');
			}
		});
	}
};
