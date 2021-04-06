const Command = require('../base');
const { makeCallback } = require('../../util');

module.exports = class DisableCommandCommand extends Command {
	constructor(client, props = {}) {
		super(client, {
			name: 'disable',
			aliases: ['disable-command', 'cmd-off', 'command-off'],
			group: 'commands',
			memberName: 'disable',
			description: makeCallback(locale => locale.commands.commands.disable.constructor.description),
			details: makeCallback(locale => locale.commands.commands.disable.constructor.details),
			examples: ['disable util', 'disable Utility', 'disable prefix'],
			guarded: true,

			args: [
				{
					key: 'cmdOrGrp',
					label: makeCallback(locale => locale.commands.commands.disable.constructor.args.cmdOrGrp.label),
					prompt: makeCallback(locale => locale.commands.commands.disable.constructor.args.cmdOrGrp.prompt),
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
		if(!args.cmdOrGrp.isEnabledIn(msg.guild, true)) {
			return msg.reply(
				args.cmdOrGrp.group ?
				msg.locale.commands.commands.disable.run.groupAlreadyDisabled({ name: args.cmdOrGrp.name }) :
				msg.locale['commands.commands.disable.run.commandAlreadyDisabled']({ name: args.cmdOrGrp.name })
			);
		}
		if(args.cmdOrGrp.guarded) {
			return msg.reply(
				args.cmdOrGrp.group ?
				msg.locale.commands.commands.disable.run.groupGuarded({ name: args.cmdOrGrp.name }) :
				msg.locale.commands.commands.disable.run.commandGuarded({ name: args.cmdOrGrp.name })
			);
		}
		args.cmdOrGrp.setEnabledIn(msg.guild, false);
		return msg.reply(
			args.cmdOrGrp.group ?
			msg.locale['commands.commands.disable.run.groupSuccess']({ name: args.cmdOrGrp.name }) :
			msg.locale['commands.commands.disable.run.commandSuccess']({ name: args.cmdOrGrp.name })
		);
	}
};
