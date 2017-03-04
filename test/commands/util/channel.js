const commando = require('../../../src');

module.exports = class ChannelCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'channel',
			aliases: ['chan'],
			group: 'util',
			memberName: 'channel',
			description: 'Gets information about a user.',
			examples: ['channel #test', 'channel test'],
			guildOnly: true,

			args: [
				{
					key: 'channel',
					label: 'textchannel',
					prompt: 'What channel would you like to snoop on?',
					type: 'channel'
				}
			]
		});
	}

	async run(msg, args) {
		const channel = args.channel;
		return msg.reply(channel);
	}
};
