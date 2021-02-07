const Command = require('../base');
const { makeCallback } = require('../../util');

module.exports = class ListGroupsCommand extends Command {
	constructor(client, props = {}) {
		super(client, {
			name: 'groups',
			aliases: ['list-groups', 'show-groups'],
			group: 'commands',
			memberName: 'groups',
			description: makeCallback(locale => locale.commands.commands.groups.constructor.description),
			details: makeCallback(locale => locale.commands.commands.groups.constructor.details),
			guarded: true
		}, props);
	}

	hasPermission(msg) {
		if(!msg.guild) return this.client.isOwner(msg.author);
		return msg.member.permissions.has('ADMINISTRATOR') || this.client.isOwner(msg.author);
	}

	run(msg) {
		return msg.reply(msg.locale.commands.commands.groups.run.success({
			groups: this.client.registry.groups.map(grp =>
				`**${grp.name}:** ${grp.isEnabledIn(msg.guild) ? msg.locale.TEMPLATE.enabled : msg.locale.TEMPLATE.disabled}`
			).join('\n')
		}));
	}
};
