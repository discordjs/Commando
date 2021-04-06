const Command = require('../base');
const { makeCallback } = require('../../util');

module.exports = class EnableCommandCommand extends Command {
	constructor(client, props = {}) {
		super(client, {
			name: 'enable',
			aliases: ['enable-command', 'cmd-on', 'command-on'],
			group: 'commands',
			memberName: 'enable',
			description: makeCallback(locale => locale.commands.commands.enable.constructor.description),
			details: makeCallback(locale => locale.commands.commands.enable.constructor.details),
			examples: ['enable util', 'enable Utility', 'enable prefix'],
			guarded: true,

			args: [
				{
					key: 'cmdOrGrp',
					label: makeCallback(locale => locale.commands.commands.enable.constructor.args.cmdOrGrp.label),
					prompt: makeCallback(locale => locale.commands.commands.enable.constructor.args.cmdOrGrp.prompt),
					type: 'group|command'
				}
			]
		}, props);
	}

	hasPermission(msg) {
		if(!msg.guild) return this.client.isOwner(msg.author);
		return msg.member.permissions.has('ADMINISTRATOR') || this.client.isOwner(msg.author);
	}

	run(msg, args) {
		const group = args.cmdOrGrp.group;
		if(args.cmdOrGrp.isEnabledIn(msg.guild, true)) {
			return msg.reply(
				args.cmdOrGrp.group ?
				msg.locale.commands.commands.enable.run.groupGuarded({ name: args.cmdOrGrp.name }) :
				msg.locale.commands.commands.enable.run.commandGuarded({
					name: args.cmdOrGrp.name,
					but: group && !group.isEnabledIn(msg.guild) ? msg.locale.commands.commands.enable.run.groupDisabled({ group: group.name }) : ''
				})
			);
		}
		args.cmdOrGrp.setEnabledIn(msg.guild, true);
		return msg.reply(
			args.cmdOrGrp.group ?
			msg.locale.commands.commands.enable.run.groupSuccess({ name: args.cmdOrGrp.name }) :
			msg.locale.commands.commands.enable.run.commandSuccess({
				name: args.cmdOrGrp.name,
				but: group && !group.isEnabledIn(msg.guild) ? msg.locale.commands.commands.enable.run.groupDisabled({ group: group.name }) : ''
			})
		);
	}
};
