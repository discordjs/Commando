const ArgumentType = require('./base');
const i18next = require('i18next');

class FloatArgumentType extends ArgumentType {
	constructor(client) {
		super(client, 'float');
	}

	validate(val, msg, arg) {
		const lng = msg.client.translator.resolveLanguage(msg);
		const float = Number.parseFloat(val);
		if(Number.isNaN(float)) return false;
		if(arg.oneOf && !arg.oneOf.includes(float)) {
			return i18next.t('argument_type.float.available_options', {
				lng,
				options: arg.oneOf.map(opt => `\`${opt}\``)
					.join(', ')
			});
		}
		if(arg.min !== null && typeof arg.min !== 'undefined' && float < arg.min) {
			return i18next.t('argument_type.float.value_too_small', {
				lng,
				min: arg.min
			});
		}
		if(arg.max !== null && typeof arg.max !== 'undefined' && float > arg.max) {
			return i18next.t('argument_type.float.value_too_big', {
				lng,
				max: arg.max
			});
		}
		return true;
	}

	parse(val) {
		return Number.parseFloat(val);
	}
}

module.exports = FloatArgumentType;
