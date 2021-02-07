const Command = require('../base');
const { makeCallback } = require('../../util');

module.exports = class PingCommand extends Command {
	constructor(client, props = {}) {
		super(client, {
			name: 'ping',
			group: 'util',
			memberName: 'ping',
			description: makeCallback(locale => locale.commands.util.ping.constructor.description),
			throttling: {
				usages: 5,
				duration: 10
			}
		}, props);
	}

	async run(msg) {
		const pingMsg = await msg.reply(msg.locale.commands.util.ping.run.pinging);
		return pingMsg.edit(msg.locale.commands.util.ping.run.success({
			author: msg.channel.type !== 'dm' ? `${msg.author},` : '',
			ping: (pingMsg.editedTimestamp || pingMsg.createdTimestamp) - (msg.editedTimestamp || msg.createdTimestamp),
			heartbeat: this.client.ws.ping ? msg.locale.commands.util.ping.run.heartbeat({
				ping: Math.round(this.client.ws.ping)
			}) : ''
		}));
	}
};
