const oneLine = require('common-tags').oneLine;
const Command = require('../../command');
const CommandFormatError = require('../../errors/command-format');
const disambiguation = require('../../util').disambiguation;

module.exports = class ReloadCommandCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'reload',
			aliases: ['reload-command'],
			group: 'util',
			memberName: 'reload',
			description: 'Reloads a command.',
			format: '<command>',
			details: oneLine`
				The argument must be the name (partial or whole) of a command.
				Only the bot owner may use this command.
			`,
			examples: ['reload some-command'],
			guarded: true
		});
	}

	hasPermission(msg) {
		return msg.author.id === this.client.options.owner;
	}

	async run(msg, command) {
		if(!command) throw new CommandFormatError(msg);
		const commands = this.client.registry.findCommands(command);
		if(commands.length === 1) {
			if(!commands[0].reload()) return msg.reply(`Couldn't reload \`${commands[0].name}\` command.`);
			msg.reply(`Reloaded \`${commands[0].name}\` command.`);
			return null;
		} else if(commands.length > 1) {
			return msg.reply(disambiguation(commands, 'commands'));
		} else {
			return msg.reply('Unable to identify command.');
		}
	}
};
