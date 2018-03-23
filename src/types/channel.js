const ArgumentType = require('./base');
const { disambiguation } = require('../util');
const { escapeMarkdown } = require('discord.js');

class ChannelArgumentType extends ArgumentType {
	constructor(client) {
		super(client, 'channel');
	}

	validate(value, msg, arg) {
		const matches = value.match(/^(?:<#)?([0-9]+)>?$/);
		if(matches) return msg.guild.channels.has(matches[1]);
		const search = value.toLowerCase();
		let channels = msg.guild.channels.filterArray(nameFilterInexact(search));
		if(channels.length === 0) return false;
		if(channels.length === 1) {
			if(arg.oneOf && !arg.oneOf.includes(channels[0].id)) return false;
			return true;
		}
		const exactChannels = channels.filter(nameFilterExact(search));
		if(exactChannels.length === 1) {
			if(arg.oneOf && !arg.oneOf.includes(exactChannels[0].id)) return false;
			return true;
		}
		if(exactChannels.length > 0) channels = exactChannels;
		return channels.length <= 15 ?
			`${disambiguation(channels.map(chan => escapeMarkdown(chan.name)), 'channels', null)}\n` :
			'Multiple channels found. Please be more specific.';
	}

	parse(value, msg) {
		const matches = value.match(/^(?:<#)?([0-9]+)>?$/);
		if(matches) return msg.guild.channels.get(matches[1]) || null;
		const search = value.toLowerCase();
		const channels = msg.guild.channels.filterArray(nameFilterInexact(search));
		if(channels.length === 0) return null;
		if(channels.length === 1) return channels[0];
		const exactChannels = channels.filter(nameFilterExact(search));
		if(exactChannels.length === 1) return exactChannels[0];
		return null;
	}
}

function nameFilterExact(search) {
	return thing => thing.name.toLowerCase() === search;
}

function nameFilterInexact(search) {
	return thing => thing.name.toLowerCase().includes(search);
}

module.exports = ChannelArgumentType;
