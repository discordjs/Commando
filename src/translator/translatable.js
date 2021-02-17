const i18next = require('i18next');

/**
 * Represents a string which can be translated
 * */
class CommandoTranslatable {
	/**
	 * @typedef {Object} CommandoTranslatable - Represents a string which can be translated
	 * @property {string} key - The key which will be resolved.
	 */

	constructor(key) {
		/**
		 * The key which will be resolved.
		 * @type {string}
		 * @private
		 */
		this._key = key;
	}

	/**
	 * Getter
	 * @type {string}
	 * @readonly
	 */
	get key() {
		return this._key;
	}

	/**
	 * Translates this Translatable. This method calls i18next.t() with the key passed through the constructor.
	 * @see {@link https://www.i18next.com/translation-function/essentials}
	 * @param {TranslateOptions} options - I18next options object
	 * @return {string} - The translated string
	 */
	translate(options) {
		const isUndefined = typeof this._key === 'undefined';
		const isEmptyString = typeof this._key === 'string' && this._key.length === 0;

		if(isUndefined || isEmptyString) return '';

		return i18next.t(this._key, options);
	}
}

module.exports = CommandoTranslatable;
