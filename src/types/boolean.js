const ArgumentType = require('./base');

class BooleanArgumentType extends ArgumentType {
	constructor(client) {
		super(client, 'boolean');
		this.truthy = new Set(['true', 't', 'yes', 'y', 'on', 'enable', 'enabled', '1', '+']
			//.concat(...Object.keys(client.locale.cache).map(locale => client.locales.get(locale).types.boolean.truthy))
			);
		this.falsy = new Set(['false', 'f', 'no', 'n', 'off', 'disable', 'disabled', '0', '-']
			//.concat(...Object.keys(client.locales.cache).map(locale => client.locales.get(locale).types.boolean.falsy))
			);
	}

	validate(val) {
		const lc = val.toLowerCase();
		return this.truthy.has(lc) || this.falsy.has(lc);
	}

	parse(val) {
		const lc = val.toLowerCase();
		if(this.truthy.has(lc)) return true;
		if(this.falsy.has(lc)) return false;
		throw new RangeError('Unknown boolean value.');
	}
}

module.exports = BooleanArgumentType;
