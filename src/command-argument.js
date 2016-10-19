const stripIndents = require('common-tags').stripIndents;

/** A fancy argument for a command */
class CommandArgument {
	/**
	 * @typedef {Object} CommandArgumentInfo
	 * @property {string} key - Key for the argument
	 * @property {string} [label=key] - Label for the argument
	 * @property {string} prompt - First prompt for the argument when it wasn't specified
	 * @property {string} [type] - Type of the argument ('string', 'integer', 'float', or 'boolean')
	 * @property {ArgumentValidator} [validate] - Validator function for the argument
	 * @property {ArgumentParser} [parse] - Parser function for the argument
	 */

	/**
	 * @param {Command} command - Command the argument is for
	 * @param {CommandArgumentInfo} info - Information for the command argument
	 */
	constructor(command, info) {
		if(!command) throw new Error('The command must be specified.');
		if(!info) throw new Error('The command argument info must be specified.');
		if(typeof info.key !== 'string') throw new TypeError('Command argument key must be a string.');
		if(info.label && typeof info.label !== 'string') throw new TypeError('Command argument label must be a string.');
		if(typeof info.prompt !== 'string') throw new TypeError('Command argument prompt must be a string.');
		if(!info.type && !info.validate) {
			throw new Error('Command argument must have either "type" or "validate" specified.');
		}
		if(info.type && !['string', 'integer', 'float', 'boolean'].includes(info.type)) {
			throw new RangeError('Command argument type must be one of "string", "integer", "float", or "boolean".');
		}
		if(info.validate && typeof info.validate !== 'function') {
			throw new TypeError('Command argument validate must be a function.');
		}
		if(info.parse && typeof info.parse !== 'function') {
			throw new TypeError('Command argument parse must be a function.');
		}
		if(!info.type && (!info.validate || !info.parse)) {
			throw new Error('Command argument must have both validate and parse since it doesn\'t have a type.');
		}

		/**
		 * Command the argument is for
		 * @type {Command}
		 */
		this.command = command;

		/**
		 * Key for the argument
		 * @type {string}
		 */
		this.key = info.key;

		/**
		 * Label for the argument
		 * @type {string}
		 */
		this.label = info.label || info.key;

		/**
		 * Question prompt for the argument
		 * @type {string}
		 */
		this.prompt = info.prompt;

		/**
		 * Type of the argument ('string', 'integer', 'float', or 'boolean')
		 * @type {?string}
		 */
		this.type = info.type || null;

		/**
		 * Validator function for validating a value for the argument
		 * @type {ArgumentValidator}
		 */
		this.validator = info.validate || null;

		/**
		 * Parser function for parsing a value for the argument
		 * @type {ArgumentParser}
		 */
		this.parser = info.parse || null;
	}

	/**
	 * Obtains the value for the argument
	 * @param {Message} msg - Message that triggered the command
	 * @param {string} [value] - Pre-provided value for the argument
	 * @return {Promise<?*>}
	 */
	async obtain(msg, value) {
		let valid = this.validate(value);
		while(!valid || typeof valid === 'string') {
			await msg.reply(stripIndents`
				${!value ? this.prompt : valid ? valid : `You specified an invalid ${this.label}. Please try again.`}
				Respond with \`cancel\` to cancel the command.
			`);
			const responses = await msg.channel.awaitMessages(msg2 => msg2.author.id === msg.author.id, {
				maxMatches: 1,
				time: 30000
			});
			if(responses && responses.size === 1) value = responses.first().content; else return null;
			if(value.toLowerCase() === 'cancel') return null;
			valid = this.validate(value);
		}
		return this.parse(value);
	}

	/**
	 * Checks if a value is valid for the argument
	 * @param {string} value - Value to check
	 * @return {boolean|string}
	 */
	validate(value) {
		if(this.validator) return this.validator(value);
		switch(this.type) {
			case 'string':
				return Boolean(value);
			case 'integer':
				return !Number.isNaN(Number.parseInt(value));
			case 'float':
				return !Number.isNaN(Number.parseFloat(value));
			case 'boolean':
				return ['true', 'false', 'yes', 'no', 'on', 'off'].includes(value.toLowerCase());
			default:
				throw new RangeError('Unknown command argument type.');
		}
	}

	/**
	 * Parses a value string into a proper value for the argument
	 * @param {string} value - Value to parse
	 * @return {*}
	 */
	parse(value) {
		if(this.parser) return this.parser(value);
		switch(this.type) {
			case 'string':
				return String(value);
			case 'integer':
				return Number.parseInt(value);
			case 'float':
				return Number.parseFloat(value);
			case 'boolean':
				if(['true', 'yes', 'on'].includes(value.toLowerCase())) return true;
				if(['false', 'no', 'off'].includes(value.toLowerCase())) return false;
				throw new RangeError('Unknown boolean value.');
			default:
				throw new RangeError('Unknown command argument type.');
		}
	}
}

module.exports = CommandArgument;
