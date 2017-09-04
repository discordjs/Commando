const Locale = require('./base');

class enUS extends Locale {
	constructor(client) {
		super(client, 'en-us');
		this.language = { MESSAGE_CANCELLED: 'Cancelled command.' };
	}
}

module.exports = enUS;
