const { stripIndents } = require('common-tags');
const Command = require('../base');
const i18next = require('i18next');
const CommandoTranslatable = require('../../translator/translatable');

module.exports = class PrefixCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'prefix',
			group: 'util',
			memberName: 'prefix',
			description: new CommandoTranslatable('command.prefix.description'),
			format: new CommandoTranslatable('command.prefix.format'),
			details: new CommandoTranslatable('command.prefix.details'),
			examples: new CommandoTranslatable('command.prefix.examples'),

			args: [
				{
					key: 'prefix',
					prompt: new CommandoTranslatable('command.prefix.args.prefix.prompt'),
					type: 'string',
					max: 15,
					default: ''
				}
			]
		});
	}

	async run(msg, args) {
		const lng = msg.client.translator.resolveLanguage(msg);

		// Just output the prefix
		if(!args.prefix) {
			const prefix = msg.guild ? msg.guild.commandPrefix : this.client.commandPrefix;
			return msg.reply(stripIndents`
				${prefix ?
				i18next.t('command.prefix.run.the_prefix_is',
					{
						lng,
						prefix
					}) : i18next.t('command.prefix.run.no_command_prefix', { lng })}
				${i18next.t('command.prefix.run.how_to_run', { lng, usage: msg.anyUsage('command') })}.
			`);
		}

		// Check the user's permission before changing anything
		if(msg.guild) {
			if(!msg.member.hasPermission('ADMINISTRATOR') && !this.client.isOwner(msg.author)) {
				return msg.reply(i18next.t('command.prefix.run.admins_only', { lng }));
			}
		} else if(!this.client.isOwner(msg.author)) {
			return msg.reply(i18next.t('command.prefix.run.owner_only', { lng }));
		}

		// Save the prefix
		const lowercase = args.prefix.toLowerCase();
		const prefix = lowercase === 'none' ? '' : args.prefix;
		let response;
		if(lowercase === 'default') {
			if(msg.guild) msg.guild.commandPrefix = null; else this.client.commandPrefix = null;
			const current = this.client.commandPrefix ? `\`\`${this.client.commandPrefix}\`\`` :
				i18next.t('command.prefix.run.no_prefix', { lng });
			response = i18next.t('command.prefix.run.current_prefix', {
				lng,
				prefix: current
			});
		} else {
			if(msg.guild) msg.guild.commandPrefix = prefix; else this.client.commandPrefix = prefix;
			response = prefix ? i18next.t('command.prefix.run.prefix_set_to', {
				lng,
				prefix
			}) : i18next.t('command.prefix.run.prefix_removed', { lng });
		}

		await msg.reply(i18next.t('command.prefix.run.prefix_usage', {
			lng,
			response,
			usage: msg.anyUsage('command')
		}));
		return null;
	}
};
