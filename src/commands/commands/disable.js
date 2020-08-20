const Command = require('../base');
const i18next = require('i18next');
const { CommandoTranslatable } = require('../../translator');

module.exports = class DisableCommandCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'disable',
			aliases: ['disable-command', 'cmd-off', 'command-off'],
			group: 'commands',
			memberName: 'disable',
			description: new CommandoTranslatable('command.disable.description'),
			details: new CommandoTranslatable('command.disable.details'),
			examples: new CommandoTranslatable('command.disable.examples'),
			guarded: true,

			args: [
				{
					key: 'cmdOrGrp',
					label: new CommandoTranslatable('command.disable.args.cmd_or_grp.label'),
					prompt: new CommandoTranslatable('command.disable.args.cmd_or_grp.prompt'),
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
		const groupName = args.cmdOrGrp.name;
		const type = args.cmdOrGrp.group ? 'command' : 'group';
		const lng = msg.client.translator.resolveLanguage(msg);
		if(!args.cmdOrGrp.isEnabledIn(msg.guild, true)) {
			return msg.reply(
				i18next.t('command.disable.run.group_already_disabled', {
					groupName,
					type,
					lng
				})
			);
		}
		if(args.cmdOrGrp.guarded) {
			return msg.reply(
				i18next.t('command.disable.run.cannot_disable_group', {
					groupName,
					type,
					lng
				})
			);
		}
		args.cmdOrGrp.setEnabledIn(msg.guild, false);
		return msg.reply(i18next.t('command.disable.run.group_disabled', {
			groupName,
			type,
			lng
		}));
	}
};
