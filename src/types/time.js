const ArgumentType = require('./base');
const { utils } = require('nw-utils-time');

const second = 1e3;
const minute = second * 60;
const hour = minute * 60;

class TimeArgumentType extends ArgumentType {
	constructor(client) {
		super(client, 'date');
	}

	validate(val) {
		const matches = val.match(/^((?:[01]?[0-9])|(?:2[0-3])):([0-5]?[0-9])?$/);
		if(!val.match(/^((?:[01]?[0-9])|(?:2[0-3])):([0-5]?[0-9])?$/)) return false;
		if()
	}

	parse(val) {
		const time = /^([01]?[0-9]|2[0-3]):([0-5]?[0-9])?$/.exec(val);
		return (Number(time[1]) * hour) + ((Number(time[2]) || 0) * minute);
	}
}

module.exports = TimeArgumentType;
