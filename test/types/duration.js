const commando = require('../../src');

class DurationArgumentType extends commando.ArgumentType {
	constructor(client) {
		super(client, 'duration');
	}

	validate(val, msg, arg) {
		if(val.includes('.')) return false;
        // No decimals allowed!!!

		const millis = timeStrToMillis(val);
		if(millis > Number.MAX_SAFE_INTEGER || millis < 5000) {
			arg.error = 'Time must be greater than or equal to 5 seconds.';
			return false;
		}

		return val.split(' ').reduce((acc, timePart) => acc && !!timePart.match(/\d+(?=w|d|h|m|s)/i), true);
	}

	parse(val) {
		return timeStrToMillis(val);
	}
}

function timeStrToMillis(str) {
	const weeks = +str.match(/\d+(?=w)/i);
	const days = +str.match(/\d+(?=d)/i);
	const hours = +str.match(/\d+(?=h)/i);
	const minutes = +str.match(/\d+(?=m)/i);
	const seconds = +str.match(/\d+(?=s)/i);

	const millis = (weeks * 7 * 24 * 60 * 60 * 1000) +
    (days * 24 * 60 * 60 * 1000) +
    (hours * 60 * 60 * 1000) +
    (minutes * 60 * 1000) +
    (seconds * 1000);

	return millis;
}

module.exports = DurationArgumentType;
