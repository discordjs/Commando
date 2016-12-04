/** A type for command arguments */
class ArgumentType {
	/**
	 * @param {CommandoClient} client - The client the argument type is for
	 * @param {string} id - The argument type ID (this is what you specify in {@link CommandArgumentInfo#type})
	 */
	constructor(client, id) {
		if(!client) throw new Error('A client must be specified.');
		if(typeof id !== 'string') throw new Error('Argument type ID must be a string.');
		if(id !== id.toLowerCase()) throw new Error('Argument type ID must be lowercase.');

		/**
		 * Client that this argument type is for
		 * @name ArgumentType#client
		 * @type {CommandoClient}
		 * @readonly
		 */
		Object.defineProperty(this, 'client', { value: client });

		/**
		 * ID of this argument type (this is what you specify in {@link CommandArgumentInfo#type})
		 * @type {string}
		 */
		this.id = id;
	}

	// eslint-disable-next-line valid-jsdoc
	/**
	 * Validates a value against the type
	 * @param {string} value - Value to validate
	 * @param {CommandMessage} msg - Message the value was obtained from
	 * @param {CommandArgument} arg - Argument the value obtained from
	 * @return {boolean|string|Promise<boolean|string>} Whether the value is valid, or an error message
	 * @abstract
	 */
	validate(value, msg, arg) { // eslint-disable-line no-unused-vars
		throw new Error(`${this.constructor.name} doesn't have a validate() method.`);
	}

	// eslint-disable-next-line valid-jsdoc
	/**
	 * Parses the raw value into a usable value
	 * @param {string} value - Value to parse
	 * @param {CommandMessage} msg - Message the value was obtained from
	 * @param {CommandArgument} arg - Argument the value obtained from
	 * @return {*|Promise<*>} Usable value
	 * @abstract
	 */
	parse(value, msg, arg) { // eslint-disable-line no-unused-vars
		throw new Error(`${this.constructor.name} doesn't have a parse() method.`);
	}
}

module.exports = ArgumentType;
