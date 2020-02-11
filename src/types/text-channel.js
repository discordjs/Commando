const ArgumentType = require('./base');
const { disambiguation } = require('../util');
const { escapeMarkdown } = require('discord.js');

class TextChannelArgumentType extends ArgumentType {
	constructor(client) {
		super(client, 'text-channel');
	}

	validate(val, msg, arg) {
		const matches = val.match(/^(?:<#)?([0-9]+)>?$/);
		if(matches) {
			try {
				const channel = msg.client.channels.resolve(matches[1]);
				if(!channel || channel.type !== 'text') return false;
				if(arg.oneOf && !arg.oneOf.includes(channel.id)) return false;
				return true;
			} catch(err) {
				return false;
			}
		}
		if(!msg.guild) return false;
		const search = val.toLowerCase();
		let channels = msg.guild.channels.cache.filter(channelFilterInexact(search));
		if(channels.size === 0) return false;
		if(channels.size === 1) {
			if(arg.oneOf && !arg.oneOf.includes(channels.first().id)) return false;
			return true;
		}
		const exactChannels = channels.filter(channelFilterExact(search));
		if(exactChannels.size === 1) {
			if(arg.oneOf && !arg.oneOf.includes(exactChannels.first().id)) return false;
			return true;
		}
		if(exactChannels.size > 0) channels = exactChannels;
		return channels.size <= 15 ?
			`${disambiguation(
				channels.map(chan => escapeMarkdown(chan.name)), 'text channels', null
			)}\n` :
			'Multiple text channels found. Please be more specific.';
	}

	parse(val, msg) {
		const matches = val.match(/^(?:<#)?([0-9]+)>?$/);
		if(matches) return msg.client.channels.resolve(matches[1]) || null;
		if(!msg.guild) return null;
		const search = val.toLowerCase();
		const channels = msg.guild.channels.cache.filter(channelFilterInexact(search));
		if(channels.size === 0) return null;
		if(channels.size === 1) return channels.first();
		const exactChannels = channels.filter(channelFilterExact(search));
		if(exactChannels.size === 1) return exactChannels.first();
		return null;
	}
}

function channelFilterExact(search) {
	return chan => chan.type === 'text' && chan.name.toLowerCase() === search;
}

function channelFilterInexact(search) {
	return chan => chan.type === 'text' && chan.name.toLowerCase().includes(search);
}

module.exports = TextChannelArgumentType;
