const ArgumentType = require('./base');
// const { disambiguation } = require('../util');
// const { escapeMarkdown } = require('discord.js');

class DurationArgumentType extends ArgumentType {
	constructor(client) {
		super(client, 'duration');
		this.timeIds = new Set(['mo', 'w', 'd', 'h', 'm', 's', 'ms']);
		this.duration = 0;
	}

	validate(value) {
		var ifInvalid = false;
		const MATCHES_ALL = value.match(/(\d+)\s*([A-Za-z]+)/g);
		MATCHES_ALL.forEach(dur => {
			var tempNum = dur.match(/(\d+)/g);
			var tempStr = dur.match(/([A-Za-z]+)/g);
			//confirms match before continuing.
			if(!tempNum || (tempNum.length != 1)) ifInvalid = true; break;
			if(!tempStr || (tempStr.length != 1)) ifInvalid = true; break;
			//checks if matched number is an int.
			if(!Number.isInteger(parseInt(tempNum[0]))) ifInvalid = true; break;
			//checks if matched string is in expected set.
			if(!this.timeIds.has(tempStr[0])) ifInvalid = true; break;
		});
		if(!ifInvalid) return false; //TODO change to useful error message
	}

	parse(value) {
		const MATCHES_ALL = value.match(/(\d+)\s*([A-Za-z]+)/g);
		var totalTime = 0;
		// Separate each time group (Xmo, Yw, Zd, ext.)
		MATCHES_ALL.forEach(dur => {
			var tempNum = parseInt(dur.match(/(\d+)/g));
			var tempStr = dur.match(/([A-Za-z]+)/g);
			// Combine to a single time value (in milliseconds)
			if(tempNum === 'NaN') totalTime = null; //or mb ignore?
			else totalTime += (tempNum * determineTimeType(tempStr));
		});
		// Return time value unless null
		if(totalTime != null) {
			this.duration = totalTime;
			return this.duration;
		} else {
			return null;
		}
	}
	
	// conversion methods
	toMonths() {
		
	}
	toWeeks() {
		
	}
	toDays() {
		
	}
	toMinutes() {
		
	}
	toSeconds() {
		
	}
	toMilliseconds() {
		
	}

	//method aliases
	toMo() { return this.toMonths(); }
	toW() { return this.toMonths(); }
	toD() { return this.toMonths(); }
	toD() { return this.toMonths(); }
	toMo() { return this.toMonths(); }
	toMo() { return this.toMonths(); }

}

function determineTimeType(str) {
	// match multipier
	switch(str) {
		case 'mo': return (30 * 24 * 60 * 60 * 1000)
		case 'w': return (7  * 24 * 60 * 60 * 1000)
		case 'd': return (24 * 60 * 60 * 1000)	
		case 'h': return (60 * 60 * 1000)
		case 'm': return (60 * 1000)
		case 's': return (1000)
		case 'ms': return (1)
		default: return null;
	}
}

module.exports = DurationArgumentType;
