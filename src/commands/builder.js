const Command = require('./base');

/** Builds commands with a fluent API */
class CommandBuilder {
	/**
	 * @typedef {Object} CommandBuilderFunctions
	 * @property {Function} [run] - The run function to set
	 * @property {Function} [hasPermission] - The hasPermission function to set
	 */

	/**
	 * @param {CommandRegistry} registry - The registry the command is for
	 * @param {CommandInfo} [info] - The command info
	 * @param {CommandBuilderFunctions} [funcs] - The command functions to set
	 */
	constructor(registry, info = null, funcs = null) {
		if(!registry) throw new Error('A registry must be specified.');

		/** @type {CommandRegistry} */
		this.registry = registry;
		/** @type {CommandInfo} */
		this.commandInfo = info;
		/** @type {Command} */
		this.command = null;

		if(info) this.command = new Command(registry.client, info);
		if(funcs) {
			if(funcs.run) this.run(funcs.run);
			if(funcs.hasPermission) this.hasPermission(funcs.hasPermission);
		}
	}

	/**
	 * Sets the command information.
	 * This must be used before any other method if info was not provided to the constructor.
	 * @param {CommandInfo} info - The command info
	 * @return {CommandBuilder} This builder
	 */
	info(info) {
		this.commandInfo = info;
		this.command = new Command(this.registry.client, info);
		return this;
	}

	/**
	 * Sets the command's run method
	 * @param {Function} fn - The function to use
	 * @param {Array<*>} [extras=[]] - Extra values to pass to the function
	 * @return {CommandBuilder} This builder
	 */
	run(fn, extras = []) {
		if(typeof fn !== 'function') throw new TypeError('run must be provided a function.');
		if(!this.command) throw new Error('.info(obj) must be called first.');
		this.command.run = _bindAppend(fn, this.command, ...extras);
		return this;
	}

	/**
	 * Sets the command's hasPermission method
	 * @param {Function} fn - The function to use
	 * @param {Array<*>} [extras=[]] - Extra values to pass to the function
	 * @return {CommandBuilder} This builder
	 */
	hasPermission(fn, extras = []) {
		if(typeof fn !== 'function') throw new TypeError('hasPermission must be provided a function.');
		if(!this.command) throw new Error('.info(obj) must be called first.');
		this.command.hasPermission = _bindAppend(fn, this.command, ...extras);
		return this;
	}

	/**
	 * Registers the command
	 * @return {Command} The command that was registered
	 */
	register() {
		this.registry.registerCommand(this.command);
		return this.command;
	}
}

function _bindAppend(fn, self, ...args) {
	return function boundFunction(...args2) {
		return fn.apply(self, args2.concat(args));
	};
}

module.exports = CommandBuilder;
