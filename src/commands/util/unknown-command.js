const Command = require('../base');
const { makeCallback } = require('../../util');

module.exports = class UnknownCommandCommand extends Command {
	constructor(client, props = {}) {
		super(client, {
			name: 'unknown-command',
			group: 'util',
			memberName: 'unknown-command',
			description: makeCallback(locale => locale.commands.util.unknownCommand.constructor.description),
			examples: ['unknown-command kickeverybodyever'],
			unknown: true,
			hidden: true
		}, props);
	}

	run(msg) {
		return msg.reply(msg.locale.commands.util.unknownCommand.run.success({
			help: msg.anyUsage('help', msg.guild ? undefined : null, msg.guild ? undefined : null)
		}));
	}
};
