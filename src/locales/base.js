/** A Locale for languages */
class Locale {
	/**
	 * @param {CommandoClient} client - The client the locale is for
	 * @param {string} id - The locale ID
	 */
	constructor(client, id) {
		if(!client) throw new Error('A client must be specified.');
		if(typeof id !== 'string') throw new Error('Locale ID must be a string.');
		if(id !== id.toLowerCase()) throw new Error('Locale ID must be lowercase.');

		/**
		 * Client that this locale type is for
		 * @name Locale#client
		 * @type {CommandoClient}
		 * @readonly
		 */
		Object.defineProperty(this, 'client', { value: client });

		/**
		 * ID of this locale
		 * @type {string}
		 */
		this.id = id;
	}

	get(val, ...args) {
		return args.length ? this.language[val](...args) : this.language[val];
	}
}

module.exports = Locale;
