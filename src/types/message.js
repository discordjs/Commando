const ArgumentType = require('./base');

class MessageArgumentType extends ArgumentType {
	constructor(client) {
		super(client, 'message');
	}

	async validate(value, msg) {
		if(!/^[0-9]+$/.test(value)) return false;
		const message = await msg.channel.fetchMessage(value).catch(() => null);
		if(!message) return false;
		return Boolean(message);
	}

	parse(value, msg) {
		return msg.channel.messages.get(value);
	}
}

module.exports = MessageArgumentType;
