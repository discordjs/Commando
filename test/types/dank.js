const commando = require('../../src');

class DankArgumentType extends commando.ArgumentType {
	constructor(client) {
		super(client, 'dank');
	}

	validate(val) {
		return val.toLowerCase() === 'dank';
	}

	parse(val) {
		return val;
	}
}

module.exports = DankArgumentType;
