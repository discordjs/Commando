const baseTypedChannel = require('./baseTypedChannel');

function validateChannelType(channel) {
	return channel.type === 'voice';
}

module.exports = baseTypedChannel('voice-', validateChannelType);
