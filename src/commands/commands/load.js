const fs = require('fs');
const Command = require('../base');
const { CommandoTranslatable } = require('../../translator');

module.exports = class LoadCommandCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'load',
			aliases: ['load-command'],
			group: 'commands',
			memberName: 'load',
			description: new CommandoTranslatable('command.load.description'),
			details: new CommandoTranslatable('command.load.details'),
			examples: new CommandoTranslatable('command.load.examples'),
			ownerOnly: true,
			guarded: true,

			args: [
				{
					key: 'command',
					prompt: new CommandoTranslatable('command.load.args.command.prompt'),
					validate: val => new Promise(resolve => {
						if(!val) return resolve(false);
						const split = val.split(':');
						if(split.length !== 2) return resolve(false);
						if(this.client.registry.findCommands(val).length > 0) {
							return resolve(new CommandoTranslatable('command.load.run.command_already_registered'));
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

	async run(msg, args) {
		this.client.registry.registerCommand(args.command);
		const command = this.client.registry.commands.last();

		if(this.client.shard) {
			try {
				await this.client.shard.broadcastEval(`
					const ids = [${this.client.shard.ids.join(',')}];
					if(!this.shard.ids.some(id => ids.includes(id))) {
						const cmdPath = this.registry.resolveCommandPath('${command.groupID}', '${command.name}');
						delete require.cache[cmdPath];
						this.registry.registerCommand(require(cmdPath));
					}
				`);
			} catch(err) {
				this.client.emit('warn', `Error when broadcasting command load to other shards`);
				this.client.emit('error', err);
				await msg.reply(`Loaded \`${command.name}\` command, but failed to load on other shards.`);
				return null;
			}
		}

		await msg.reply(`Loaded \`${command.name}\` command${this.client.shard ? ' on all shards' : ''}.`);
		return null;
	}
};
