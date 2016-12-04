const ArgumentType = require('./base');

class BooleanArgumentType extends ArgumentType {
	constructor(client) {
		super(client, 'boolean');
		this.truthy = new Set(['true', 't', 'yes', 'y', 'on']);
		this.falsy = new Set(['false', 'f', 'no', 'n', 'off']);
	}

	validate(value) {
		const lc = value.toLowerCase();
		return this.truthy.has(lc) || this.falsy.has(lc);
	}

	parse(value) {
		const lc = value.toLowerCase();
		if(this.truthy.has(lc)) return true;
		if(this.falsy.has(lc)) return false;
		throw new RangeError('Unknown boolean value.');
	}
}

module.exports = BooleanArgumentType;
