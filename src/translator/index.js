const i18next = require('i18next');
const Backend = require('i18next-fs-backend');
const { oneLine } = require('common-tags');
const { defaultCommandoTranslations } = require('../i18n/dev');
const CommandoLanguage = require('./language');

/**
 * Provides methods for translation
 * However, i18next package can be used to access all it's features
 * */
class CommandoTranslator {
	/**
	 * @typedef {Object} CommandoTranslatorOptions
	 * @property {?boolean} loadTranslations - Weather the translator should load translation files or only the builtins.
	 * @property {?boolean} debug - Sets the i18next debug flag. Use it to resolve issues when loading i18n files.
	 * @property {?string} localesPath - Path pattern where the language files are located.
	 * @see {@link https://www.i18next.com/how-to/add-or-load-translations#add-or-load-translations}
	 * @property {?string[]} supportedLanguages - Array of language codes, your bot will support.
	 * @property {?string} defaultNamespace - The namespace used for builtin strings.
	 * @property {?string[]} namespaces - The namespaces to load.
	 * @see {@link https://www.i18next.com/principles/namespaces} to learn more about namespaces in i18next!
	 * @property {?TranslateOptions} overrides - Overrides the i18next options.
	 * @see {@link https://www.i18next.com/overview/configuration-options}
	 */

	/**
	 * @param {CommandoClient} [client] - Client the translator is for
	 * @param {?CommandoTranslatorOptions} [options] - Options for the translator
	 */
	constructor(client, options = {}) {
		this.client = client;

		// Set additional namespaces
		if(Array.isArray(options.namespaces)) {
			this.ns = options.namespaces;
		} else if(typeof options.namespaces === 'string') {
			this.ns = [options.namespaces];
		} else {
			this.ns = [];
		}

		/**
		 * Whether language files should be loaded or not.
		 * @type {?boolean}
		 * */
		this.loadTranslations = options.loadTranslations;

		/**
		 * Path pattern where the language files are located.
		 * @type {?string}
		 * */
		this.loadPath = options.localesPath;

		/**
		 * Whether the debug mode of i18next should be enabled.
		 * @type {boolean}
		 * */
		this.debug = options.debug === true;


		/**
		 * Path pattern where the language files are located.
		 * @type {Partial<TranslateOptions>}
		 * */
		this.overrides = options.overrides || {};


		/**
		 * Languages which can be switched to.
		 * @type {string[]}
		 * */
		this.supportedLanguages = options.supportedLanguages || [];


		/**
		 * The namespace used for builtin strings. Default is 'commando'.
		 * @type {string}
		 * */
		this.defaultNamespace = options.defaultNamespace || 'commando';

		this.options = {
			lng: client.defaultLanguage,
			ns: [this.defaultNamespace, ...this.ns],
			fallbackLng: ['dev', ...this.supportedLanguages],
			defaultNS: this.defaultNamespace,
			debug: this.debug,
			...this.overrides
		};


		/**
		 * The Languages in which can be translated.
		 * @type {CommandoLanguage[]}
		 * @private
		 */
		this._languages = this.supportedLanguages.map(languageCode => new CommandoLanguage(client, languageCode));

		// Initialize the i18next lib.
		this.init().catch(console.error);
	}

	/**
	 * Getter/Setter
	 * @name CommandoTranslatable#_languages
	 * @type {CommandoLanguage[]}
	 */
	get languages() {
		return this._languages;
	}

	set languages(languages) {
		this._languages = languages;
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

		if(this.debug) {
			console.time(timeLabel);
		}

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

		for(const languageCode of Object.keys(i18next.services.resourceStore.data)) {
			if(i18next.services.resourceStore.data[languageCode] !== {}) {
				const language = this.languages.find(lng => lng.code === languageCode);
				language.loaded = true;
			}
		}

		for(const language of this.languages) {
			language.loaded = i18next.services.resourceStore.data[language.code] !== undefined;
		}

		const loadedLanguages = i18next.languages || [];

		if(this.debug) {
			console.timeEnd(timeLabel);
			console.log(oneLine`[${CommandoTranslator.name}] 
			The following languages have been loaded: ${loadedLanguages.join(', ')}. 
			Default language is: ${this.client.defaultLanguage}.`);
		}
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

module.exports = CommandoTranslator;
