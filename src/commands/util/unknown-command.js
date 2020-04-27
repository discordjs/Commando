const Command = require('../base');

module.exports = class UnknownCommandCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'unknown-command',
			group: 'util',
			memberName: 'unknown-command',
			description: 'Displays help information for when an unknown command is used.',
			examples: ['unknown-command kickeverybodyever'],
			unknown: true,
			hidden: true
		});
	}

	run(msg) {
		try {
			return msg.channel.send(
				`Unknown command \`${msg.content}\`. Use ${msg.anyUsage(
				'help',
				msg.guild ? undefined : null,
				msg.guild ? undefined : null
			)} to view the command list.`
			);
		} catch(exception) { return exception; }
	}
};
