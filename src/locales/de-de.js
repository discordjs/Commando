const Locale = require('./base');

class deDE extends Locale {
	constructor(client) {
		super(client, 'de-de');
		this.language = { MESSAGE_CANCELLED: 'Befehl abgebrochen.' };
	}
}

module.exports = deDE;
