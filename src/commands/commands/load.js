const fs = require('fs');
const Command = require('../base');
const { makeCallback } = require('../../util');

module.exports = class LoadCommandCommand extends Command {
	constructor(client, props = {}) {
		super(client, {
			name: 'load',
			aliases: ['load-command'],
			group: 'commands',
			memberName: 'load',
			description: makeCallback(locale => locale.commands.commands.load.constructor.description),
			details: makeCallback(locale => locale.commands.commands.load.constructor.details),
			examples: ['load some-command'],
			ownerOnly: true,
			guarded: true,

			args: [
				{
					key: 'command',
					prompt: makeCallback(locale => locale.commands.commands.load.constructor.args[0].prompt),
					validate: (val, msg) => new Promise(resolve => {
						if(!val) return resolve(false);
						const split = val.split(':');
						if(split.length !== 2) return resolve(false);
						if(this.client.registry.findCommands(val).length > 0) {
							return resolve(msg.locale.commands.commands.load.constructor.args[0].validate.alreadyRegistered);
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
		}, props);
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
				await msg.reply(msg.locale.commands.commands.load.run.errorShards({
					command: command.name
				}));
				return null;
			}
		}

		await msg.reply(msg.locale.commands.commands.load.run.success({
			command: command.name,
			where: this.client.shard ? msg.locale.TEMPLATE.onAllShards : ''
		}));
		return null;
	}
};
