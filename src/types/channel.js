const ArgumentType = require('./base');
const { disambiguation } = require('../util');
const { escapeMarkdown } = require('discord.js');

class ChannelArgumentType extends ArgumentType {
	constructor(client) {
		super(client, 'channel');
	}

	validate(val, msg, arg) {
		const matches = val.match(/^(?:<#)?([0-9]+)>?$/);
		if(matches) return msg.guild.channels.has(matches[1]);
		const search = val.toLowerCase();
		let channels = msg.guild.channels.filter(filterInexact(search, arg.channelType));
		if(channels.size === 0) return false;
		if(channels.size === 1) {
			if(arg.oneOf && !arg.oneOf.includes(channels.first().id)) return false;
			return true;
		}
		const exactChannels = channels.filter(filterExact(search, arg.channelType));
		if(exactChannels.size === 1) {
			if(arg.oneOf && !arg.oneOf.includes(exactChannels.first().id)) return false;
			return true;
		}
		if(exactChannels.size > 0) channels = exactChannels;
		return channels.size <= 15 ?
			`${disambiguation(channels.map(chan => escapeMarkdown(chan.name)), 'channels', null)}\n` :
			'Multiple channels found. Please be more specific.';
	}

	parse(val, msg, arg) {
		const matches = val.match(/^(?:<#)?([0-9]+)>?$/);
		if(matches) return msg.guild.channels.get(matches[1]) || null;
		const search = val.toLowerCase();
		const channels = msg.guild.channels.filter(filterInexact(search, arg.channelType));
		if(channels.size === 0) return null;
		if(channels.size === 1) return channels.first();
		const exactChannels = channels.filter(filterExact(search, arg.channelType));
		if(exactChannels.size === 1) return exactChannels.first();
		return null;
	}
}

function filterExact(search, type) {
	return thing => thing.name.toLowerCase() === search && (type ? thing.type === type : true);
}

function filterInexact(search, type) {
	return thing => thing.name.toLowerCase().includes(search) && (type ? thing.type === type : true);
}

module.exports = ChannelArgumentType;
