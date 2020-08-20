const i18next = require('i18next');
const Backend = require('i18next-fs-backend');
const { oneLine } = require('common-tags');
const { defaultCommandoTranslations } = require('./i18n/dev');

/**
 * Provides methods for translation
 * However, i18next package can be used to access all it's features
 * */
class CommandoTranslator {
	/**
	 * @typedef {Object} CommandoTranslatorOptions
	 * @property {?boolean} loadTranslations - Weather the translator should load translation files or only the builtins.
	 * @property {?boolean} debug - Sets the i18next debug flag. Use it to resolve issues when loading i18n files.
	 * @property {?string} localesPath - path where the i18n files are located.
	 * @see {@link https://www.i18next.com/how-to/add-or-load-translations#add-or-load-translations}
	 * @property {?TranslateOptions} overrides - Overrides the i18next options.
	 * @see {@link https://www.i18next.com/overview/configuration-options}
	 */

	/**
	 * @param {CommandoClient} [client] - Client the translator is for
	 * @param {?CommandoTranslatorOptions} [options] - Options for the translator
	 */
	constructor(client, options = {}) {
		// Set additional namespaces
		if(Array.isArray(options.ns)) {
			this.ns = options.ns;
		} else if(typeof ns === 'string') {
			this.ns = [options.ns];
		} else {
			this.ns = [];
		}

		this.client = client;

		this.loadTranslations = options.loadTranslations;
		this.loadPath = options.localesPath;
		this.debug = options.debug === true;
		this.overrides = options.overrides || {};

		this.options = {
			lng: client.defaultLanguage,
			ns: ['commando', ...this.ns],
			fallbackLng: ['dev'],
			defaultNS: 'commando',
			debug: this.debug,
			...this.overrides
		};

		// Only loads the builtin commando translations
		this.init();
	}

	static get DEFAULT_LANGUAGE() {
		return 'dev';
	}

	/**
	 * Initializes the i18next library
	 * @return {Promise<void>}
	 */
	async init() {
		const timeLabel = `[${CommandoTranslator.name}] Initialized in`;
		console.time(timeLabel);
		if(this.loadTranslations) {
			if(typeof this.loadPath === 'undefined') {
				throw new Error(
					oneLine`
						A value for loadPath must be provided to load localization files.
						Set loadTranslations to false if you don't want to load translation files.
				`);
			}

			//  Loads translations
			i18next.use(Backend);
			await i18next.init(
				{
					...this.options,
					resources: defaultCommandoTranslations,
					backend: {
						loadPath: this.loadPath
					}
				},
				err => {
					if(err) {
						return console.log('Something went wrong loading the localization files.', err);
					} else {
						return null;
					}
				}
			);

			/*
			* This loads all resource files in the passed loadPath.
			* We need to do that, because we initialize i18next with commando translations only.
			* This will also override the builtin commando translations, when the file for namespace "commando" does exist!
			* */
			await i18next.reloadResources(this.options.fallbackLng);
		} else {
			await i18next.init(
				{
					...this.options,
					resources: defaultCommandoTranslations
				},
				err => {
					if(err) {
						return console.log('Something went wrong initializing i18next.', err);
					} else {
						return null;
					}
				}
			);
		}

		const loadedLanguages = i18next.languages || [];
		console.timeEnd(timeLabel);
		console.log(oneLine`[${CommandoTranslator.name}] 
		The following languages have been loaded: ${loadedLanguages.join(', ')}. 
		Default language is: ${this.client.defaultLanguage}.`);
	}

	/**
	 * Resolves the language to translate to
	 * @param {?CommandoMessage} msg - Command message that triggered the command
	 * @return {string}
	 */
	resolveLanguage(msg) {
		if(typeof msg === 'undefined') {
			return this.client.defaultLanguage;
		} else if(msg.channel.type === 'dm') {
			return msg.author.user ? msg.author.user.locale || this.client.defaultLanguage : this.client.defaultLanguage;
		} else {
			return msg.guild ? msg.guild.language : this.client.defaultLanguage;
		}
	}


	/**
	 * Loads additional namespaces
	 * @see {@link https://www.i18next.com/principles/namespaces}
	 * @param {string|string[]} ns - One or multiple namespaces to load
	 * @param {?TCallback} callback - Optional callback function
	 */
	async loadNamespaces(ns, callback) {
		await i18next.loadNamespaces(ns, callback);
		return null;
	}
}

/**
 * Represents a string which can be translated
 * */
class CommandoTranslatable {
	/**
	 * @typedef {Object} CommandoTranslatable - Represents a string which can be translated
	 * @property {string} key - The key which will be resolved.
	 */

	constructor(key) {
		this._key = key;
	}


	/**
	 * Getter
	 * @name CommandoTranslatable#_key
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

module.exports = {
	CommandoTranslator,
	CommandoTranslatable
};
