const Command = require('../base');
const CommandoTranslatable = require('../../translator/translatable');
const i18next = require('i18next');


module.exports = class PingCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'ping',
			group: 'util',
			memberName: 'ping',
			description: new CommandoTranslatable('command.ping.description'),
			throttling: {
				usages: 5,
				duration: 10
			}
		});
	}

	async run(msg) {
		const lng = msg.client.translator.resolveLanguage(msg);
		const pingMsg = await msg.reply(i18next.t('command.ping.run.pinging', {
			lng
		}));
		return pingMsg.edit(i18next.t('command.ping.run.pong', {
			lng,
			mention: msg.channel.type !== 'dm' ? `${msg.author},` : '',
			duration: (pingMsg.editedTimestamp || pingMsg.createdTimestamp) - (msg.editedTimestamp || msg.createdTimestamp),
			heartbeatPing: Math.round(this.client.ws.ping),
			pingResponse: this.client.ws.ping ?
				`$t(command.ping.run.heartbeat_ping)` : '',
			interpolation: { escapeValue: false }
		}));
	}
};
