const ArgumentType = require('./base');
const { disambiguation } = require('../util');
const { escapeMarkdown } = require('discord.js');
const RegExpChannel = require('../regexp/channel').RegExpSingle;
const RegExpSnowflake = require('../regexp/snowflake').RegExpSingle;

module.exports = function makeTypedChannelClass(channelTypeName, validateChannelType, guildOnly = true) {
	function validateChannelId(msg, arg, channelid) {
		if(arg.oneOf && !arg.oneOf.includes(channelid)) return false;
		const channel = msg.guild.channels.cache.get(channelid);
		return channel && validateChannelType(channel);
	}

	function channelFilterExact(search) {
		return chan => validateChannelType(chan) && chan.name.toLowerCase() === search;
	}

	function channelFilterInexact(search) {
		return chan => validateChannelType(chan) && chan.name.toLowerCase().includes(search);
	}

	return class TypedChannelArgumentType extends ArgumentType {
		constructor(client) {
			super(client, `${channelTypeName}-channel`);
		}

		validate(val, msg, arg) {
			if(guildOnly && !msg.guild) throw new TypeError(`Type ${this.id} not allowed in a dm`);

			// Snowflake format
			if(RegExpSnowflake.simple.test(val)) {
				return validateChannelId(msg, arg, val);
			}
			// Ping format
			{
				const matches = RegExpChannel.ping.exec(val);
				if(matches) {
					const [, channelid] = matches;
					return validateChannelId(msg, arg, channelid);
				}
			}
			// Discord link format
			{
				const matches = val.match(RegExpChannel.linkGuild);
				if(matches) {
					const [, guildid, channelid] = matches;
					if(guildid !== msg.guild.id) return false;
					return validateChannelId(msg, arg, channelid);
				}
			}
			// Inexact name search
			const search = val.toLowerCase();
			let channels = msg.guild.channels.cache.filter(channelFilterInexact(search));
			if(channels.size === 0) return false;
			if(channels.size === 1) {
				if(arg.oneOf && !arg.oneOf.includes(channels.first().id)) return false;
				return true;
			}
			// Exact name search
			const exactChannels = channels.filter(channelFilterExact(search));
			if(exactChannels.size === 1) {
				if(arg.oneOf && !arg.oneOf.includes(exactChannels.first().id)) return false;
				return true;
			}
			if(exactChannels.size > 0) channels = exactChannels;

			return channels.size <= 15 ?
				`${disambiguation(channels.map(chan => escapeMarkdown(chan.name)),
					msg.locale,
					msg.locale.types[channelTypeName].disambiguation,
					null
					)}\n` :
				msg.locale.types[channelTypeName].multipleFound;
		}

		parse(val, msg) {
			// Snowflake format
			if(RegExpSnowflake.simple.test(val)) {
				return msg.guild.channels.cache.get(val);
			}
			// Ping format
			{
				const matches = RegExpChannel.ping.exec(val);
				if(matches) {
					const [, channelid] = matches;
					return msg.guild.channels.cache.get(channelid);
				}
			}
			// Discord link format
			{
				const matches = val.match(RegExpChannel.linkGuild);
				if(matches) {
					const [,, channelid] = matches;
					return msg.guild.channels.cache.get(channelid);
				}
			}
			// Inexact name search
			const search = val.toLowerCase();
			const channels = msg.guild.channels.cache.filter(channelFilterInexact(search));
			if(channels.size === 0) return null;
			if(channels.size === 1) return channels.first();
			// Exact name search
			const exactChannels = channels.filter(channelFilterExact(search));
			if(exactChannels.size === 1) return exactChannels.first();
			return null;
		}
	};
};
