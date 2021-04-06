const Command = require('../base');
const { makeCallback } = require('../../util');

module.exports = class UnloadCommandCommand extends Command {
	constructor(client, props = {}) {
		super(client, {
			name: 'unload',
			aliases: ['unload-command'],
			group: 'commands',
			memberName: 'unload',
			description: makeCallback(locale => locale.commands.commands.unload.constructor.description),
			details: makeCallback(locale => locale.commands.commands.unload.constructor.details),
			examples: ['unload some-command'],
			ownerOnly: true,
			guarded: true,

			args: [
				{
					key: 'command',
					prompt: makeCallback(locale => locale.commands.commands.unload.constructor.args.command.prompt),
					type: 'command'
				}
			]
		}, props);
	}

	async run(msg, args) {
		args.command.unload();

		if(this.client.shard) {
			try {
				await this.client.shard.broadcastEval(`
					const ids = [${this.client.shard.ids.join(',')}];
					if(!this.shard.ids.some(id => ids.includes(id))) {
						this.registry.commands.get('${args.command.name}').unload();
					}
				`);
			} catch(err) {
				this.client.emit('warn', `Error when broadcasting command unload to other shards`);
				this.client.emit('error', err);
				await msg.reply(msg.locale.commands.commands.unload.run.errorShards({
					name: args.command.name
				}));
				return null;
			}
		}

		await msg.reply(msg.locale.commands.commands.unload.run.success({
			name: args.command.name,
			where: this.client.shard ? msg.locale.TEMPLATE.onAllShards : ''
		}));
		return null;
	}
};
