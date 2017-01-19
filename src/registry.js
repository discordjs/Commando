const path = require('path');
const discord = require('discord.js');
const Command = require('./commands/base');
const CommandGroup = require('./commands/group');
const CommandMessage = require('./commands/message');
const ArgumentType = require('./types/base');

/** Handles registration and searching of commands and groups */
class CommandRegistry {
	/** @param {CommandoClient} [client] - Client to use  */
	constructor(client) {
		/**
		 * The client this registry is for
		 * @name CommandRegistry#client
		 * @type {CommandoClient}
		 * @readonly
		 */
		Object.defineProperty(this, 'client', { value: client });

		/**
		 * Registered commands
		 * @type {Collection<string, Command>}
		 */
		this.commands = new discord.Collection();

		/**
		 * Registered command groups
		 * @type {Collection<string, CommandGroup>}
		 */
		this.groups = new discord.Collection();

		/**
		 * Registered argument types
		 * @type {Collection<string, ArgumentType>}
		 */
		this.types = new discord.Collection();

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
	 * @param {CommandGroup|Function|string[]|string} group - A CommandGroup instance, a constructor,
	 * an array of [ID, Name], or the group ID
	 * @param {string} [name] - Name for the group (if the first argument is the group ID)
	 * @return {CommandRegistry}
	 * @see {@link CommandRegistry#registerGroups}
	 */
	registerGroup(group, name) {
		if(typeof group === 'string') return this.registerGroups([[group, name]]);
		return this.registerGroups([group]);
	}

	/**
	 * Registers multiple groups
	 * @param {CommandGroup[]|Function[]|Array<string[]>} groups - An array of CommandGroup instances, constructors,
	 * or arrays of [ID, Name]
	 * @return {CommandRegistry}
	 */
	registerGroups(groups) {
		if(!Array.isArray(groups)) throw new TypeError('Groups must be an Array.');
		for(let group of groups) {
			if(typeof group === 'function') group = new CommandGroup(this.client);
			else if(Array.isArray(group)) group = new CommandGroup(this.client, ...group);
			else if(!(group instanceof CommandGroup)) group = new CommandGroup(this, group.id, group.name, group.commands);

			const existing = this.groups.get(group.id);
			if(existing) {
				existing.name = group.name;
				this.client.emit('debug', `Group ${group.id} is already registered; renamed it to "${group.name}".`);
			} else {
				this.groups.set(group.id, group);
				/**
				 * Emitted when a group is registered
				 * @event CommandoClient#groupRegister
				 * @param {CommandGroup} group - Group that was registered
				 * @param {CommandRegistry} registry - Registry that the group was registered to
				 */
				this.client.emit('groupRegister', group, this);
				this.client.emit('debug', `Registered group ${group.id}.`);
			}
		}
		return this;
	}

	/**
	 * Registers a single command
	 * @param {Command|Function} command - Either a Command instance, or a constructor for one
	 * @return {CommandRegistry}
	 * @see {@link CommandRegistry#registerCommands}
	 */
	registerCommand(command) {
		return this.registerCommands([command]);
	}

	/**
	 * Registers multiple commands
	 * @param {Command[]|Function[]} commands - An array of Command instances or constructors
	 * @return {CommandRegistry}
	 */
	registerCommands(commands) {
		if(!Array.isArray(commands)) throw new TypeError('Commands must be an Array.');
		for(let command of commands) {
			if(typeof command === 'function') command = new command(this.client); // eslint-disable-line new-cap

			// Verify that it's an actual command
			if(!(command instanceof Command)) {
				this.client.emit('warn', `Attempting to register an invalid command object: ${command}; skipping.`);
				continue;
			}

			// Make sure there aren't any conflicts
			if(this.commands.some(cmd => cmd.name === command.name || cmd.aliases.includes(command.name))) {
				throw new Error(`A command with the name/alias "${command.name}" is already registered.`);
			}
			for(const alias of command.aliases) {
				if(this.commands.some(cmd => cmd.name === alias || cmd.aliases.includes(alias))) {
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
			group.commands.set(command.name, command);
			this.commands.set(command.name, command);
			/**
			 * Emitted when a command is registered
			 * @event CommandoClient#commandRegister
			 * @param {Command} command - Command that was registered
			 * @param {CommandRegistry} registry - Registry that the command was registered to
			 */
			this.client.emit('commandRegister', command, this);
			this.client.emit('debug', `Registered command ${group.id}:${command.memberName}.`);
		}

		return this;
	}

	/**
	 * Registers all commands in a directory. The files must export a Command class constructor or instance.
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
	 * Registers a single argument type
	 * @param {ArgumentType|Function} type - Either an ArgumentType instance, or a constructor for one
	 * @return {CommandRegistry}
	 * @see {@link CommandRegistry#registerTypes}
	 */
	registerType(type) {
		return this.registerTypes([type]);
	}

	/**
	 * Registers multiple argument types
	 * @param {ArgumentType[]|Function[]} types - An array of ArgumentType instances or constructors
	 * @return {CommandRegistry}
	 */
	registerTypes(types) {
		if(!Array.isArray(types)) throw new TypeError('Types must be an Array.');
		for(let type of types) {
			if(typeof type === 'function') type = new type(this.client); // eslint-disable-line new-cap

			// Verify that it's an actual type
			if(!(type instanceof ArgumentType)) {
				this.client.emit('warn', `Attempting to register an invalid argument type object: ${type}; skipping.`);
				continue;
			}

			// Make sure there aren't any conflicts
			if(this.types.has(type.id)) throw new Error(`An argument type with the ID "${type.id}" is already registered.`);

			// Add the type
			this.types.set(type.id, type);
			/**
			 * Emitted when an argument type is registered
			 * @event CommandoClient#typeRegister
			 * @param {ArgumentType} type - Argument type that was registered
			 * @param {CommandRegistry} registry - Registry that the type was registered to
			 */
			this.client.emit('typeRegister', type, this);
			this.client.emit('debug', `Registered argument type ${type.id}.`);
		}

		return this;
	}

	/**
	 * Registers all argument types in a directory. The files must export an ArgumentType class constructor or instance.
	 * @param {string|RequireAllOptions} options - The path to the directory, or a require-all options object
	 * @return {CommandRegistry}
	 */
	registerTypesIn(options) {
		const obj = require('require-all')(options);
		const types = [];
		for(const type of Object.values(obj)) types.push(type);
		return this.registerTypes(types);
	}

	/**
	 * Registers the default argument types, groups, and commands
	 * @return {CommandRegistry}
	 */
	registerDefaults() {
		this.registerDefaultTypes();
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
			['commands', 'Commands', true],
			['util', 'Utility']
		]);
	}

	/**
	 * Registers the default commands to the registry
	 * @param {Object} [options] - Object specifying what commands to register
	 * @param {boolean} [options.help=true] - Whether or not to register the built-in help command
	 * @param {boolean} [options.prefix=true] - Whether or not to register the built-in prefix command
	 * @param {boolean} [options.eval_=true] - Whether or not to register the built-in eval command
	 * @param {boolean} [options.ping=true] - Whether or not to register the built-in ping command
	 * @param {boolean} [options.commandState=true] - Whether or not to register the built-in command state commands
	 * (enable, disable, reload, list groups)
	 * @return {CommandRegistry}
	 */
	registerDefaultCommands({ help = true, prefix = true, ping = true, eval_ = true, commandState = true } = {}) {
		if(help) this.registerCommand(require('./commands/util/help'));
		if(prefix) this.registerCommand(require('./commands/util/prefix'));
		if(ping) this.registerCommand(require('./commands/util/ping'));
		if(eval_) this.registerCommand(require('./commands/util/eval'));
		if(commandState) {
			this.registerCommands([
				require('./commands/commands/groups'),
				require('./commands/commands/enable'),
				require('./commands/commands/disable'),
				require('./commands/commands/reload'),
				require('./commands/commands/load'),
				require('./commands/commands/unload')
			]);
		}
		return this;
	}

	/**
	 * Registers the default argument types to the registry. These are:
	 * - string
	 * - integer
	 * - float
	 * - boolean
	 * - user
	 * - member
	 * - role
	 * - channel
	 * - message
	 * @return {CommandRegistry}
	 */
	registerDefaultTypes() {
		this.registerTypes([
			require('./types/string'),
			require('./types/integer'),
			require('./types/float'),
			require('./types/boolean'),
			require('./types/user'),
			require('./types/member'),
			require('./types/role'),
			require('./types/channel'),
			require('./types/message')
		]);
		return this;
	}

	/**
	 * Reregisters a command (does not support changing name, group, or memberName)
	 * @param {Command|Function} command - New command
	 * @param {Command} oldCommand - Old command
	 */
	reregisterCommand(command, oldCommand) {
		if(typeof command === 'function') command = new command(this.client); // eslint-disable-line new-cap
		if(command.name !== oldCommand.name) throw new Error('Command name cannot change.');
		if(command.groupID !== oldCommand.groupID) throw new Error('Command group cannot change.');
		if(command.memberName !== oldCommand.memberName) throw new Error('Command memberName cannot change.');
		command.group = this.resolveGroup(command.groupID);
		command.group.commands.set(command.name, command);
		this.commands.set(command.name, command);
		/**
		 * Emitted when a command is reregistered
		 * @event CommandoClient#commandReregister
		 * @param {Command} newCommand - New command
		 * @param {Command} oldCommand - Old command
		 */
		this.client.emit('commandReregister', command, oldCommand);
		this.client.emit('debug', `Reregistered command ${command.groupID}:${command.memberName}.`);
	}

	/**
	 * Unregisters a command
	 * @param {Command} command - Command to unregister
	 */
	unregisterCommand(command) {
		this.commands.delete(command.name);
		command.group.commands.delete(command.name);
		/**
		 * Emitted when a command is unregistered
		 * @event CommandoClient#commandUnregister
		 * @param {Command} command - Command that was unregistered
		 */
		this.client.emit('commandUnregister', command);
		this.client.emit('debug', `Unregistered command ${command.groupID}:${command.memberName}.`);
	}

	/**
	 * Registers a single object to be usable by the eval command
	 * @param {string} key - The key for the object
	 * @param {Object} obj - The object
	 * @return {CommandRegistry}
	 * @see {@link CommandRegistry#registerEvalObjects}
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
	 * Finds all groups that match the search string
	 * @param {string} [searchString] - The string to search for
	 * @param {boolean} [exact=false] - Whether the search should be exact
	 * @return {CommandGroup[]} All groups that are found
	 */
	findGroups(searchString = null, exact = false) {
		if(!searchString) return this.groups;

		// Find all matches
		const lcSearch = searchString.toLowerCase();
		const matchedGroups = this.groups.filterArray(
			exact ? groupFilterExact(lcSearch) : groupFilterInexact(lcSearch)
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
	 * @param {CommandGroupResolvable} group - The group to resolve
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
		if(!searchString) return message ? this.commands.filterArray(cmd => cmd.isUsable(message)) : this.commands;

		// Find all matches
		const lcSearch = searchString.toLowerCase();
		const matchedCommands = this.commands.filterArray(
			exact ? commandFilterExact(lcSearch) : commandFilterInexact(lcSearch)
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
	 * @param {CommandResolvable} command - The command to resolve
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

	/**
	 * Resolves a command file path from a command's group ID and memberName
	 * @param {string} group - ID of the command's group
	 * @param {string} memberName - Member name of the command
	 * @return {string} Fully-resolved path to the corresponding command file
	 */
	resolveCommandPath(group, memberName) {
		return path.join(this.commandsPath, group, `${memberName}.js`);
	}
}

function groupFilterExact(search) {
	return grp => grp.id === search || grp.name.toLowerCase() === search;
}

function groupFilterInexact(search) {
	return grp => grp.id.includes(search) || grp.name.toLowerCase().includes(search);
}

function commandFilterExact(search) {
	return cmd => cmd.name === search ||
		(cmd.aliases && cmd.aliases.some(ali => ali === search)) ||
		`${cmd.groupID}:${cmd.memberName}` === search;
}

function commandFilterInexact(search) {
	return cmd => cmd.name.includes(search) ||
		`${cmd.groupID}:${cmd.memberName}` === search ||
		(cmd.aliases && cmd.aliases.some(ali => ali.includes(search)));
}

module.exports = CommandRegistry;
