const fs = require('fs');
const oneLine = require('common-tags').oneLine;
const Command = require('../base');

module.exports = class LoadCommandCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'load',
			aliases: ['load-command'],
			group: 'commands',
			memberName: 'load',
			description: 'Loads a new command.',
			details: oneLine`
				The argument must be full name of the command in the format of \`group:memberName\`.
				Only the bot owner(s) may use this command.
			`,
			examples: ['load some-command'],
			guarded: true,

			args: [
				{
					key: 'command',
					prompt: 'Which command would you like to load?',
					validate: val => new Promise(resolve => {
						if(!val) return resolve(false);
						const split = val.split(':');
						if(split.length !== 2) return resolve(false);
						if(this.client.registry.findCommands(val).length > 0) {
							return resolve('That command is already registered.');
						}
						const cmdPath = this.client.registry.resolveCommandPath(split[0], split[1]);
						fs.access(cmdPath, fs.constants.R_OK, err => err ? resolve(false) : resolve(true));
						return null;
					}),
					parse: val => {
						const split = val.split(':');
						const cmdPath = this.client.registry.resolveCommandPath(split[0], split[1]);
						delete require.cache[cmdPath];
						return require(cmdPath);
					}
				}
			]
		});
	}

	hasPermission(msg) {
		return this.client.isOwner(msg.author);
	}

	async run(msg, args) {
		this.client.registry.registerCommand(args.command);
		msg.reply(`Loaded \`${this.client.registry.commands.last().name}\` command.`);
		return null;
	}
};
