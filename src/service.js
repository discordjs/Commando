/**
 * Handles a single service
* @property {string} name
* @global
*/
module.exports = class Service {
	/**
	 * Creates new service
	 * @param {CommandoClient} client The commando client
	 */
	constructor(client) {
		/** @type {NodeJS.Timeout[]} */
		this.intervals = [];
		this.realClient = client;
		this.handlers = new Map();
		var handlers = this.handlers;
		const proxyHandler = {
			apply: function apply(target, prop, receiver) {
				if(prop === 'on') {
					return function on(event, handler) {
						handlers.set(event, handler);
						return target;
					};
				}
				return Reflect.get(target, prop, receiver);
			}
		};
		this.client = new Proxy(client, proxyHandler);
	}

	setInterval(handler, length) {
		this.intervals.push(setInterval(handler, length));
	}

	unload() {
		this.intervals.forEach(id => clearInterval(id));
		this.handlers.forEach((handler, event) => {
			this.realClient.off(event, handler);
			this.handlers.delete(event);
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
