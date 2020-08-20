const ArgumentType = require('./base');
const i18next = require('i18next');

class IntegerArgumentType extends ArgumentType {
	constructor(client) {
		super(client, 'integer');
	}

	validate(val, msg, arg) {
		const lng = msg.client.translator.resolveLanguage(msg);
		const int = Number.parseInt(val);
		if(Number.isNaN(int)) return false;
		if(arg.oneOf && !arg.oneOf.includes(int)) {
			return i18next.t('argument_type.integer.available_options', {
				lng,
				options: arg.oneOf.map(opt => `\`${opt}\``)
					.join(', ')
			});
		}
		if(arg.min !== null && typeof arg.min !== 'undefined' && int < arg.min) {
			return i18next.t('argument_type.integer.value_too_small', {
				lng,
				min: arg.min
			});
		}
		if(arg.max !== null && typeof arg.max !== 'undefined' && int > arg.max) {
			return i18next.t('argument_type.integer.value_too_big', {
				lng,
				max: arg.max
			});
		}
		return true;
	}

	parse(val) {
		return Number.parseInt(val);
	}
}

module.exports = IntegerArgumentType;
