const ArgumentType = require('./base');

class MessageArgumentType extends ArgumentType {
	constructor(client) {
		super(client, 'message');
	}

	async validate(val, msg) {
		if(!/^[0-9]+$/.test(val)) return false;
		return Boolean(await msg.channel.messages.fetch(val).catch(() => null));
	}

	parse(val, msg) {
		return msg.channel.messages.get(val);
	}
}

module.exports = MessageArgumentType;
