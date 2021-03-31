const baseTypedChannel = require('./baseTypedChannel');

function validateChannelType(channel) {
	return channel.type === 'category';
}

module.exports = baseTypedChannel('category-', validateChannelType);
