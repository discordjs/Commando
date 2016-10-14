const { stripIndents, oneLine } = require('common-tags');
const Command = require('../../command');
const disambiguation = require('../../util').disambiguation;

module.exports = class HelpCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'help',
			group: 'util',
			memberName: 'help',
			aliases: ['commands'],
			description: 'Displays a list of available commands, or detailed information for a specified command.',
			usage: '[command]',
			details: oneLine`
				The command may be part of a command name or a whole command name.
				If it isn't specified, all available commands will be listed.
			`,
			examples: ['help', 'help roll'],
			guarded: true
		});
	}

	async run(msg, arg) {
		const groups = this.client.registry.groups;
		const commands = this.client.registry.findCommands(arg, false, msg);
		const showAll = arg && arg.toLowerCase() === 'all';
		if(arg && !showAll) {
			if(commands.length === 1) {
				let help = stripIndents`
					${oneLine`
						__Command **${commands[0].name}**:__ ${commands[0].description}
						${commands[0].guildOnly ? ' (Usable only in servers)' : ''}
					`}

					**Usage:** ${commands[0].makeUsage(commands[0].usage, msg.guild)}
				`;
				if(commands[0].aliases.length > 0) help += `\n**Aliases:** ${commands[0].aliases.join(', ')}`;
				help += `\n${oneLine`
					**Group:** ${this.client.registry.findGroups(commands[0].group)[0].name}
					(\`${commands[0].group}:${commands[0].memberName}\`)
				`}`;
				if(commands[0].details) help += `\n**Details:** ${commands[0].details}`;
				if(commands[0].examples) help += `\n**Examples:**\n${commands[0].examples.join('\n')}`;
				const promises = [msg.direct(help)];
				if(msg.channel.type !== 'dm') promises.push(msg.reply('Sent a DM to you with information.'));
				return Promise.all(promises);
			} else if(commands.length > 1) {
				return msg.reply(disambiguation(commands, 'commands'));
			} else {
				return msg.reply(
					`Unable to identify command. Use ${this.usage(null, msg.guild)} to view the list of all commands.`
				);
			}
		} else {
			const promises = [msg.direct(stripIndents`
				${oneLine`
					To run a command in ${msg.guild || 'any server'},
					use ${Command.usage('command', msg.guild ? msg.guild.commandPrefix : null, this.client.user)}.
					For example, ${Command.usage('prefix', msg.guild ? msg.guild.commandPrefix : null, this.client.user)}.
				`}
				To run a command in this DM, simply use ${Command.usage('command', null, null)} with no prefix.
				Hyphens (\`-\`) are always optional in commands.

				Use ${this.makeUsage('<command>', null, null)} to view detailed information about a specific command.
				Use ${this.makeUsage('all', null, null)} to view a list of *all* commands, not just available ones.

				__**${showAll ? 'All commands' : `Available commands in ${msg.guild || 'this DM'}`}**__

				${(showAll ? groups : groups.filter(grp => grp.commands.some(cmd => cmd.isUsable(msg))))
					.map(grp => stripIndents`
						__${grp.name}__
						${(showAll ? grp.commands : grp.commands.filter(cmd => cmd.isUsable(msg)))
							.map(cmd => `**${cmd.name}:** ${cmd.description}`).join('\n')
						}
					`).join('\n\n')
				}
			`, { split: true })];
			if(msg.channel.type !== 'dm') promises.push(msg.reply('Sent a DM to you with information.'));
			return Promise.all(promises);
		}
	}
};
