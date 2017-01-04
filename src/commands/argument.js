const escapeMarkdown = require('discord.js').escapeMarkdown;
const { oneLine, stripIndents } = require('common-tags');

/** A fancy argument for a command */
class CommandArgument {
	/**
	 * @typedef {Object} CommandArgumentInfo
	 * @property {string} key - Key for the argument
	 * @property {string} [label=key] - Label for the argument
	 * @property {string} prompt - First prompt for the argument when it wasn't specified
	 * @property {string} [type] - Type of the argument (must be the ID of one of the registered argument types -
	 * see {@link CommandRegistry#registerDefaultTypes} for the built-in types)
	 * @property {number} [max] - If type is 'integer' or 'float', this is the maximum value of the number.
	 * If type is 'string', this is the maximum length of the string.
	 * @property {number} [min] - If type is 'integer' or 'float', this is the minimum value of the number.
	 * If type is 'string', this is the minimum length of the string.
	 * @property {*} [default] - Default value for the argument (makes the argument optional - cannot be `null`)
	 * @property {boolean} [infinite=false] - Whether the argument accepts infinite values
	 * @property {Function} [validate] - Validator function for the argument (see {@link ArgumentType#validate})
	 * @property {Function} [parse] - Parser function for the argument (see {@link ArgumentType#parse})
	 * @property {number} [wait=30] - How long to wait for input (in seconds)
	 */

