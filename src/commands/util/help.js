const { stripIndents } = require('common-tags');
const Command = require('../base');
const { makeCallback, disambiguation, execCallback } = require('../../util');

module.exports = class HelpCommand extends Command {
	constructor(client, props = {}) {
		super(client, {
			name: 'help',
			group: 'util',
			memberName: 'help',
			aliases: ['commands'],
			description: makeCallback(locale => locale.commands.util.help.constructor.description),
			details: makeCallback(locale => locale.commands.util.help.constructor.details),
			examples: ['help', 'help prefix'],
			guarded: true,

			args: [
				{
					key: 'command',
					prompt: makeCallback(locale => locale.commands.util.help.constructor.args[0].prompt),
					type: 'string',
					default: ''
				}
			]
		}, props);
	}

	async run(msg, args) { // eslint-disable-line complexity
		const groups = this.client.registry.groups;
		const commands = this.client.registry.findCommands(args.command, false, msg);
		const showAll = args.command && args.command.toLowerCase() === 'all';
		if(args.command && !showAll) {
			if(commands.length === 1) {
				let help = msg.locale.commands.util.help.run.show({
					name: commands[0].name,
					description: execCallback(commands[0].description, msg.locale),
					onlyServers: commands[0].guildOnly ? msg.locale.commands.util.help.run.onlyServer : '',
					onlyNSFW: commands[0].nsfw ? msg.locale.commands.util.help.run.onlyNSFW : '',
					format: msg.anyUsage(`${commands[0].name}${commands[0].format ? ` ${commands[0].format}` : ''}`)
				});
				if(commands[0].aliases.length > 0) {
					help += msg.locale.commands.util.help.run.showAliases({
						aliases: commands[0].aliases.join(', ')
					});
				}
				help += msg.locale.commands.util.help.run.showGroup({
					group: execCallback(commands[0].group.name, msg.locale),
					groupID: commands[0].groupID,
					memberName: commands[0].memberName
				});
				if(commands[0].details) {
					help += msg.locale.commands.util.help.run.showDetails({
						details: execCallback(commands[0].details, msg.locale)
					});
				}
				if(commands[0].exaples) {
					help += msg.locale.commands.util.help.run.showExamples({
						examples: commands[0].examples.join('\n')
					});
				}

				const messages = [];
				try {
					messages.push(await msg.direct(help));
					if(msg.channel.type !== 'dm') messages.push(await msg.reply(msg.locale.commands.util.help.run.success));
				} catch(err) {
					messages.push(await msg.reply(msg.locale.commands.util.help.run.dmsDisabled));
				}
				return messages;
			} else if(commands.length > 15) {
				return msg.reply(msg.locale.commands.util.help.run.multipleFound);
			} else if(commands.length > 1) {
				return msg.reply(disambiguation(commands, msg.locale, msg.locale.commands.util.help.run.disambiguation));
			} else {
				return msg.reply(msg.locale.commands.util.help.run.unableIdentify({
					help: msg.usage(null, msg.channel.type === 'dm' ? null : undefined, msg.channel.type === 'dm' ? null : undefined)
				}));
			}
		} else {
			const messages = [];
			try {
				messages.push(await msg.direct(msg.locale.commands.util.help.run.showAll({
					runWhere: msg.guild ? msg.guild.name : msg.locale.commands.util.help.run.anyServer,
					usage: Command.usage('command', msg.guild ? msg.guild.commandPrefix : null, this.client.user),
					example: Command.usage('prefix', msg.guild ? msg.guild.commandPrefix : null, this.client.user),
					usageDM: Command.usage('command', null, null),
					helpDetailed: this.usage('<command>', null, null),
					helpAll: this.usage('all', null, null),
					commandsWhere: showAll ? msg.locale.commands.util.help.run.allCommands :
						msg.guild ? msg.locale.commands.util.help.run.availableInGuild({ guild: msg.guild }) :
							msg.locale.commands.util.help.run.availableInDM,
					commands: groups.filter(grp => grp.commands.some(cmd => !cmd.hidden && (showAll || cmd.isUsable(msg))))
						.map(grp => stripIndents`
							__${grp.name}__
							${grp.commands.filter(cmd => !cmd.hidden && (showAll || cmd.isUsable(msg)))
								.map(cmd =>
									`**${cmd.name}:** ${execCallback(cmd.description, msg.locale)}${cmd.nsfw ? msg.locale.commands.util.help.run.onlyNSFW : ''}`
								).join('\n')
							}
						`).join('\n\n')
				}), { split: true }));
				if(msg.channel.type !== 'dm') messages.push(await msg.reply(msg.locale.commands.util.help.run.success));
			} catch(err) {
				messages.push(await msg.reply(msg.locale.commands.util.help.run.dmsDisabled));
			}
			return messages;
		}
	}
};
