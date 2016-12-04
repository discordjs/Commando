const ArgumentType = require('./base');

class FloatArgumentType extends ArgumentType {
	constructor(client) {
		super(client, 'float');
	}

	validate(value, msg, arg) {
		const float = Number.parseFloat(value);
		return !Number.isNaN(float) &&
			(arg.min === null || typeof arg.min === 'undefined' || float >= arg.min) &&
			(arg.max === null || typeof arg.max === 'undefined' || float <= arg.max);
	}

	parse(value) {
		return Number.parseFloat(value);
	}
}

module.exports = FloatArgumentType;
