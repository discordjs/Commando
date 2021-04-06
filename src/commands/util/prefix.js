const Command = require('../base');
const { makeCallback } = require('../../util');

module.exports = class PrefixCommand extends Command {
	constructor(client, props = {}) {
		super(client, {
			name: 'prefix',
			group: 'util',
			memberName: 'prefix',
			description: makeCallback(locale => locale.commands.util.prefix.constructor.description),
			format: '[prefix/"default"/"none"]',
			details: makeCallback(locale => locale.commands.util.prefix.constructor.details),
			examples: ['prefix', 'prefix -', 'prefix omg!', 'prefix default', 'prefix none'],

			args: [
				{
					key: 'prefix',
					prompt: makeCallback(locale => locale.commands.util.prefix.constructor.args.prefix.prompt),
					type: 'string',
					max: 15,
					default: ''
				}
			]
		}, props);
	}

	async run(msg, args) {
		// Just output the prefix
		if(!args.prefix) {
			const prefix = msg.guild ? msg.guild.commandPrefix : this.client.commandPrefix;
			return msg.reply(msg.locale.commands.util.prefix.run.getPrefix({
				prefix: prefix ?
					msg.locale.commands.util.prefix.run.prefixIs({ prefix }) :
					msg.locale.commands.util.prefix.run.prefixIsNone,
				command: msg.anyUsage('command')
			}));
		}

		// Check the user's permission before changing anything
		if(msg.guild) {
			if(!msg.member.permissions.has('ADMINISTRATOR') && !this.client.isOwner(msg.author)) {
				return msg.reply(msg.locale.commands.util.prefix.run.onlyAdministrator);
			}
		} else if(!this.client.isOwner(msg.author)) {
			return msg.reply(msg.locale.commands.util.prefix.run.onlyOwner);
		}

		// Save the prefix
		const lowercase = args.prefix.toLowerCase();
		const prefix = lowercase === 'none' ? '' : args.prefix;
		let response;
		if(lowercase === 'default') {
			if(msg.guild) msg.guild.commandPrefix = null; else this.client.commandPrefix = null;
			const current = this.client.commandPrefix ? `\`\`${this.client.commandPrefix}\`\`` : msg.locale.commands.util.prefix.run.noPrefix;
			response = msg.locale.commands.util.prefix.run.setDefault({
				prefix: current
			});
		} else {
			if(msg.guild) msg.guild.commandPrefix = prefix; else this.client.commandPrefix = prefix;
			response = prefix ?
				msg.locale.commands.util.prefix.run.setPrefix({ prefix: args.prefix }) :
				msg.locale.commands.util.prefix.run.removePrefix;
		}

		await msg.reply(msg.locale.commands.util.prefix.run.success({
			response,
			command: msg.anyUsage('command')
		}));
		return null;
	}
};
