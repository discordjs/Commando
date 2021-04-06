const Command = require('../base');
const { makeCallback } = require('../../util');

module.exports = class ReloadCommandCommand extends Command {
	constructor(client, props = {}) {
		super(client, {
			name: 'reload',
			aliases: ['reload-command'],
			group: 'commands',
			memberName: 'reload',
			description: makeCallback(locale => locale.commands.commands.reload.constructor.description),
			details: makeCallback(locale => locale.commands.commands.reload.constructor.details),
			examples: ['reload some-command'],
			ownerOnly: true,
			guarded: true,

			args: [
				{
					key: 'cmdOrGrp',
					label: makeCallback(locale => locale.commands.commands.reload.constructor.args.cmdOrGrp.label),
					prompt: makeCallback(locale => locale.commands.commands.reload.constructor.args.cmdOrGrp.prompt),
					type: 'group|command'
				}
			]
		}, props);
	}

	async run(msg, args) {
		const { cmdOrGrp } = args;
		const isCmd = Boolean(cmdOrGrp.groupID);
		cmdOrGrp.reload();

		if(this.client.shard) {
			try {
				await this.client.shard.broadcastEval(`
					const ids = [${this.client.shard.ids.join(',')}];
					if(!this.shard.ids.some(id => ids.includes(id))) {
						this.registry.${isCmd ? 'commands' : 'groups'}.get('${isCmd ? cmdOrGrp.name : cmdOrGrp.id}').reload();
					}
				`);
			} catch(err) {
				this.client.emit('warn', `Error when broadcasting command reload to other shards`);
				this.client.emit('error', err);
				if(isCmd) {
					await msg.reply(msg.locale.commands.commands.reload.run.commandErrorShards({
						name: cmdOrGrp.name
					}));
				} else {
					await msg.reply(msg.locale.commands.commands.reload.run.groupErrorShards({
						name: cmdOrGrp.name
					}));
				}
				return null;
			}
		}

		if(isCmd) {
			await msg.reply(msg.locale.commands.commands.reload.run.commandSuccess({
				name: cmdOrGrp.name,
				where: this.client.shard ? msg.locale.TEMPLATE.onAllShards : ''
			}));
		} else {
			await msg.reply(msg.locale.commands.commands.reload.run.groupSuccess({
				name: cmdOrGrp.name,
				where: this.client.shard ? msg.locale.TEMPLATE.onAllShards : ''
			}));
		}
		return null;
	}
};
