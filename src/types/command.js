const ArgumentType = require('./base');
const { disambiguation } = require('../util');
const { escapeMarkdown } = require('discord.js');
const i18next = require('i18next');

class CommandArgumentType extends ArgumentType {
	constructor(client) {
		super(client, 'command');
	}

	validate(val, msg) {
		const lng = msg.client.translator.resolveLanguage(msg);
		const commands = this.client.registry.findCommands(val);
		if(commands.length === 1) return true;
		if(commands.length === 0) return false;
		return commands.length <= 15 ?
			`${i18next.t('error.too_many_found_with_list', {
				lng,
				label: '$t(common.command_plural)',
				itemList: disambiguation(
					commands.map(cmd => escapeMarkdown(cmd.name)), null
				)
			})}\n` :
			i18next.t('error.too_many_found', {
				lng,
				what: '$t(common.command_plural)'
			});
	}

	parse(val) {
		return this.client.registry.findCommands(val)[0];
	}
}

module.exports = CommandArgumentType;
