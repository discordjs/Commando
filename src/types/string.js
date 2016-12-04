const ArgumentType = require('./base');

class StringArgumentType extends ArgumentType {
	constructor(client) {
		super(client, 'string');
	}

	validate(value, msg, arg) {
		return Boolean(value) &&
			(arg.min === null || typeof arg.min === 'undefined' || value.length >= arg.min) &&
			(arg.max === null || typeof arg.max === 'undefined' || value.length <= arg.max);
	}

	parse(value) {
		return value;
	}
}

module.exports = StringArgumentType;
