const { stripIndents } = require('common-tags');
const ArgumentType = require('./base');
const { disambiguation } = require('../util');
const { escapeMarkdown } = require('discord.js');

class CommandOrGroupArgumentType extends ArgumentType {
	constructor(client) {
		super(client, 'command-or-group');
	}

	validate(val) {
		const groups = this.client.registry.findGroups(val);
		if(groups.length === 1) return true;
		const commands = this.client.registry.findCommands(val);
		if(commands.length === 1) return true;
		if(commands.length === 0 && groups.length === 0) return false;
		return stripIndents`
			${commands.length <= 15 ?
				`${disambiguation(commands.map(cmd => escapeMarkdown(cmd.name)), 'commands', null)}\n` :
				'Multiple commands found. Please be more specific.'}
			${groups.length <= 15 ?
				`${disambiguation(groups.map(grp => escapeMarkdown(grp.name)), 'groups', null)}\n` :
				'Multiple groups found. Please be more specific.'}
		`;
	}

	parse(val) {
		return this.client.registry.findGroups(val)[0] || this.client.registry.findCommands(val)[0];
	}
}

module.exports = CommandOrGroupArgumentType;
