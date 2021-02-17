const Command = require('../base');
const i18next = require('i18next');
const CommandoTranslatable = require('../../translator/translatable');

module.exports = class ReloadCommandCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'reload',
			aliases: ['reload-command'],
			group: 'commands',
			memberName: 'reload',
			description: new CommandoTranslatable('command.reload.description'),
			details: new CommandoTranslatable('command.reload.details'),
			examples: new CommandoTranslatable('command.reload.examples'),
			ownerOnly: true,
			guarded: true,

			args: [
				{
					key: 'cmdOrGrp',
					label: new CommandoTranslatable('command.reload.args.cmd_or_grp.label'),
					prompt: new CommandoTranslatable('command.reload.args.cmd_or_grp.prompt'),
					type: 'group|command'
				}
			]
		});
	}

	async run(msg, args) {
		const lng = msg.client.translator.resolveLanguage(msg);
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
				await msg.reply(i18next.t('command.reload.run.reload_failed', {
					lng,
					count: isCmd ? 1 : 100
				}));
				return null;
			}
		}

		await msg.reply(i18next.t('command.reload.run.reload_succeed', {
			lng,
			onShards: this.client.shard ? ' $t(common.on_all_shards)' : '',
			groupName: cmdOrGrp.name,
			count: isCmd ? 1 : 100
		}));
		return null;
	}
};
