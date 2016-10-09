const oneLine = require('common-tags').oneLine;
const Command = require('../../command');
const CommandFormatError = require('../../errors/command-format');
const disambiguation = require('../../util').disambiguation;

module.exports = class ToggleCommandCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'toggle',
			aliases: ['toggle-command'],
			group: 'util',
			memberName: 'toggle',
			description: 'Toggles a command or command group.',
			usage: '<command|group>',
			details: oneLine`
				The argument must be the name/ID (partial or whole) of a command or command group.
				Only administrators may use this command.
			`,
			examples: ['toggle util', 'toggle Utility', 'toggle prefix'],
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
			if(groups[0].guarded) return msg.reply(`You cannot toggle the ${groups[0].name} group.`);
			const enabled = groups[0].isEnabledIn(msg.guild);
			groups[0].setEnabledIn(msg.guild, enabled);
			return msg.reply(`${enabled ? 'Enabled' : 'Disabled'} ${groups[0].name} group.`);
		} else if(groups.length > 0) {
			return msg.reply(disambiguation(groups, 'groups'));
		} else {
			const commands = this.client.registry.findCommands(arg);
			if(commands.length === 1) {
				if(commands[0].guarded) return msg.reply(`You cannot toggle the \`${commands[0].name}\` command.`);
				const enabled = commands[0].isEnabledIn(msg.guild);
				commands[0].setEnabledIn(msg.guild, enabled);
				return msg.reply(`${enabled ? 'Enabled' : 'Disabled'} \`${commands[0].name}\` command.`);
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
