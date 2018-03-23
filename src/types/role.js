const ArgumentType = require('./base');
const { disambiguation } = require('../util');
const { escapeMarkdown } = require('discord.js');

class RoleArgumentType extends ArgumentType {
	constructor(client) {
		super(client, 'role');
	}

	validate(value, msg, arg) {
		const matches = value.match(/^(?:<@&)?([0-9]+)>?$/);
		if(matches) return msg.guild.roles.has(matches[1]);
		const search = value.toLowerCase();
		let roles = msg.guild.roles.filterArray(nameFilterInexact(search));
		if(roles.length === 0) return false;
		if(roles.length === 1) {
			if(arg.oneOf && !arg.oneOf.includes(roles[0].id)) return false;
			return true;
		}
		const exactRoles = roles.filter(nameFilterExact(search));
		if(exactRoles.length === 1) {
			if(arg.oneOf && !arg.oneOf.includes(exactRoles[0].id)) return false;
			return true;
		}
		if(exactRoles.length > 0) roles = exactRoles;
		return roles.length <= 15 ?
			`${disambiguation(roles.map(role => `${escapeMarkdown(role.name)}`), 'roles', null)}\n` :
			'Multiple roles found. Please be more specific.';
	}

	parse(value, msg) {
		const matches = value.match(/^(?:<@&)?([0-9]+)>?$/);
		if(matches) return msg.guild.roles.get(matches[1]) || null;
		const search = value.toLowerCase();
		const roles = msg.guild.roles.filterArray(nameFilterInexact(search));
		if(roles.length === 0) return null;
		if(roles.length === 1) return roles[0];
		const exactRoles = roles.filter(nameFilterExact(search));
		if(exactRoles.length === 1) return exactRoles[0];
		return null;
	}
}

function nameFilterExact(search) {
	return thing => thing.name.toLowerCase() === search;
}

function nameFilterInexact(search) {
	return thing => thing.name.toLowerCase().includes(search);
}

module.exports = RoleArgumentType;
