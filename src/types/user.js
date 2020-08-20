const ArgumentType = require('./base');
const { disambiguation } = require('../util');
const { escapeMarkdown } = require('discord.js');
const i18next = require('i18next');

class UserArgumentType extends ArgumentType {
	constructor(client) {
		super(client, 'user');
	}

	async validate(val, msg, arg) {
		const lng = msg.client.translator.resolveLanguage(msg);
		const matches = val.match(/^(?:<@!?)?([0-9]+)>?$/);
		if(matches) {
			try {
				const user = await msg.client.users.fetch(matches[1]);
				if(!user) return false;
				if(arg.oneOf && !arg.oneOf.includes(user.id)) return false;
				return true;
			} catch(err) {
				return false;
			}
		}
		if(!msg.guild) return false;
		const search = val.toLowerCase();
		let members = msg.guild.members.cache.filter(memberFilterInexact(search));
		if(members.size === 0) return false;
		if(members.size === 1) {
			if(arg.oneOf && !arg.oneOf.includes(members.first().id)) return false;
			return true;
		}
		const exactMembers = members.filter(memberFilterExact(search));
		if(exactMembers.size === 1) {
			if(arg.oneOf && !arg.oneOf.includes(exactMembers.first().id)) return false;
			return true;
		}
		if(exactMembers.size > 0) members = exactMembers;
		return members.size <= 15 ?
			`${i18next.t('error.too_many_found_with_list', {
				lng,
				label: '$t(common.user_plural)',
				itemList: disambiguation(
					members.map(mem => `${escapeMarkdown(mem.user.username)}#${mem.user.discriminator}`), null
				)
			})}\n` :
			i18next.t('error.too_many_found', {
				lng,
				what: '$t(common.user_plural)'
			});
	}

	parse(val, msg) {
		const matches = val.match(/^(?:<@!?)?([0-9]+)>?$/);
		if(matches) return msg.client.users.cache.get(matches[1]) || null;
		if(!msg.guild) return null;
		const search = val.toLowerCase();
		const members = msg.guild.members.cache.filter(memberFilterInexact(search));
		if(members.size === 0) return null;
		if(members.size === 1) return members.first().user;
		const exactMembers = members.filter(memberFilterExact(search));
		if(exactMembers.size === 1) return exactMembers.first().user;
		return null;
	}
}

function memberFilterExact(search) {
	return mem => mem.user.username.toLowerCase() === search ||
		(mem.nickname && mem.nickname.toLowerCase() === search) ||
		`${mem.user.username.toLowerCase()}#${mem.user.discriminator}` === search;
}

function memberFilterInexact(search) {
	return mem => mem.user.username.toLowerCase()
			.includes(search) ||
		(mem.nickname && mem.nickname.toLowerCase()
			.includes(search)) ||
		`${mem.user.username.toLowerCase()}#${mem.user.discriminator}`.includes(search);
}

module.exports = UserArgumentType;
