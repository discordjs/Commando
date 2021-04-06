/* eslint-disable func-names */
const path = require('path');

const { object: ObjectUtils } = require('@nowifi4u/utils');

module.exports = class LocaleProvider {
	/**
	 *
	 * @param {string[]} defaultConfigs Names of default configs to load
	 * @param {string[]} loadConfigs Paths to locale file to load
	 */
	constructor({ defaults = [], customs = [], fallback = 'en' } = {}) {
		this.cache = {};
		this._fallback = fallback;

		this.loadDefault(fallback);
		defaults.forEach(val => { this.loadDefault(val); });
		customs.forEach(val => { this.load(val); });
	}

	/**
	 *
	 * @param {string} locale Name of the locale
	 * @returns {boolean} Is locale loaded
	 */
	loaded(locale) {
		if(typeof locale !== 'string') throw new TypeError(`Argument must be of type string, not ${typeof locale}`);

		locale = locale.toLowerCase();

		return this.cache[locale] !== undefined;
	}

	get(locale) {
		if(typeof locale !== 'string') throw new TypeError(`Argument must be of type string, not ${typeof locale}`);

		locale = locale.toLowerCase();

		return this.cache[locale];
	}

	/**
	 *
	 * @param {string} filepath Path to the locale file
	 * @returns {LocaleProvider}
	 */
	load(filepath) {
		if(typeof filepath !== 'string') throw new TypeError(`Argument must be of type string, not ${typeof filepath}`);

		const data = require(filepath);
		if(typeof this.cache[data.name] !== 'object') this.cache[data.name] = ObjectUtils.mapDeep(this.cache[this._fallback]);
		ObjectUtils.assignDeepCheck(this.cache[data.name], data);

		return this;
	}

	/**
	 *
	 * @param {string} locale Name of the locale
	 * @returns {LocaleProvider}
	 */
	loadDefault(locale) {
		if(typeof locale !== 'string') throw new TypeError(`Argument must be of type string, not ${typeof locale}`);
		const filepath = path.resolve(__dirname, `${locale.toLowerCase()}.js`);
		this.load(filepath);
		return this;
	}

	loadDefaults() {
		this.loadDefault('ru');
		this.loadDefault('en');
	}
};
