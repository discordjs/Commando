/**
 * Handles a single service
 */
class Service {
	/**
	 * Creates new service
	 * @param {CommandoClient} client - The commando client
	 */
	constructor(client) {
		/**
		 * Active intervals
		 * @type {NodeJS.Timeout[]}
		 */
		this.intervals = [];
		/**
		 * Real, unproxied client
		 * @type {CommandoClient}
		 */
		this.realClient = client;
		/**
		 * Applied handlers
		 * @type {Map<string, Function>}
		 */
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
		/**
		 * The client to register handlers on. Proxied
		 * @type {CommandoClient}
		 */
		this.client = new Proxy(client, proxyHandler);
	}

	/**
	 * Creates an interval using `setInterval`, removed when reloaded
	 * @param {Function} handler - The callback handler to pass to setInterval
	 * @param {number} length - Number of miliseconds to wait between each call
	 * @returns {NodeJS.Timeout[]}
	 */
	setInterval(handler, length) {
		var i = setInterval(handler, length);
		this.intervals.push(i);
		return i;
	}

	/**
	 * Unloads the service
	 * @returns {void}
	 */
	unload() {
		this.intervals.forEach(id => clearInterval(id));
		this.handlers.forEach((handler, event) => {
			this.realClient.off(event, handler);
			this.handlers.delete(event);
		});
	}

	/**
	 * Loads the service
	 * @abstract
	 * @returns {void}
	 */
	load() {
		throw new Error('Service does not implement load function');
	}

	/**
	 * Appends handlers to the real client
	 * @private
	 * @returns {void}
	 */
	appendHandlers() {
		this.handlers.forEach((handler, event) => {
			this.realClient.on(event, handler);
		});
	}

	/**
	 * Reloads the service
	 * @returns {void}
	 */
	reload() {
		this.unload();
		var path = require.resolve(this.path);
		delete require.cache[path];
		this.realClient.registry.registerServiceFrom(this.path);
	}
}

module.exports = Service;
