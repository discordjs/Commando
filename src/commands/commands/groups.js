const Command = require('../base');
const i18next = require('i18next');
const { CommandoTranslatable } = require('../../translator');

module.exports = class ListGroupsCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'groups',
			aliases: ['list-groups', 'show-groups'],
			group: 'commands',
			memberName: 'groups',
			description: new CommandoTranslatable('command.groups.description'),
			details: new CommandoTranslatable('command.groups.details'),
			guarded: true
		});
	}

	hasPermission(msg) {
		if(!msg.guild) return this.client.isOwner(msg.author);
		return msg.member.hasPermission('ADMINISTRATOR') || this.client.isOwner(msg.author);
	}

	run(msg) {
		const lng = msg.client.translator.resolveLanguage(msg);
		return msg.reply(i18next.t('command.groups.run.response', {
			lng,
			groups: `${this.client.registry.groups.map(grp =>
				`**${grp.name}:** ${grp.isEnabledIn(msg.guild) ?
					'$t(common.enabled_uppercase)' : '$t(common.disabled_uppercase)'}`
			)
				.join('\n')}`
		}));
	}
};
