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

	async run(message, arg) {
		if(arg && message.guild) {
			if(!message.member.hasPermission('ADMINISTRATOR')) return 'Only administrators may change the command prefix.';

			// Save the prefix
			const lowercase = arg.toLowerCase();
			const prefix = lowercase === 'none' ? '' : arg;
			let response;
			if(lowercase === 'default') {
				message.guild.commandPrefix = null;
				response = `Reset the command prefix to the default (currently \`${this.client.options.commandPrefix}\`).`;
			} else {
				message.guild.commandPrefix = prefix;
				response = prefix ? `Set the command prefix to \`${arg}\`.` : 'Removed the command prefix entirely.';
			}

			// Build the pattern
			const pattern = this.client.dispatcher._buildCommandPattern(message.guild, message.client.user);
			this.client.dispatcher._guildCommandPatterns[message.guild.id] = pattern;

			message.reply(`${response} To run commands, use ${Command.usage(this.client, 'command', message.guild)}.`)
			return null;
		} else {
			const prefix = message.guild ? message.guild.commandPrefix : this.client.options.commandPrefix;
			return message.reply(stripIndents`
				${prefix ? `The command prefix is \`${prefix}\`.` : 'There is no command prefix.'}
				To run commands, use ${Command.usage(this.client, 'command', message.guild)}.
			`);
		}
	}
};
