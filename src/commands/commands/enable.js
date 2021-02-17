const Command = require('../base');
const i18next = require('i18next');
const CommandoTranslatable = require('../../translator/translatable');

module.exports = class EnableCommandCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'enable',
			aliases: ['enable-command', 'cmd-on', 'command-on'],
			group: 'commands',
			memberName: 'enable',
			description: new CommandoTranslatable('command.enable.description'),
			details: new CommandoTranslatable('command.enable.details'),
			examples: new CommandoTranslatable('command.enable.examples'),
			guarded: true,

			args: [
				{
					key: 'cmdOrGrp',
					label: new CommandoTranslatable('command.enable.args.cmd_or_grp.label'),
					prompt: new CommandoTranslatable('command.enable.args.cmd_or_grp.prompt'),
					type: 'group|command'
				}
			]
		});
	}

	hasPermission(msg) {
		if(!msg.guild) return this.client.isOwner(msg.author);
		return msg.member.hasPermission('ADMINISTRATOR') || this.client.isOwner(msg.author);
	}

	run(msg, args) {
		const lng = msg.client.translator.resolveLanguage(msg);
		const group = args.cmdOrGrp.group;
		const type = args.cmdOrGrp.group ? 'command' : 'group';
		if(args.cmdOrGrp.isEnabledIn(msg.guild, true)) {
			return msg.reply(
				i18next.t('command.enable.run.group_already_enabled', {
					group,
					type,
					disabledMessage: '$t(command.enable.run.group_disabled)',
					lng
				})
			);
		}
		args.cmdOrGrp.setEnabledIn(msg.guild, true);
		return msg.reply(
			i18next.t('command.enable.run.group_enabled', {
				group,
				type,
				disabledMessage: '$t(command.enable.run.group_disabled)',
				lng
			})
		);
	}
};
