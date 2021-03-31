const ArgumentType = require('./base');
const { calcConstants } = require('nw-utils-time');

class DateArgumentType extends ArgumentType {
	constructor(client) {
		super(client, 'date');
	}

	validate(val) {
		const match = /^([0-9]{1,2})\.?([0-9]{1,2})?\.?([0-9]{4})?$/.exec(val);
		if(!match) return false;
		const values = { day: +match[1], month: +match[2], year: +match[3] };
		if(values.day < 1 || values.day > calcConstants.monthDays(values.year, values.month)) return false;
		return true;
	}

	parse(val) {
		val = val.split('.');
		const now = new Date();
		return new Date(+val[2] || now.getFullYear(), (val[1] && +val[1] + 1) || now.getMonth(), +val[0] || now.getDate());
	}
}

module.exports = DateArgumentType;
