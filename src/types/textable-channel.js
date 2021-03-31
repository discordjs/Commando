const baseTypedChannel = require('./baseTypedChannel');

function validateChannelType(channel) {
	return channel.isText();
}

module.exports = baseTypedChannel('textable-', validateChannelType);
