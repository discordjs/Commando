const { stripIndents } = require('common-tags');
const Command = require('../base');
const { disambiguation } = require('../../util');
const { CommandoTranslatable } = require('../../translator');
const i18next = require('i18next');


module.exports = class HelpCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'help',
			group: 'util',
			memberName: 'help',
			aliases: ['commands'],
			description: new CommandoTranslatable('command.help.description'),
			details: new CommandoTranslatable('command.help.details'),
			examples: new CommandoTranslatable('command.help.examples'),
			guarded: true,

			args: [
				{
					key: 'command',
					prompt: new CommandoTranslatable('command.help.args.command.prompt'),
					type: 'string',
					default: ''
				}
			]
		});
	}

	async run(msg, args) { // eslint-disable-line complexity
		const groups = this.client.registry.groups;
		const commands = this.client.registry.findCommands(args.command, false, msg);
		const showAll = args.command && args.command.toLowerCase() === 'all';
		const lng = msg.client.translator.resolveLanguage(msg);


		if(args.command && !showAll) {
			if(commands.length === 1) {
				const commandInfo = this.translate(commands[0], lng);
				const helpDescription = i18next.t('command.help.run.description', {
					lng,
					name: commands[0].name,
					description: commandInfo.description,
					guildOnly: commands[0].guildOnly ? ' ($t(common.guild_only))' : '',
					nsfw: commands[0].nsfw ? ' (NSFW)' : '',
					interpolation: { escapeValue: false }
				});

				// Get the translated parts of the help command response
				const helpFormat = i18next.t('command.help.run.format', {
					lng,
					format: msg.anyUsage(`${commands[0].name}${commandInfo.format ? ` ${commandInfo.format}` : ''}`),
					interpolation: { escapeValue: false }
				});

				const helpAliases = commands[0].aliases ? i18next.t('command.help.run.aliases', {
					lng,
					aliases: Array.isArray(commands[0].aliases) ? commands[0].aliases.join(', ') : undefined
				}) : '';

				const helpGroup = i18next.t('command.help.run.group', {
					lng,
					groupName: commands[0].group.name,
					groupID: commands[0].groupID,
					memberName: commands[0].memberName,
					interpolation: { escapeValue: false }
				});

				const helpDetails = i18next.t('command.help.run.details', {
					lng,
					details: commandInfo.details,
					interpolation: { escapeValue: false }
				});

				const helpExamples = commandInfo.examples ? i18next.t('command.help.run.examples', {
					lng,
					examples: Array.isArray(commandInfo.examples) ? commandInfo.examples.join('\n') : undefined,
					interpolation: { escapeValue: false },
					returnObjects: true
				}) : '';

				// Build the help command response
				let help = stripIndents`
					${helpDescription}

					${helpFormat}
				`;

				if(commands[0].aliases.length > 0) help += helpAliases;

				help += helpGroup;

				if(commandInfo.details) help += helpDetails;
				if(commandInfo.examples) help += helpExamples;

				// Send the help command response
				const messages = [];
				try {
					messages.push(await msg.direct(help));
					if(msg.channel.type !== 'dm') {
						messages.push(await msg.reply(i18next.t('common.sent_dm_with_information', { lng: lng })));
					}
				} catch(err) {
					messages.push(await msg.reply(i18next.t('error.unable_to_send_dm', { lng: lng })));
				}
				return messages;
			} else if(commands.length > 15) {
				return msg.reply(i18next.t('command.help.run.multiple_commands_error', { lng: lng }));
			} else if(commands.length > 1) {
				return msg.reply(i18next.t('error.too_many_found_with_list',
					{
						lng,
						label: '$t(common.command_plural)',
						itemList: disambiguation(
							commands, null
						)
					}
				));
			} else {
				return msg.reply(i18next.t('command.help.run.identify_command_error',
					{
						lng,
						usage: msg.usage(
							null, msg.channel.type === 'dm' ? null : undefined, msg.channel.type === 'dm' ? null : undefined
						)
					})
				);
			}
		} else {
			const messages = [];
			try {
				const guild = msg.guild ? msg.guild.name : i18next.t('common.any_server', { lng: lng });
				const commandUsage = Command.usage('command', msg.guild ?
					msg.guild.commandPrefix : null, this.client.user, lng);
				const example = Command.usage('prefix', msg.guild ? msg.guild.commandPrefix : null, this.client.user, lng);
				const usageWithoutPrefix = Command.usage('command', null, null);
				const usage = this.usage('<command>', null, null, lng);
				const usageAll = this.usage('all', null, null, lng);
				const availableCommands = i18next.t(showAll ? 'common.all_commands' : 'common.available_commands', {
					lng,
					inGuildOrDm: msg.guild ? `$t(common.in_guild) ${msg.guild.name}` : '$t(common.in_this_dm)'
				});
				const commandList = groups.filter(grp => grp.commands
					.some(cmd => !cmd.hidden && (showAll || cmd.isUsable(msg))))
					.map(grp => stripIndents`
							__${grp.name}__
							${grp.commands.filter(cmd => !cmd.hidden && (showAll || cmd.isUsable(msg)))
						.map(cmd => `**${cmd.name}:** ${typeof cmd.description === 'string' || !cmd.description ||
						typeof cmd.description === 'undefined' ? cmd.description :
							i18next.t(cmd.description.key, { lng: lng })}${cmd.nsfw ? ' (NSFW)' : ''}`)
						.join('\n')
					}
						`)
					.join('\n\n');
				messages.push(await msg.direct(i18next.t('command.help.run.command_usage', {
					lng,
					guild,
					commandUsage,
					example,
					usageWithoutPrefix,
					usage,
					usageAll,
					availableCommands,
					commandList,
					interpolation: { escapeValue: false }
				}), { split: true }));
				if(msg.channel.type !== 'dm') {
					messages.push(await msg.reply(i18next.t('common.sent_dm_with_information', { lng: lng })));
				}
			} catch(err) {
				messages.push(await msg.reply(i18next.t('error.unable_to_send_dm', { lng: lng })));
			}
			return messages;
		}
	}
};
