const oneLine = require('common-tags').oneLine;
const Command = require('../../command');
const CommandFormatError = require('../../errors/command-format');
const disambiguation = require('../../util').disambiguation;

module.exports = class EnableCommandCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'enable',
			aliases: ['enable-command', 'cmd-on', 'command-on'],
			group: 'util',
			memberName: 'enable',
			description: 'Enables a command or command group.',
			usage: '<command|group>',
			details: oneLine`
				The argument must be the name/ID (partial or whole) of a command or command group.
				Only administrators may use this command.
			`,
			examples: ['enable util', 'enable Utility', 'enable prefix'],
			guildOnly: true,
			guarded: true
		});
	}

	hasPermission(msg) {
		return msg.member.hasPermission('ADMINISTRATOR');
	}

	async run(msg, arg) {
		if(!arg) throw new CommandFormatError(this, msg.guild);
		const groups = this.client.registry.findGroups(arg);
		if(groups.length === 1) {
			if(groups[0].isEnabledIn(msg.guild)) return msg.reply(`The ${groups[0].name} group is already enabled.`);
			groups[0].setEnabledIn(msg.guild, true);
			msg.reply(`Enabled ${groups[0].name} group.`);
			return null;
		} else if(groups.length > 0) {
			return msg.reply(disambiguation(groups, 'groups'));
		} else {
			const commands = this.client.registry.findCommands(arg);
			if(commands.length === 1) {
				if(commands[0].isEnabledIn(msg.guild)) {
					return msg.reply(`The \`${commands[0].name}\` command is already enabled.`);
				}
				commands[0].setEnabledIn(msg.guild, true);
				msg.reply(`Enabled \`${commands[0].name}\` command.`);
				return null;
			} else if(commands.length > 1) {
				return msg.reply(`No groups found. ${disambiguation(commands, 'commands')}`);
			} else {
				return msg.reply(oneLine`
					Unable to identify command or group.
					Use ${msg.guild.commandUsage('groups', msg.guild)} to view the list of groups.
				`);
			}
		}
	}
};
