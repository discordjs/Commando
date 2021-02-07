const ArgumentType = require('./base');

class StringArgumentType extends ArgumentType {
	constructor(client) {
		super(client, 'string');
	}

	validate(val, msg, arg) {
		if(arg.oneOf && !arg.oneOf.includes(val.toLowerCase())) {
			return msg.locale.types.enteOne({ list: arg.oneOf.map(opt => `\`${opt}\``).join(', ') });
		}
		if(arg.min !== null && typeof arg.min !== 'undefined' && val.length < arg.min) {
			return msg.locale.types.string.lengthEnterAbove({ label: arg.label, min: arg.min });
		}
		if(arg.max !== null && typeof arg.max !== 'undefined' && val.length > arg.max) {
			return msg.locale.types.string.lengthEnterBelow({ label: arg.label, max: arg.max });
		}
		return true;
	}

	parse(val) {
		return val;
	}
}

module.exports = StringArgumentType;
