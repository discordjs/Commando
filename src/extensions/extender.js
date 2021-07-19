const CommandoMessage = require('./message')
const CommandoGuild = require('./guild')

module.exports = Discord => {
    
	CommandoMessage(Discord)
    CommandoGuild(Discord)

	return Discord;
};