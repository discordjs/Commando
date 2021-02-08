const Command = require('../base');
const { makeCallback } = require('../../util');

module.exports = class LocaleCommand extends Command {
	constructor(client, props = {}) {
		super(client, {
			name: 'locale',
			group: 'util',
			memberName: 'locale',
			description: makeCallback(locale => locale.commands.util.locale.constructor.description),
			details: makeCallback(locale => locale.commands.util.locale.constructor.details),
			examples: ['locale en', 'locale ru', 'locale list'],
			guildOnly: true,

			args: [
				{
					key: 'locale',
					prompt: makeCallback(locale => locale.commands.util.locale.constructor.args[0].prompt),
					validate: (val, msg) => new Promise(resolve => {
						if(!val) return resolve(false);
						const locale = val.toLowerCase();
						if(locale === 'list') return resolve(true);
						if(!this.client.locales.loaded(locale)) {
							return resolve(msg.locale.commands.util.locale.constructor.args[0].validate.invalidLocale);
						}
						return resolve(true);
					}),
					type: 'string',
					min: 2,
					max: 8,
					default: 'en'
				}
			]
		}, props);
	}

	async run(msg, args) {
		// Just output the locale
		if(!args.locale) {
			const locale = msg.guild ? msg.guild.locale.name : this.client.locale.name;
			return msg.reply(msg.locale.commands.util.locale.run.localeIs({
				locale
			}));
		}

		if(args.locale === 'list') {
			return msg.reply(msg.locale.commands.util.locale.run.listLocales({
				locales: Object.keys(this.client.locales.cache).map(
					locale => `\`${locale}\``
				).join(', ')
			}));
		}

		// Check the user's permission before changing anything
		if(msg.guild) {
			if(!msg.member.hasPermission('ADMINISTRATOR') && !this.client.isOwner(msg.author)) {
				return msg.reply(msg.locale.commands.util.locale.run.onlyAdministrator);
			}

			// Save the locale
			const locale = args.locale.toLowerCase();
			msg.guild.locale = locale;
			await msg.reply(msg.locale.commands.util.locale.run.success({
				locale
			}));
		}

		return null;
	}
};
