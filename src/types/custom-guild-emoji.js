const ArgumentType = require('./base');
const { disambiguation } = require('../util');
const { escapeMarkdown } = require('discord.js');

class CustomGuildEmojiArgumentType extends ArgumentType {
	constructor(client) {
		super(client, 'custom-guild-emoji');
	}

	validate(value, msg) {
		if(!msg.guild) return false;
		const matches = value.match(/^(?:(?:<a?:([^\s]+):([0-9]+)>)|(?::([^\s]+):)|([0-9]+))$/);
		if(matches) {
			if(msg.guild.emojis.cache.has(matches[2])) return true;
			if(msg.guild.emojis.cache.has(matches[4])) return true;
		}
		const search = (matches[1] || matches[3] || value).toLowerCase();
		let emojis = msg.guild.emojis.cache.filter(nameFilterInexact(search));
		if(!emojis.size) return false;
		if(emojis.size === 1) return true;
		const exactEmojis = emojis.filter(nameFilterExact(search));
		if(exactEmojis.size === 1) return true;
		if(exactEmojis.size > 0) emojis = exactEmojis;
		return emojis.size <= 15 ?
			`${disambiguation(emojis.map(emoji => escapeMarkdown(emoji.name)), msg.locale, msg.locale.types.customEmoji.disambiguation, null)}\n` :
			msg.locale.types.customEmoji.multipleFound;
	}

	parse(value, msg) {
		const matches = value.match(/^(?:(?:<a?:([^\s]+):([0-9]+)>)|(?::([^\s]+):)|([0-9]+))$/);
		if(matches) {
			if(msg.guild.emojis.cache.has(matches[2])) return msg.guild.emojis.cache.get(matches[2]);
			if(msg.guild.emojis.cache.has(matches[4])) return msg.guild.emojis.cache.get(matches[4]);
		}
		const search = (matches[1] || matches[3] || value).toLowerCase();
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

module.exports = CustomGuildEmojiArgumentType;
