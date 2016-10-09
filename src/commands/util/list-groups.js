const stripIndents = require('common-tags').stripIndents;
const Command = require('../../command');

module.exports = class ListModulesCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'groups',
			aliases: ['list-groups', 'show-groups'],
			group: 'util',
			memberName: 'list',
			description: 'Lists all command groups.',
			details: 'Only administrators may use this command.',
			guildOnly: true,
			guarded: true
		});
	}

	hasPermission(cmdMsg) {
		return cmdMsg.member.hasPermission('ADMINISTRATOR');
	}

	async run(message) {
		return message.reply(stripIndents`
			__**Groups**__
			${this.client.registry.groups.map(grp =>
				`**${grp.name}:** ${grp.isEnabledIn(message.guild) ? 'Enabled' : 'Disabled'}`
			).join('\n')}
		`);
	}
};
