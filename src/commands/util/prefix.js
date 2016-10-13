const { stripIndents, oneLine } = require('common-tags');
const Command = require('../../command');

module.exports = class PrefixCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'prefix',
			group: 'util',
			memberName: 'prefix',
			description: 'Shows or sets the command prefix.',
			usage: '[prefix|"default"|"none"]',
			details: oneLine`
				If no prefix is provided, the current prefix will be shown.
				If the prefix is "default", the prefix will be reset to the bot's default prefix.
				If the prefix is "none", the prefix will be removed entirely, only allowing mentions to run commands.
				Only administrators may change the prefix.
			`,
			examples: ['prefix', 'prefix -', 'prefix omg!', 'prefix default', 'prefix none']
		});
	}

	async run(msg, arg) {
		if(arg) {
			if(msg.guild) {
				if(!msg.member.hasPermission('ADMINISTRATOR')) {
					return msg.reply('Only administrators may change the command prefix.');
				}
			} else if(msg.author.id !== this.client.options.owner) {
				return msg.reply('Only the bot owner may change the global command prefix.');
			}

			// Save the prefix
			const lowercase = arg.toLowerCase();
			const prefix = lowercase === 'none' ? '' : arg;
			let response;
			if(lowercase === 'default') {
				if(msg.guild) msg.guild.commandPrefix = null; else this.client.commandPrefix = null;
				response = `Reset the command prefix to the default (currently \`${this.client.options.commandPrefix}\`).`;
			} else {
				if(msg.guild) msg.guild.commandPrefix = prefix; else this.client.commandPrefix = prefix;
				response = prefix ? `Set the command prefix to \`${arg}\`.` : 'Removed the command prefix entirely.';
			}

			// Build the pattern
			this.client.dispatcher._buildCommandPattern(msg.guild, msg.client.user);
			msg.reply(`${response} To run commands, use ${msg.commandUsage('command')}.`);
			return null;
		} else {
			const prefix = msg.guild ? msg.guild.commandPrefix : this.client.options.commandPrefix;
			return msg.reply(stripIndents`
				${prefix ? `The command prefix is \`${prefix}\`.` : 'There is no command prefix.'}
				To run commands, use ${msg.commandUsage('command')}.
			`);
		}
	}
};
