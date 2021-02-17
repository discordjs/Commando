const { stripIndents } = require('common-tags');
const Command = require('../base');
const i18next = require('i18next');
const CommandoTranslator = require('../../translator/index');
const CommandoTranslatable = require('../../translator/translatable');

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
					oneOf: ['load', 'reload', 'unload'],
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

		const lowercase = args.language.toLowerCase();
		const languageCode = args.language;

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
			if(!i18next.hasResourceBundle(languageCode, msg.client.translator.defaultNamespace)) {
				const availableLanguages = msg.client.translator.languages.filter(language => language.loaded)
					.map(language => language.code);

				return msg.reply(i18next.t('command.language.run.language_not_supported', {
					lng,
					language: languageCode,
					context: availableLanguages.length === 0 ? 'short' : '',
					availableLanguages: availableLanguages.join(', ')
				}));
			}
			if(msg.guild) msg.guild.language = languageCode; else this.client.defaultLanguage = languageCode;
			if(languageCode) {
				response = i18next.t('command.language.run.language_set', {
					lng,
					context: msg.guild ? 'guild' : undefined,
					language: languageCode
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

		const language = msg.client.translator.languages.find(languageCode => languageCode.code === args.language);

		let response;
		switch(args.action) {
			case 'load':
				await language.load()
					.then(() => {
						// We can assume that the language has been loaded#
						response = i18next.t('command.language.run.load_complete',
							{
								lng,
								context: language.loaded ? 'succeed' : 'failed',
								language: args.language
							});
					})
					.catch(err => {
						response = i18next.t('command.language.run.load_failed',
							{
								lng,
								language: args.language,
								error: JSON.stringify(err),
								interpolation: { escapeValue: false }
							});
					});

				return msg.reply(response || i18next.t('command.language.run.load_complete',
					{
						lng,
						context: 'failed',
						language: args.language
					}));

			case 'reload':
				await language.reload()
					.then(() => {
						// We can assume that the language has been reloaded
						response = i18next.t('command.language.run.reload_complete',
							{
								lng,
								context: language.loaded ? 'succeed' : 'failed',
								language: args.language
							});
					})
					.catch(err => {
						response = i18next.t('command.language.run.reload_failed',
							{
								lng,
								language: args.language,
								error: JSON.stringify(err),
								interpolation: { escapeValue: false }
							});
					});

				// Check if language really has been reloaded
				if(!i18next.hasResourceBundle(args.language, msg.client.translator.defaultNamespace)) {
					response = null;
				}

				return msg.reply(response || i18next.t('command.language.run.reload_complete',
					{
						lng,
						context: 'failed',
						language: args.language
					}));
			case 'unload':
				await language.unload()
					.then(() => {
						response = i18next.t('command.language.run.unload_complete',
							{
								lng,
								context: !language.loaded ? 'succeed' : 'failed',
								language: args.language
							});
					})
					.catch(err => {
						response = i18next.t('command.language.run.unload_failed',
							{
								lng,
								language: args.language,
								error: JSON.stringify(err)
							});
					});

				return msg.reply(response || i18next.t('command.language.run.unload_complete',
					{
						lng,
						context: 'failed',
						language: args.language
					}));
			default:
				return msg.reply(i18next.t('command.language.run.action_not_supported',
					{
						lng,
						action: args.action
					}));
		}
	}
};
