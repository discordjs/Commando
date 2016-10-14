const Command = require('./command');
const CommandGroup = require('./command-group');
const CommandBuilder = require('./command-builder');
const CommandMessage = require('./command-message');

/** Handles registration and searching of commands and groups */
class CommandRegistry {
	/** @param {CommandoClient} [client] - Client to use  */
	constructor(client) {
		/**
		 * The client this registry is for
		 * @type {CommandoClient}
		 */
		this.client = client;

		/**
		 * Registered commands
		 * @type {Command[]}
		 */
		this.commands = [];

		/**
		 * Registered command groups
		 * @type {CommandGroup[]}
		 */
		this.groups = [];

		/**
		 * Registered objects for the eval command
		 * @type {Object}
		 */
		this.evalObjects = {};

		/**
		 * Fully resolved path to the bot's commands directory
		 * @type {?string}
		 */
		this.commandsPath = null;
	}

	/**
	 * Registers a single group
	 * @param {CommandGroup|function|string[]|string} group - A CommandGroup instance, a constructor,
	 * an array of [ID, Name], or the group ID
	 * @param {string} [name] name - Name for the group (if the first argument is the group ID)
	 * @return {CommandRegistry}
	 * @see {@link CommandRegistry#registerGroups}
	 */
	registerGroup(group, name) {
		if(typeof group === 'string') return this.registerGroups([[group, name]]);
		return this.registerGroups([group]);
	}

	/**
	 * Emitted when a group is registered
	 * @event CommandoClient#groupRegister
	 * @param {CommandGroup} group - Group that was registered
	 * @param {CommandRegistry} registry - Registry that the group was registered to
	 */

	/**
	 * Registers multiple groups
	 * @param {CommandGroup[]|function[]|Array<Array<string>>} groups - An array of CommandGroup instances, constructors,
	 * or arrays of [ID, Name]
	 * @return {CommandRegistry}
	 */
	registerGroups(groups) {
		if(!Array.isArray(groups)) throw new TypeError('Groups must be an array.');
		for(let group of groups) {
			if(typeof group === 'function') group = new CommandGroup(this.client);
			else if(Array.isArray(group)) group = new CommandGroup(this.client, ...group);
			else if(!(group instanceof CommandGroup)) group = new CommandGroup(this, group.id, group.name, group.commands);

			const existing = this.groups.find(grp => grp.id === group.id);
			if(existing) {
				existing.name = group.name;
				this.client.emit('debug', `Group ${group.id} is already registered; renamed it to "${group.name}".`);
			} else {
				this.groups.push(group);
				this.client.emit('debug', `Registered group ${group.id}.`);
				this.client.emit('groupRegister', group, this);
			}
		}
		return this;
	}

	/**
	 * Registers a single command
	 * @param {Command|CommandBuilder|function} command - Either a Command instance, or a constructor for one
	 * @return {CommandRegistry}
	 * @see {@link CommandRegistry#registerCommands}
	 */
	registerCommand(command) {
		return this.registerCommands([command]);
	}

	/**
	 * Emitted when a command is registered
	 * @event CommandoClient#commandRegister
	 * @param {CommandGroup} command - Command that was registered
	 * @param {CommandRegistry} registry - Registry that the command was registered to
	 */

	/**
	 * Registers multiple commands
	 * @param {Command[]|CommandBuilder[]|function[]} commands - An array of Command instances or constructors
	 * @return {CommandRegistry}
	 */
	registerCommands(commands) {
		if(!Array.isArray(commands)) throw new TypeError('Commands must be an array.');
		for(let command of commands) {
			if(typeof command === 'function') command = new command(this.client); // eslint-disable-line new-cap
			else if(command instanceof CommandBuilder) command = command.command;

			// Make sure there aren't any conflicts
			if(this.commands.some(cmd => cmd.name === command.name || cmd.aliases.includes(command.name))) {
				throw new Error(`A command with the name/alias "${command.name}" is already registered.`);
			}
			for(const alias of command.aliases) {
				if(this.commands.some(cmd => cmd.name === alias || cmd.aliases.some(ali => ali === alias))) {
					throw new Error(`A command with the name/alias "${alias}" is already registered.`);
				}
			}
			const group = this.groups.find(grp => grp.id === command.groupID);
			if(!group) throw new Error(`Group "${command.groupID}" is not registered.`);
			if(group.commands.some(cmd => cmd.memberName === command.memberName)) {
				throw new Error(`A command with the member name "${command.memberName}" is already registered in ${group.id}`);
			}

			// Add the command
			command.group = group;
			group.commands.push(command);
			this.commands.push(command);
			this.client.emit('commandRegister', command, this);
			this.client.emit('debug', `Registered command ${group.id}:${command.memberName}.`);
		}

		return this;
	}

