const discord = require('discord.js');

module.exports = {
	Client: require('./client'),
	Command: require('./command'),
	CommandGroup: require('./command-group'),

	version: require('../package').version
};

require('./extensions/guild').applyToClass(discord.Guild);
