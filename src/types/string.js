const ArgumentType = require('./base');
const i18next = require('i18next');

class StringArgumentType extends ArgumentType {
	constructor(client) {
		super(client, 'string');
	}

	validate(val, msg, arg) {
		const lng = msg.client.translator.resolveLanguage(msg);
		if(arg.oneOf && !arg.oneOf.includes(val.toLowerCase())) {
			return i18next.t('argument_type.string.available_options', {
				lng,
				options: arg.oneOf.map(opt => `\`${opt}\``)
					.join(', ')
			});
		}
		if(arg.min !== null && typeof arg.min !== 'undefined' && val.length < arg.min) {
			return i18next.t('argument_type.string.value_too_small', {
				lng,
				min: arg.min,
				label: arg.label
			});
		}
		if(arg.max !== null && typeof arg.max !== 'undefined' && val.length > arg.max) {
			return i18next.t('argument_type.string.value_too_big', {
				lng,
				max: arg.max,
				label: arg.label
			});
		}
		return true;
	}

	parse(val) {
		return val;
	}
}

module.exports = StringArgumentType;
