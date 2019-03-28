const ArgumentType = require('./base');

class DurationArgumentType extends ArgumentType {
	// This.duration::Milliseconds
	constructor(client) {
		super(client, 'duration');
		this.timeIds = new Set(['mo', 'w', 'd', 'h', 'm', 's', 'ms']);
		this.duration = 0;
	}

	// Confirms match before continuing.
	// Checks if matched number is an int.
	// Checks if matched string is in expected set.
	validate(value) {
		const MATCHES_ALL = value.match(/(\d+)\s*([A-Za-z]+)/g);

		for(var i = 0; i < MATCHES_ALL.length; i++) {
			var tempNum = MATCHES_ALL[i].match(/(\d+)/g);
			var tempStr = MATCHES_ALL[i].match(/([A-Za-z]+)/g);
			if(!tempNum || (tempNum.length !== 1)) return false;
			if(!tempStr || (tempStr.length !== 1)) return false;
			if(!Number.isInteger(parseInt(tempNum[0])))	return false;
			if(!this.timeIds.has(tempStr[0])) return false;
		}
		return true;
	}

	// Separate each time group (Xmo, Yw, Zd, ext.)
	// Combine to a single time value (in milliseconds)
	// Return time value unless null
	parse(value) {
		const MATCHES_ALL = value.match(/(\d+)\s*([A-Za-z]+)/g);
		var totalTime = 0;
		MATCHES_ALL.forEach(dur => {
			var tempNum = parseInt(dur.match(/(\d+)/g)[0]);
			var tempStr = dur.match(/([A-Za-z]+)/g)[0];
			if(tempNum === 'NaN') totalTime = null;
			else totalTime += tempNum * determineTimeType(tempStr);
		});
		if(totalTime !== null) {
			this.duration = totalTime;
			return this.duration;
		} else {
			return null;
		}
	}

	// Conversion methods. Each returns a float.
	toMonths() {
		return Number.parseFloat(this.duration / (30 * 24 * 60 * 60 * 1000));
	}
	toWeeks() {
		return Number.parseFloat(this.duration / (7 * 24 * 60 * 60 * 1000));
	}
	toDays() {
		return Number.parseFloat(this.duration / (24 * 60 * 60 * 1000));
	}
	toHours() {
		return Number.parseFloat(this.duration / (60 * 60 * 1000));
	}
	toMinutes() {
		return Number.parseFloat(this.duration / (60 * 1000));
	}
	toSeconds() {
		return Number.parseFloat(this.duration / 1000);
	}
	toMilliseconds() {
		return Number.parseFloat(this.duration);
	}

	// Method aliases
	toMo() { return this.toMonths(); }
	toW() { return this.toWeeks(); }
	toD() { return this.toDays(); }
	toH() { return this.toHours(); }
	toM() { return this.toMinutes(); }
	tos() { return this.toSeconds(); }
	toMs() { return this.toMilliseconds(); }
}

function determineTimeType(str) {
	switch(str) {
		case 'mo':
			return 30 * 24 * 60 * 60 * 1000;
		case 'w':
			return 7 * 24 * 60 * 60 * 1000;
		case 'd':
			return 24 * 60 * 60 * 1000;
		case 'h':
			return 60 * 60 * 1000;
		case 'm':
			return 60 * 1000;
		case 's':
			return 1000;
		case 'ms':
			return 1;
		default:
			return null;
	}
}

module.exports = DurationArgumentType;
