const { stripIndents, oneLine } = require('common-tags');
const Command = require('../base');

module.exports = class PrefixCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'prefix',
			group: 'util',
			memberName: 'prefix',
			description: 'Shows or sets the command prefix.',
			format: '[prefix/"default"/"none"]',
			details: oneLine`
				If no prefix is provided, the current prefix will be shown.
				If the prefix is "default", the prefix will be reset to the bot's default prefix.
				If the prefix is "none", the prefix will be removed entirely, only allowing mentions to run commands.
				Only administrators may change the prefix.
			`,
			examples: ['prefix', 'prefix -', 'prefix omg!', 'prefix default', 'prefix none'],

			args: [
				{
					key: 'prefix',
					prompt: 'What would you like to set the bot\'s prefix to?',
					type: 'string',
					max: 15,
					default: ''
				}
			]
		});
	}

	async run(msg, args) {
		if(args.prefix) {
			if(msg.guild) {
				if(!msg.member.hasPermission('ADMINISTRATOR') && msg.author.id !== this.client.options.owner) {
					return msg.reply('Only administrators may change the command prefix.');
				}
			} else if(msg.author.id !== this.client.options.owner) {
				return msg.reply('Only the bot owner may change the global command prefix.');
			}

			// Save the prefix
			const lowercase = args.prefix.toLowerCase();
			const prefix = lowercase === 'none' ? '' : args.prefix;
			let response;
			if(lowercase === 'default') {
				if(msg.guild) msg.guild.commandPrefix = null; else this.client.commandPrefix = null;
				response = `Reset the command prefix to the default (currently \`${this.client.options.commandPrefix}\`).`;
			} else {
				if(msg.guild) msg.guild.commandPrefix = prefix; else this.client.commandPrefix = prefix;
				response = prefix ? `Set the command prefix to \`${args.prefix}\`.` : 'Removed the command prefix entirely.';
			}

			msg.reply(`${response} To run commands, use ${msg.anyUsage('command')}.`);
			return null;
		} else {
			const prefix = msg.guild ? msg.guild.commandPrefix : this.client.commandPrefix;
			return msg.reply(stripIndents`
				${prefix ? `The command prefix is \`${prefix}\`.` : 'There is no command prefix.'}
				To run commands, use ${msg.anyUsage('command')}.
			`);
		}
	}
};
