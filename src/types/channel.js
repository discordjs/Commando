const baseTypedChannel = require('./baseTypedChannel');

function validateChannelType() {
	return true;
}

module.exports = baseTypedChannel('', validateChannelType);
