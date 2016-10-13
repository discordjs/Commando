const discord = require('discord.js');

module.exports = {
	Client: require('./client'),
	Command: require('./command'),
	CommandGroup: require('./command-group'),
	FriendlyError: require('./errors/friendly'),
	CommandFormatError: require('./errors/command-format'),

	util: require('./util'),
	version: require('../package').version
};

require('./extensions/guild').applyToClass(discord.Guild);

/**
 * @external ClientOptions
 * @see {@link http://hydrabolt.github.io/discord.js/#!/docs/tag/master/typedef/ClientOptions}
 */
/**
 * @external User
 * @see {@link http://hydrabolt.github.io/discord.js/#!/docs/tag/master/class/User}
 */
/**
 * @external Guild
 * @see {@link http://hydrabolt.github.io/discord.js/#!/docs/tag/master/class/Guild}
 */
/**
 * @external GuildResolvable
 * @see {@link http://hydrabolt.github.io/discord.js/#!/docs/tag/master/typedef/GuildResolvable}
 */
/**
 * @external GuildMember
 * @see {@link http://hydrabolt.github.io/discord.js/#!/docs/tag/master/class/GuildMember}
 */
/**
 * @external Channel
 * @see {@link http://hydrabolt.github.io/discord.js/#!/docs/tag/master/class/Channel}
 */
/**
 * @external Message
 * @see {@link http://hydrabolt.github.io/discord.js/#!/docs/tag/master/class/Message}
 */
/**
 * @external StringResolvable
 * @see {@link http://hydrabolt.github.io/discord.js/#!/docs/tag/master/typedef/StringResolvable}
 */
