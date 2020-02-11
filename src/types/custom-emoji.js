const ArgumentType = require('./base');
const { disambiguation } = require('../util');
const { escapeMarkdown } = require('discord.js');

class CustomEmojiArgumentType extends ArgumentType {
	constructor(client) {
		super(client, 'custom-emoji');
	}

	validate(value, msg) {
		const matches = value.match(/^(?:<a?:([a-zA-Z0-9_]+):)?([0-9]+)>?$/);
		if(matches && msg.client.emojis.cache.has(matches[2])) return true;
		if(!msg.guild) return false;
		const search = value.toLowerCase();
		let emojis = msg.guild.emojis.cache.filter(nameFilterInexact(search));
		if(!emojis.size) return false;
		if(emojis.size === 1) return true;
		const exactEmojis = emojis.filter(nameFilterExact(search));
		if(exactEmojis.size === 1) return true;
		if(exactEmojis.size > 0) emojis = exactEmojis;
		return emojis.size <= 15 ?
			`${disambiguation(emojis.map(emoji => escapeMarkdown(emoji.name)), 'emojis', null)}\n` :
			'Multiple emojis found. Please be more specific.';
	}

	parse(value, msg) {
		const matches = value.match(/^(?:<a?:([a-zA-Z0-9_]+):)?([0-9]+)>?$/);
		if(matches) return msg.client.emojis.cache.get(matches[2]) || null;
		const search = value.toLowerCase();
		const emojis = msg.guild.emojis.cache.filter(nameFilterInexact(search));
		if(!emojis.size) return null;
		if(emojis.size === 1) return emojis.first();
		const exactEmojis = emojis.filter(nameFilterExact(search));
		if(exactEmojis.size === 1) return exactEmojis.first();
		return null;
	}
}

function nameFilterExact(search) {
	return emoji => emoji.name.toLowerCase() === search;
}

function nameFilterInexact(search) {
	return emoji => emoji.name.toLowerCase().includes(search);
}

module.exports = CustomEmojiArgumentType;
