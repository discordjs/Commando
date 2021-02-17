const i18next = require('i18next');
const FileNotFoundError = require('../errors/file-not-found');

/**
 * Represents a language, commando can translate to.
 * */
class CommandoLanguage {
	constructor(client, languageCode) {
		this.client = client;

		/**
		 * Language code/identifier.
		 * @type {?string}
		 * @private
		 * */
		this._code = languageCode;

		/**
		 * Whether the language has been loaded or unloaded.
		 * @type {?boolean}
		 * @private
		 * */
		this._loaded = false;


		/**
		 * Method to translate this specific language.
		 * @type {function}
		 * @example new CommandoLanguage(client, 'fr').translate('myKey')
		 */
		this._translate = i18next.getFixedT(languageCode).bind(this);
	}

	/**
	 * Language code/identifier.
	 * @type {string}
	 * @readonly
	 */
	get code() {
		return this._code;
	}

	/**
	 * Whether the language has been loaded or unloaded.
	 * @type {boolean}
	 */
	get loaded() {
		return this._loaded;
	}

	set loaded(loaded) {
		this._loaded = loaded;
	}

	/**
	 * Function to load files for this language and register the language in i18next.
	 * @return {Promise<void>}
	 */
	async load() {
		// Load the language file.
		await i18next.loadLanguages(this.code, err => {
			if(err) throw new Error(err);
		});

		if(!i18next.hasResourceBundle(this.code, this.client.translator.defaultNamespace)) {
			throw new FileNotFoundError('Cannot load the language, because the language file does not exist!');
		}

		// Set this language as loaded.
		this.loaded = true;
	}

	/**
	 * Function to reload files for this language.
	 * @return {Promise<void>}
	 */
	async reload() {
		// Just reload the language files.
		await i18next.reloadResources(this.code, 'commando', err => {
			if(err) throw new Error(err);
		});

		if(!i18next.hasResourceBundle(this.code, this.client.translator.defaultNamespace)) {
			throw new FileNotFoundError('Cannot load the language, because the language file does not exist!');
		}

		// Set this language as loaded.
		this.loaded = true;
	}

	/**
	 * Function to remove the language from memory and unregister the language in i18next.
	 * @return {Promise<void>}
	 */
	async unload() {
		// Check if the language is currently set as default.
		const isDefault = i18next.language === this.code;

		// Unregister the language (remove it from i18next.languages).
		if(Array.isArray(i18next.languages) && i18next.languages.length > 0) {
			if(isDefault) {
				await i18next.changeLanguage(i18next.languages[0]);
			}
		} else if(isDefault) {
			await i18next.changeLanguage('dev');
		}

		// Unload/delete the resources
		i18next.services.resourceStore.data[this.code] = {};

		// Set this language as unloaded.
		this.loaded = false;
	}

	/**
	 * Function which returns the value for a given a key in this language.
	 * @param {string} key - The key of the value to be translated.
	 * @return {string}
	 */
	translate(key) {
		const fixedTranslateFunction = i18next.getFixedT(this.code);
		return fixedTranslateFunction(key);
	}
}

module.exports = CommandoLanguage;
