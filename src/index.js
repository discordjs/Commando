const discord = require('discord.js');

module.exports = {
	Client: require('./client'),
	Command: require('./command'),
	CommandArgument: require('./command-argument'),
	CommandGroup: require('./command-group'),
	CommandMessage: require('./command-message'),
	FriendlyError: require('./errors/friendly'),
	CommandFormatError: require('./errors/command-format'),

	util: require('./util'),
	version: require('../package').version
};

require('./extensions/guild').applyToClass(discord.Guild);

/**
 * @external ClientOptions
 * @see {@link https://discord.js.org/#/docs/main/master/typedef/ClientOptions}
 */
/**
 * @external User
 * @see {@link https://discord.js.org/#/docs/main/master/class/User}
 */
/**
 * @external Guild
 * @see {@link https://discord.js.org/#/docs/main/master/class/Guild}
 */
/**
 * @external GuildResolvable
 * @see {@link https://discord.js.org/#/docs/main/master/typedef/GuildResolvable}
 */
/**
 * @external GuildMember
 * @see {@link https://discord.js.org/#/docs/main/master/class/GuildMember}
 */
/**
 * @external Role
 * @see {@link https://discord.js.org/#/docs/main/master/class/Role}
 */
/**
 * @external Channel
 * @see {@link https://discord.js.org/#/docs/main/master/class/Channel}
 */
/**
 * @external Message
 * @see {@link https://discord.js.org/#/docs/main/master/class/Message}
 */
/**
 * @external StringResolvable
 * @see {@link https://discord.js.org/#/docs/main/master/typedef/StringResolvable}
 */
