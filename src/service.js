/**
	* @property {Map<string, Function>} handlers
	*/
class RegisteredHandlers {
	constructor() {
		this.handlers = new Map();
	}

	on(event, handler) {
		this.handlers.set(event, handler);
		return this;
	}
}

/**
 * Handles a single service
* @property {CommandoClient} client
* @property {string} name
* @global
*/
module.exports = class Service {
	constructor(client) {
		this.intervals = [];
		this.realClient = client;
		this.client = new RegisteredHandlers();
	}

	setInterval(handler, length) {
		this.intervals.push(setInterval(handler, length));
	}

	unload() {
		this.intervals.forEach(id => clearInterval(id));
		this.client.handlers.forEach((handler, event) => {
			this.realClient.off(event, handler);
			this.client.handlers.delete(event);
		});
	}

	load() {
		throw new Error('Service does not implement load function');
	}

	appendHandlers() {
		this.client.handlers.forEach((handler, event) => {
			this.realClient.on(event, handler);
		});
	}

	reload() {
		this.unload();
		var path = require.resolve(this.path);
		delete require.cache[path];
		this.realClient.registry.registerServiceFrom(this.path);
	}
};
