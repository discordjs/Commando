const ArgumentType = require('./base');
const { disambiguation } = require('../util');
const { escapeMarkdown } = require('discord.js');

class CommandArgumentType extends ArgumentType {
	constructor(client) {
		super(client, 'command');
	}

	validate(val) {
		const commands = this.client.registry.findCommands(val);
		if(commands.length === 1) return true;
		if(commands.length === 0) return false;
		return commands.length <= 15 ?
			`${disambiguation(commands.map(cmd => escapeMarkdown(cmd.name)), 'commands', null)}\n` :
			'Multiple commands found. Please be more specific.';
	}

	parse(val) {
		return this.client.registry.findCommands(val)[0];
	}
}

module.exports = CommandArgumentType;
