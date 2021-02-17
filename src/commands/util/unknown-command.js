const Command = require('../base');
const CommandoTranslatable = require('../../translator/translatable');
const i18next = require('i18next');

module.exports = class UnknownCommandCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'unknown-command',
			group: 'util',
			memberName: 'unknown-command',
			description: new CommandoTranslatable('command.unknown_command.description'),
			examples: new CommandoTranslatable('command.unknown_command.examples'),
			unknown: true,
			hidden: true
		});
	}

	run(msg) {
		const lng = msg.client.translator.resolveLanguage(msg);
		return msg.reply(i18next.t('command.unknown_command.run.response', {
			lng,
			usage: msg.anyUsage(
				'help',
				msg.guild ? undefined : null,
				msg.guild ? undefined : null
			)
		}));
	}
};
