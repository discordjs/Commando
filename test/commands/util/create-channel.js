const commando = require('../../../src');

module.exports = class CreateChannelCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'create-channel',
			aliases: ['create-chan', 'add-channel', 'add-chan'],
			group: 'util',
			memberName: 'create-channel',
			description: 'Creates a channel.',
			examples: ['create-channel Test channel'],
			guildOnly: true,
			clientPermissions: ['MANAGE_CHANNELS'],
			userPermissions: ['MANAGE_CHANNELS'],

			args: [
				{
					key: 'name',
					label: 'channel name',
					prompt: 'What would you like the channel to be called?',
					type: 'string'
				}
			]
		});
	}

	async run(msg, { name }) {
		const channel = await msg.guild.channels.create(name);
		return msg.reply(`Created ${channel} (${channel.id})`);
	}
};
