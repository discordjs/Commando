const ArgumentType = require('./base');

class IntegerArgumentType extends ArgumentType {
	constructor(client) {
		super(client, 'integer');
	}

	validate(value, msg, arg) {
		const int = Number.parseInt(value);
		if(Number.isNaN(int)) return false;
		if(arg.oneOf && !arg.oneOf.includes(int)) return false;
		if(arg.min !== null && typeof arg.min !== 'undefined' && int < arg.min) {
			return `Please enter a number above or exactly ${arg.min}.`;
		}
		if(arg.max !== null && typeof arg.max !== 'undefined' && int > arg.max) {
			return `Please enter a number below or exactly ${arg.max}.`;
		}
		return true;
	}

	parse(value) {
		return Number.parseInt(value);
	}
}

module.exports = IntegerArgumentType;
