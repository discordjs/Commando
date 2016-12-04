const ArgumentType = require('./base');
const disambiguation = require('../util').disambiguation;
const escapeMarkdown = require('discord.js').escapeMarkdown;

class MemberArgumentType extends ArgumentType {
	constructor(client) {
		super(client, 'member');
	}

	async validate(value, msg) {
		const matches = value.match(/^(?:<@!?)?([0-9]+)>?$/);
		if(matches) {
			try {
				return await msg.guild.fetchMember(await msg.client.fetchUser(matches[1]));
			} catch(err) {
				return false;
			}
		}
		const search = value.toLowerCase();
		let members = msg.guild.members.filterArray(memberFilterInexact(search));
		if(members.length === 0) return false;
		if(members.length === 1) return members[0];
		const exactMembers = members.filter(memberFilterExact(search));
		if(exactMembers.length === 1) return members[0];
		if(exactMembers.length > 0) members = exactMembers;
		return members.length <= 15 ?
			`${disambiguation(
				members.map(mem => `${escapeMarkdown(mem.user.username)}#${mem.user.discriminator}`), 'users', null
			)}\n` :
			'Multiple users found. Please be more specific.';
	}

	parse(value, msg) {
		const matches = value.match(/^(?:<@!?)?([0-9]+)>?$/);
		if(matches) return msg.guild.member(matches[1]) || null;
		const search = value.toLowerCase();
		const members = msg.guild.members.filterArray(memberFilterInexact(search));
		if(members.length === 0) return null;
		if(members.length === 1) return members[0];
		const exactMembers = members.filter(memberFilterExact(search));
		if(exactMembers.length === 1) return members[0];
		return null;
	}
}

function memberFilterExact(search) {
	return mem => mem.user.username.toLowerCase() === search ||
		(mem.nickname && mem.nickname.toLowerCase() === search) ||
		`${mem.user.username.toLowerCase()}#${mem.user.discriminator}` === search;
}

function memberFilterInexact(search) {
	return mem => mem.user.username.toLowerCase().includes(search) ||
		(mem.nickname && mem.nickname.toLowerCase().includes(search)) ||
		`${mem.user.username.toLowerCase()}#${mem.user.discriminator}`.includes(search);
}

module.exports = MemberArgumentType;