	/**
	 * Registers all commands in a given directory. The files must export a Command class constructor or instance,
	 * or a CommandBuilder instance.
	 * @param {string|RequireAllOptions} options - The path to the directory, or a require-all options object
	 * @return {CommandRegistry}
	 */
	registerCommandsIn(options) {
		const obj = require('require-all')(options);
		const commands = [];
		for(const group of Object.values(obj)) {
			for(const command of Object.values(group)) commands.push(command);
		}
		if(typeof options === 'string' && !this.commandsPath) this.commandsPath = options;
		return this.registerCommands(commands);
	}

	/**
	 * Registers both the default groups and commands
	 * @return {CommandRegistry}
	 */
	registerDefaults() {
		this.registerDefaultGroups();
		this.registerDefaultCommands();
		return this;
	}

	/**
	 * Registers the default groups
	 * @return {CommandRegistry}
	 */
	registerDefaultGroups() {
		return this.registerGroups([
			['util', 'Utility']
		]);
	}

	/**
	 * Registers the default commands to the bot's registry
	 * @param {Object} [options] - Object specifying what commands to register
	 * @param {boolean} [options.help=true] - Whether or not to register the built-in help command
	 * @param {boolean} [options.prefix=true] - Whether or not to register the built-in prefix command
	 * @param {boolean} [options.eval_=true] - Whether or not to register the built-in eval command
	 * @param {boolean} [options.commandState=true] - Whether or not to register the built-in command state commands
	 * (enable, disable, toggle, list groups)
	 * @return {CommandRegistry}
	 */
	registerDefaultCommands({ help = true, prefix = true, eval_ = true, commandState = true } = {}) {
		if(help) this.registerCommand(require('./commands/util/help'));
		if(prefix) this.registerCommand(require('./commands/util/prefix'));
		if(eval_) this.registerCommand(require('./commands/util/eval'));
		if(commandState) {
			this.registerCommands([
				require('./commands/util/list-groups'),
				require('./commands/util/toggle'),
				require('./commands/util/enable'),
				require('./commands/util/disable'),
				require('./commands/util/reload')
			]);
		}
		return this;
	}

	/**
	 * Emitted when a command is reregistered
	 * @event CommandoClient#commandReregister
	 * @param {Command} newCommand - New command
	 * @param {Command} oldCommand - Old command
	 */

	/**
	 * Reregisters a command (does not support changing name, group, or memberName)
	 * @param {Command|CommandBuilder|function} command - New command
	 * @param {Command} oldCommand - Old command
	 */
	reregisterCommand(command, oldCommand) {
		if(typeof command === 'function') command = new command(this.client); // eslint-disable-line new-cap
		else if(command instanceof CommandBuilder) command = command.command;
		command.group = this.resolveGroup(command.groupID);
		this.commands[this.commands.indexOf(oldCommand)] = command;
		command.group.commands[oldCommand.group.commands.indexOf(oldCommand)] = command;
		this.client.emit('commandReregister', command, oldCommand);
	}

	/**
	 * Registers a single object to be usable by the eval command
	 * @param {string} key - The key for the object
	 * @param {Object} obj - The object
	 * @return {CommandRegistry}
	 * @see {@link Bot#registerEvalObjects}
	 */
	registerEvalObject(key, obj) {
		const registerObj = {};
		registerObj[key] = obj;
		return this.registerEvalObjects(registerObj);
	}

	/**
	 * Registers multiple objects to be usable by the eval command
	 * @param {Object} obj - An object of keys: values
	 * @return {CommandRegistry}
	 */
	registerEvalObjects(obj) {
		Object.assign(this.evalObjects, obj);
		return this;
	}

