const { stripIndents } = require('common-tags');
const ArgumentType = require('./base');
const { disambiguation } = require('../util');

class CommandOrGroupArgumentType extends ArgumentType {
	constructor(client) {
		super(client, 'command-or-group');
	}

	validate(value) {
		const groups = this.client.registry.findGroups(value);
		if(groups.length === 1) return true;
		const commands = this.client.registry.findCommands(value);
		if(commands.length === 1) return true;
		if(commands.length === 0 && groups.length === 0) return false;
		return stripIndents`
			${commands.length > 1 ? disambiguation(commands, 'commands') : ''}
			${groups.length > 1 ? disambiguation(groups, 'groups') : ''}
		`;
	}

	parse(value) {
		return this.client.registry.findGroups(value)[0] || this.client.registry.findCommands(value)[0];
	}
}

module.exports = CommandOrGroupArgumentType;
