const ArgumentType = require('./base');
const i18next = require('i18next');

class BooleanArgumentType extends ArgumentType {
	constructor(client) {
		super(client, 'boolean');
	}

	validate(val, msg) {
		const lc = val.toLowerCase();
		const aliases = this.resolveBooleanAliases(msg);
		return aliases.truthy.has(lc) || aliases.falsy.has(lc);
	}

	parse(val, msg) {
		const lc = val.toLowerCase();
		const aliases = this.resolveBooleanAliases(msg);
		if(aliases.truthy.has(lc)) return true;
		if(aliases.falsy.has(lc)) return false;
		throw new RangeError('Unknown boolean value.');
	}

	/*
	* Additional values for truthy and falsy are defined in translations
	* */
	resolveBooleanAliases(msg) {
		const lng = msg.client.translator.resolveLanguage(msg);
		const localizedTruthyValues = i18next.t('argument_type.boolean.truthy', {
			lng,
			returnObjects: true
		});
		const aliases = {};
		aliases.truthy = new Set(['true', '1', '+']
			.concat(Array.isArray(localizedTruthyValues) ? localizedTruthyValues : []));

		const localizedFalsyValues = i18next.t('argument_type.boolean.falsy', {
			lng,
			returnObjects: true
		});
		aliases.falsy = new Set(['false', '0', '-']
			.concat(Array.isArray(localizedFalsyValues) ? localizedFalsyValues : []));

		return aliases;
	}
}

module.exports = BooleanArgumentType;
