const { oneLine } = require('common-tags');
const Command = require('../base');

module.exports = class EnableCommandCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'enable',
			aliases: ['enable-command', 'cmd-on', 'command-on'],
			group: 'commands',
			memberName: 'enable',
			description: 'Enables a command or command group.',
			details: oneLine`
				The argument must be the name/ID (partial or whole) of a command or command group.
				Only administrators may use this command.
			`,
			examples: ['enable util', 'enable Utility', 'enable prefix'],
			guarded: true,

			args: [
				{
					key: 'cmdOrGrp',
					label: 'command/group',
					prompt: 'Which command or group would you like to enable?',
					type: 'command-or-group'
				}
			]
		});
	}

	hasPermission(msg) {
		if(!msg.guild) return this.client.isOwner(msg.author);
		return msg.member.hasPermission('ADMINISTRATOR') || this.client.isOwner(msg.author);
	}

	run(msg, args) {
		if(args.cmdOrGrp.isEnabledIn(msg.guild)) {
			return msg.reply(
				`The \`${args.cmdOrGrp.name}\` ${args.cmdOrGrp.group ? 'command' : 'group'} is already enabled.`
			);
		}
		args.cmdOrGrp.setEnabledIn(msg.guild, true);
		return msg.reply(`Enabled the \`${args.cmdOrGrp.name}\` ${args.cmdOrGrp.group ? 'command' : 'group'}.`);
	}
};
