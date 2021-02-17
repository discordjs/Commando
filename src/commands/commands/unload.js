const Command = require('../base');
const i18next = require('i18next');
const CommandoTranslatable = require('../../translator/translatable');

module.exports = class UnloadCommandCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'unload',
			aliases: ['unload-command'],
			group: 'commands',
			memberName: 'unload',
			ownerOnly: true,
			guarded: true,

			description: new CommandoTranslatable('command.unload.description'),
			details: new CommandoTranslatable('command.unload.details'),
			examples: new CommandoTranslatable('command.unload.examples'),
			args: [
				{
					key: 'command',
					prompt: new CommandoTranslatable('command.unload.args.command.prompt'),
					type: 'command'
				}
			]
		});
	}

	async run(msg, args) {
		const lng = msg.client.translator.resolveLanguage(msg);
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

				await msg.reply(i18next.t('command.unload.run.unload_failed', {
					lng,
					groupName: args.command.name
				}));
				return null;
			}
		}
		await msg.reply(i18next.t('command.unload.run.unload_succeed', {
			lng,
			onShards: this.client.shard ? ' $t(common.on_all_shards)' : '',
			groupName: args.command.name
		}));
		return null;
	}
};
