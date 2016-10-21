const { oneLine, stripIndents } = require('common-tags');
const Command = require('../../command');
const disambiguation = require('../../util').disambiguation;

module.exports = class ToggleCommandCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'toggle',
			aliases: ['toggle-command'],
			group: 'util',
			memberName: 'toggle',
			description: 'Toggles a command or command group.',
			format: '<command|group>',
			details: oneLine`
				The argument must be the name/ID (partial or whole) of a command or command group.
				Only administrators may use this command.
			`,
			examples: ['toggle util', 'toggle Utility', 'toggle prefix'],
			guarded: true,

			args: [
				{
					key: 'cmdOrGrp',
					label: 'command/group',
					prompt: 'Which command or group would you like to toggle?',
					validate: val => {
						if(!val) return false;
						const groups = this.client.registry.findGroups(val);
						if(groups.length === 1) return true;
						const commands = this.client.registry.findCommands(val);
						if(commands.length === 1) return true;
						if(commands.length === 0 && groups.length === 0) return false;
						return stripIndents`
							${commands.length > 1 ? disambiguation(commands, 'commands') : ''}
							${groups.length > 1 ? disambiguation(groups, 'groups') : ''}
						`;
					},
					parse: val => this.client.registry.findCommands(val)[0] || this.client.registry.findGroups(val)[0]
				}
			]
		});
	}

	hasPermission(msg) {
		if(!msg.guild) return msg.author.id === this.client.options.owner;
		return msg.member.hasPermission('ADMINISTRATOR');
	}

	async run(msg, args) {
		if(args.cmdOrGrp.guarded) {
			return msg.reply(
				`You cannot toggle the \`${args.cmdOrGrp.name}\` ${args.cmdOrGrp.group ? 'command' : 'group'}.`
			);
		}
		const enabled = !args.cmdOrGrp.isEnabledIn(msg.guild);
		args.cmdOrGrp.setEnabledIn(msg.guild, enabled);
		return msg.reply(
			`${enabled ? 'Enabled' : 'Disabled'} the \`${args.cmdOrGrp.name}\` ${args.cmdOrGrp.group ? 'command' : 'group'}.`
		);
	}
};
