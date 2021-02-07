const ArgumentType = require('./base');

class FloatArgumentType extends ArgumentType {
	constructor(client) {
		super(client, 'float');
	}

	validate(val, msg, arg) {
		const float = Number.parseFloat(val);
		if(Number.isNaN(float)) return false;
		if(arg.oneOf && !arg.oneOf.includes(float)) {
			return msg.locale.types.enteOne({ list: arg.oneOf.map(opt => `\`${opt}\``).join(', ') });
		}
		if(arg.min !== null && typeof arg.min !== 'undefined' && float < arg.min) {
			return msg.locale.types.enterAbove({ min: arg.min });
		}
		if(arg.max !== null && typeof arg.max !== 'undefined' && float > arg.max) {
			return msg.locale.types.enterBelow({ max: arg.max });
		}
		return true;
	}

	parse(val) {
		return Number.parseFloat(val);
	}
}

module.exports = FloatArgumentType;
