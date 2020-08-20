const ArgumentType = require('./base');
const { disambiguation } = require('../util');
const { escapeMarkdown } = require('discord.js');
const i18next = require('i18next');

class GroupArgumentType extends ArgumentType {
	constructor(client) {
		super(client, 'group');
	}

	validate(val, msg) {
		const lng = msg.client.translator.resolveLanguage(msg);
		const groups = this.client.registry.findGroups(val);
		if(groups.length === 1) return true;
		if(groups.length === 0) return false;
		return groups.length <= 15 ?
			`${i18next.t('error.too_many_found_with_list', {
				lng,
				label: '$t(common.group_plural)',
				itemList: disambiguation(
					groups.map(grp => escapeMarkdown(grp.name)), null
				)
			})}\n` :
			i18next.t('error.too_many_found', {
				lng,
				what: '$t(common.group_plural)'
			});
	}

	parse(val) {
		return this.client.registry.findGroups(val)[0];
	}
}

module.exports = GroupArgumentType;