	/**
	 * @param {Command} command - Command the argument is for
	 * @param {CommandArgumentInfo} info - Information for the command argument
	 */
	constructor(command, info) { // eslint-disable-line complexity
		if(!command) throw new Error('The command must be specified.');
		if(!info) throw new Error('The command argument info must be specified.');
		if(typeof info.key !== 'string') throw new TypeError('Command argument key must be a string.');
		if(info.label && typeof info.label !== 'string') throw new TypeError('Command argument label must be a string.');
		if(typeof info.prompt !== 'string') throw new TypeError('Command argument prompt must be a string.');
		if(!info.type && !info.validate) {
			throw new Error('Command argument must have either "type" or "validate" specified.');
		}
		if(info.type && !command.client.registry.types.has(info.type)) {
			throw new RangeError(`Command argument type "${info.type}" isn't registered.`);
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
		if(typeof info.wait !== 'undefined' && (typeof info.wait !== 'number' || Number.isNaN(info.wait))) {
			throw new TypeError('Command argument wait must be a number.');
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
		 * Type of the argument
		 * @type {?ArgumentType}
		 */
		this.type = info.type ? command.client.registry.types.get(info.type) : null;

		/**
		 * If type is 'integer' or 'float', this is the maximum value of the number.
		 * If type is 'string', this is the maximum length of the string.
		 * @type {?number}
		 */
		this.max = info.max || null;

		/**
		 * If type is 'integer' or 'float', this is the minimum value of the number.
		 * If type is 'string', this is the minimum length of the string.
		 * @type {?number}
		 */
		this.min = info.min || null;

		/**
		 * The default value for the argument
		 * @type {?*}
		 */
		this.default = typeof info.default !== 'undefined' ? info.default : null;

		/**
		 * Whether the argument accepts an infinite number of values
		 * @type {boolean}
		 */
		this.infinite = Boolean(info.infinite);

		/**
		 * Validator function for validating a value for the argument
		 * @type {?Function}
		 * @see {@link ArgumentType#validate}
		 */
		this.validator = info.validate || null;

		/**
		 * Parser function for parsing a value for the argument
		 * @type {?Function}
		 * @see {@link ArgumentType#parse}
		 */
		this.parser = info.parse || null;

		/**
		 * How long to wait for input (in seconds)
		 * @type {number}
		 */
		this.wait = typeof info.wait !== 'undefined' ? info.wait : 30;
	}

	/**
	 * Prompts the user and obtains the value for the argument
	 * @param {CommandMessage} msg - Message that triggered the command
	 * @param {string} [value] - Pre-provided value for the argument
	 * @return {Promise<?*|symbol>}
	 */
	async obtain(msg, value) {
		if(!value && this.default !== null) return this.default;
		if(this.infinite) return this.obtainInfinite(msg, value);

		const wait = this.wait > 0 && this.wait !== Infinity ? this.wait * 1000 : undefined;
		let valid = value ? await this.validate(value, msg) : false;
		let attempts = 0;

		while(!valid || typeof valid === 'string') {
			attempts++;
			if(attempts > this.command.argsPromptLimit) return msg.constructor.SILENT_CANCEL;
			msg.promptCount++;

			await msg.reply(stripIndents`
				${!value ? this.prompt : valid ? valid : `You provided an invalid ${this.label}. Please try again.`}
				${oneLine`
					Respond with \`cancel\` to cancel the command.
					${wait ? `The command will automatically be cancelled in ${this.wait} seconds.` : ''}
				`}
			`);

			const responses = await msg.channel.awaitMessages(msg2 => msg2.author.id === msg.author.id, {
				maxMatches: 1,
				time: wait
			});
			if(responses && responses.size === 1) value = responses.first().content; else return null;
			if(value.toLowerCase() === 'cancel') return null;
			valid = await this.validate(value, msg);
		}

		return this.parse(value, msg);
	}

	/**
	 * Prompts the user and obtains multiple values for the argument
	 * @param {CommandMessage} msg - Message that triggered the command
	 * @param {string[]} [values] - Pre-provided values for the argument
	 * @return {Promise<?Array<*>|symbol>}
	 * @private
	 */
	async obtainInfinite(msg, values) { // eslint-disable-line complexity
		const wait = this.wait > 0 && this.wait !== Infinity ? this.wait * 1000 : undefined;
		const results = [];
		let currentVal = 0;

		while(true) { // eslint-disable-line no-constant-condition
			let value = values && values[currentVal] ? values[currentVal] : null;
			let valid = value ? await this.validate(value) : false;
			let attempts = 0;

			while(!valid || typeof valid === 'string') {
				attempts++;
				if(attempts > this.command.argsPromptLimit) return attempts === 1 ? msg.constructor.SILENT_CANCEL : null;
				msg.promptCount++;

				if(value) {
					const escaped = escapeMarkdown(value).replace(/@/g, '@\u200b');
					await msg.reply(stripIndents`
						${valid ? valid : oneLine`
							You provided an invalid ${this.label},
							"${escaped.length < 1850 ? escaped : '[too long]'}".
							Please try again.
						`}
						${oneLine`
							Respond with \`cancel\` to cancel the command, or \`finish\` to finish entry up to this point.
							${wait ? `The command will automatically be cancelled in ${this.wait} seconds.` : ''}
						`}
					`);
				} else if(results.length === 0) {
					await msg.reply(stripIndents`
						${this.prompt}
						${oneLine`
							Respond with \`cancel\` to cancel the command, or \`finish\` to finish entry.
							${wait ? `The command will automatically be cancelled in ${this.wait} seconds, unless you respond.` : ''}
						`}
					`);
				}

				const responses = await msg.channel.awaitMessages(msg2 => msg2.author.id === msg.author.id, {
					maxMatches: 1,
					time: wait
				});
				if(responses && responses.size === 1) value = responses.first().content; else return null;
				const lc = value.toLowerCase();
				if(lc === 'cancel') return null;
				if(lc === 'finish') return results.length > 0 ? results : null;
				valid = await this.validate(value, msg);
			}

			results.push(await this.parse(value, msg));

			if(values) {
				currentVal++;
				if(currentVal === values.length) return results;
			}
		}
	}

	/**
	 * Checks if a value is valid for the argument
	 * @param {string} value - Value to check
	 * @param {CommandMessage} msg - Message that triggered the command
	 * @return {boolean|string|Promise<boolean|string>}
	 */
	validate(value, msg) {
		if(this.validator) return this.validator(value, msg, this);
		return this.type.validate(value, msg, this);
	}

	/**
	 * Parses a value string into a proper value for the argument
	 * @param {string} value - Value to parse
	 * @param {CommandMessage} msg - Message that triggered the command
	 * @return {*|Promise<*>}
	 */
	parse(value, msg) {
		if(this.parser) return this.parser(value, msg, this);
		return this.type.parse(value, msg, this);
	}
}

module.exports = CommandArgument;
