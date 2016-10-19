const oneLine = require('common-tags').oneLine;
const Command = require('../../command');
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
			guarded: true,

			args: [
				{
					key: 'command',
					prompt: 'Which command or group would you like to reload?',
					validate: val => {
						if(!val) return false;
						const commands = this.client.registry.findCommands(val);
						if(commands.length === 0) return false;
						if(commands.length > 1) return disambiguation(commands, 'commands');
						return true;
					},
					parse: val => this.client.registry.findCommands(val)[0]
				}
			]
		});
	}

	hasPermission(msg) {
		return msg.author.id === this.client.options.owner;
	}

	async run(msg, args) {
		args.command.reload();
		msg.reply(`Reloaded \`${args.command.name}\` command.`);
		return null;
	}
};
