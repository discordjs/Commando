const { stripIndents } = require('common-tags');
const Command = require('../base');
const i18next = require('i18next');
const { CommandoTranslator, CommandoTranslatable } = require('../../translator');

module.exports = class LanguageCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'language',
			group: 'util',
			memberName: 'language',
			description: new CommandoTranslatable('command.language.description'),
			format: new CommandoTranslatable('command.language.format'),
			details: new CommandoTranslatable('command.language.details'),
			examples: new CommandoTranslatable('command.language.examples'),

			args: [
				{
					key: 'language',
					prompt: new CommandoTranslatable('command.language.args.language.prompt'),
					type: 'string',
					max: 15,
					default: ''
				},
				{
					key: 'action',
					prompt: new CommandoTranslatable('command.language.args.action.prompt'),
					type: 'string',
					oneOf: ['load', 'reload'],
					default: ''
				}
			]
		});
	}

	async run(msg, args) {
		const lng = msg.client.translator.resolveLanguage(msg);

		if(args.language && args.action) {
			return this.handleActions(msg, args, lng);
		}

		// Just output the language
		if(!args.language) {
			const language = msg.guild ? msg.guild.language : null;

			if(msg.guild) {
				return msg.reply(stripIndents`
				${language ?
					i18next.t('command.language.run.guild_language_is',
						{
							lng,
							language
						}) : i18next.t('command.language.run.no_guild_language', { lng })}
			`);
			} else {
				return msg.reply(
					i18next.t('command.language.run.bot_language_is',
						{
							lng,
							language: msg.client.defaultLanguage
						}));
			}
		}

		// Check the user's permission before changing anything
		if(msg.guild) {
			if(!msg.member.hasPermission('ADMINISTRATOR') && !this.client.isOwner(msg.author)) {
				return msg.reply(i18next.t('command.language.run.admins_only', { lng }));
			}
		} else if(!this.client.isOwner(msg.author)) {
			return msg.reply(i18next.t('command.language.run.owner_only', { lng }));
		}

		// Save the language
		const lowercase = args.language.toLowerCase();
		const language = args.language;
		let response;
		if(lowercase === 'default') {
			// Reset the language
			if(msg.guild) msg.guild.language = null; else this.client.defaultLanguage = CommandoTranslator.DEFAULT_LANGUAGE;
			const current = this.client.defaultLanguage ? `\`\`${this.client.defaultLanguage}\`\`` :
				this.client.defaultLanguage;
			response = i18next.t('command.language.run.current_language', {
				lng,
				language: current
			});
		} else {
			// Set the language
			if(!i18next.hasResourceBundle(language, 'commando')) {
				const availableLanguages = i18next.languages || [];
				return msg.reply(i18next.t('command.language.run.language_not_supported', {
					lng,
					language,
					context: availableLanguages.length === 0 ? 'short' : '',
					availableLanguages: availableLanguages.filter(languageCode => languageCode !== 'dev')
						.join('\n- ')
				}));
			}
			if(msg.guild) msg.guild.language = language; else this.client.defaultLanguage = language;
			if(language) {
				response = i18next.t('command.language.run.language_set', {
					lng,
					context: msg.guild ? 'guild' : undefined,
					language
				});
			}
		}

		await msg.reply(response);

		return null;
	}

	async handleActions(msg, args, lng) {
		if(!this.client.isOwner(msg.author)) {
			return msg.reply(i18next.t('command.language.run.action_owner_only', { lng }));
		}

		let response;
		switch(args.action) {
			case 'load':
				await i18next.loadLanguages(args.language, err => {
					if(err) {
						response = i18next.t('command.language.run.load_failed',
							{
								lng,
								language: args.language,
								error: JSON.stringify(err)
							});
					} else {
						response = i18next.t('command.language.run.load_complete',
							{
								lng,
								context: i18next.hasResourceBundle(args.language, 'commando') ? 'succeed' : 'failed',
								language: args.language
							});
					}
				});
				if(response) {
					return msg.reply(response);
				} else {
					return msg.reply(i18next.t('command.language.run.load_complete',
						{
							lng,
							context: 'failed',
							language: args.language
						}));
				}
			case 'reload':
				await i18next.reloadResources(args.language, undefined, err => {
					if(err) {
						response = i18next.t('command.language.run.reload_failed',
							{
								lng,
								language: args.language,
								error: JSON.stringify(err)
							});
					} else {
						response = i18next.t('command.language.run.reload_complete',
							{
								lng,
								context: i18next.hasResourceBundle(args.language, 'commando') ? 'succeed' : 'failed',
								language: args.language
							});
					}
				});
				if(response) {
					return msg.reply(response);
				} else {
					return msg.reply(i18next.t('command.language.run.reload_complete',
						{
							lng,
							context: 'failed',
							language: args.language
						}));
				}
			default:
				return msg.reply(i18next.t('command.language.run.action_not_supported',
					{
						lng,
						action: args.action
					}));
		}
	}
};
