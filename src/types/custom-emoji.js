const ArgumentType = require('./base');
const { disambiguation } = require('../util');

class CustomEmojiArgumentType extends ArgumentType {
	constructor(client) {
		super(client, 'custom-emoji');
	}

	validate(value, msg) {
		const matches = value.match(/^(?:(?:<a?:([^\s]+):([0-9]+)>)|(?::([^\s]+):)|([0-9]+))$/);
		let search;
		if(matches) {
			if(msg.client.emojis.cache.has(matches[2])) return true;
			if(msg.client.emojis.cache.has(matches[4])) return true;
			search = matches[1] || matches[3];
		}
		search = (search || value).toLowerCase();
		let emojis = msg.client.emojis.cache.filter(nameFilterInexact(search));
		if(!emojis.size) return false;
		if(emojis.size === 1) return true;
		const exactEmojis = emojis.filter(nameFilterExact(search));
		if(exactEmojis.size === 1) return true;
		if(exactEmojis.size > 0) emojis = exactEmojis;
		return emojis.size <= 15 ?
			`${disambiguation(emojis.map(emoji => emoji.toString()),
				msg.locale,
				msg.locale.types.customEmoji.disambiguation,
				null
				)}\n` :
			msg.locale.types.customEmoji.multipleFound;
	}

	parse(value, msg) {
		const matches = value.match(/^(?:(?:<a?:([^\s]+):([0-9]+)>)|(?::([^\s]+):)|([0-9]+))$/);
		let search;
		if(matches) {
			if(msg.client.emojis.cache.has(matches[2])) return msg.client.emojis.cache.get(matches[2]);
			if(msg.client.emojis.cache.has(matches[4])) return msg.client.emojis.cache.get(matches[4]);
			search = matches[1] || matches[3];
		}
		search = (search || value).toLowerCase();
		const emojis = msg.client.emojis.cache.filter(nameFilterInexact(search));
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
