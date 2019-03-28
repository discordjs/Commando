const ArgumentType = require('./base');
// const { disambiguation } = require('../util');
// const { escapeMarkdown } = require('discord.js');

class DurationArgumentType extends ArgumentType {
	constructor(client) {
		super(client, 'duration');
		this.timeIds = new Set(['mo', 'w', 'd', 'h', 'm', 's', 'ms']);
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
		const matches = value.match(/(\d+)\s*([A-Za-z]+)/g);
		console.log("matches2 " + matches);

	}
}

module.exports = DurationArgumentType;