	/**
	 * Create a command builder
	 * @param {CommandInfo} [info] - The command information
	 * @param {CommandBuilderFunctions} [funcs] - The command functions to set
	 * @return {CommandBuilder} The builder
	 */
	buildCommand(info = null, funcs = null) {
		return new CommandBuilder(this, info, funcs);
	}

	/**
	 * Finds all groups that match the search string
	 * @param {string} [searchString] - The string to search for
	 * @param {boolean} [exact=false] - Whether the search should be exact
	 * @return {CommandGroup[]} All groups that are found
	 */
	findGroups(searchString = null, exact = false) {
		if(!searchString) return this.groups;

		// Find all matches
		const lcSearch = searchString.toLowerCase();
		const matchedGroups = this.groups.filter(
			exact ? this._exactGroupFilter.bind(lcSearch) : this._inexactGroupFilter.bind(lcSearch)
		);
		if(exact) return matchedGroups;

		// See if there's an exact match
		for(const group of matchedGroups) {
			if(group.name.toLowerCase() === lcSearch || group.id === lcSearch) return [group];
		}
		return matchedGroups;
	}

	/**
	 * A CommandGroupResolvable can be:
	 * * A CommandGroup
	 * * A group ID
	 * @typedef {CommandGroup|string} CommandGroupResolvable
	 */

	/**
	 * Resolves a CommandGroupResolvable to a CommandGroup object
	 * @param {CommandGroup|string} group - The group to resolve
	 * @return {CommandGroup} The resolved CommandGroup
	 */
	resolveGroup(group) {
		if(group instanceof CommandGroup) return group;
		if(typeof group === 'string') {
			const groups = this.findGroups(group, true);
			if(groups.length === 1) return groups[0];
		}
		throw new Error('Unable to resolve group.');
	}

	/**
	 * Finds all commands that match the search string
	 * @param {string} [searchString] - The string to search for
	 * @param {boolean} [exact=false] - Whether the search should be exact
	 * @param {Message} [message] - The message to check usability against
	 * @return {Command[]} All commands that are found
	 */
	findCommands(searchString = null, exact = false, message = null) {
		if(!searchString) return message ? this.commands.filter(cmd => cmd.isUsable(message)) : this.commands;

		// Find all matches
		const lcSearch = searchString.toLowerCase();
		const matchedCommands = this.commands.filter(
			exact ? this._exactCommandFilter.bind(lcSearch) : this._inexactCommandFilter.bind(lcSearch)
		);
		if(exact) return matchedCommands;

		// See if there's an exact match
		for(const command of matchedCommands) {
			if(command.name === lcSearch || (command.aliases && command.aliases.some(ali => ali === lcSearch))) {
				return [command];
			}
		}

		return matchedCommands;
	}

	/**
	 * A CommandResolvable can be:
	 * * A Command
	 * * A command name
	 * * A CommandMessage
	 * @typedef {Command|string} CommandResolvable
	 */

	/**
	 * Resolves a CommandResolvable to a Command object
	 * @param {Command|string} command - The command to resolve
	 * @return {Command} The resolved Command
	 */
	resolveCommand(command) {
		if(command instanceof Command) return command;
		if(command instanceof CommandMessage) return command.command;
		if(typeof command === 'string') {
			const commands = this.findCommands(command, true);
			if(commands.length === 1) return commands[0];
		}
		throw new Error('Unable to resolve command.');
	}

	_exactGroupFilter(grp) {
		return grp.id === this || grp.name.toLowerCase() === this;
	}

	_inexactGroupFilter(grp) {
		return grp.id.includes(this) || grp.name.toLowerCase().includes(this);
	}

	_exactCommandFilter(cmd) {
		return cmd.name === this ||
			(cmd.aliases && cmd.aliases.some(ali => ali === this)) ||
			`${cmd.groupID}:${cmd.memberName}` === this;
	}

	_inexactCommandFilter(cmd) {
		return cmd.name.includes(this) ||
			`${cmd.groupID}:${cmd.memberName}` === this ||
			(cmd.aliases && cmd.aliases.some(ali => ali.includes(this)));
	}
}

module.exports = CommandRegistry;
