const ArgumentType = require('./base');
const RegExpMessage = require('../regexp/message').RegExpSingle;
const RegExpSnowflake = require('../regexp/snowflake').RegExpSingle;

class MessageArgumentType extends ArgumentType {
	constructor(client) {
		super(client, 'message');
	}

	async validate(val, msg) {
		// Snowflake format
		if(RegExpSnowflake.simple.test(val)) {
			return Boolean(await msg.channel.messages.fetch(val).catch(() => null));
		}
		// Channel/Snowflake format
		{
			const matches = RegExpMessage.channelMessage.exec(val);
			if(matches) {
				const [, channelid, messageid] = matches;
				const channel = msg.channel.guild.channels.cache.get(channelid);
				if(channel === undefined) return false;
				if(!['text', 'news'].includes(channel.type)) return false;
				return Boolean(await channel.messages.fetch(messageid).catch(() => null));
			}
		}
		// Discord's guild message link format
		{
			const matches = RegExpMessage.linkGuild.exec(val);
			if(matches) {
				const [, guildid, channelid, messageid] = matches;
				if(msg.channel.type === 'dm') return 'Нельзя использовать ссылку на сообщения сервера из-под лс.';
				if(msg.channel.guild.id !== guildid) return 'Нельзя использовать ссылку на другие сервера.';
				const channel = msg.channel.guild.channels.cache.get(channelid);
				if(channel === undefined) return false;
				if(!['text', 'news'].includes(channel.type)) return false;
				return Boolean(await channel.messages.fetch(messageid).catch(() => null));
			}
		}
		// Discord's dm message link format
		{
			const matches = RegExpMessage.linkDM.exec(val);
			if(matches) {
				const [, userid, messageid] = matches;
				if(msg.channel.type !== 'dm') return 'Нельзя использовать ссылку на сообщения в лс из-под сервера.';
				if(this.client.user.id !== userid) return 'Нельзя использовать ссылку на сообщение другого пользователя кроме бота.';
				return Boolean(await msg.channel.messages.fetch(messageid).catch(() => null));
			}
		}
		return false;
	}

	parse(val, msg) {
		// Snowflake format
		if(RegExpSnowflake.test(val)) {
			return msg.channel.messages.cache.get(val);
		}
		// Channel/Snowflake format
		{
			const matches = RegExpMessage.channelMessage.exec(val);
			if(matches) {
				const [, channelid, messageid] = matches;
				return msg.channel.guild.channels.get(channelid).messages.cache.get(messageid);
			}
		}
		// Discord's guild message link format (https://discord.com/<guild id>/<channnel id>/<message id>)
		{
			const matches = RegExpMessage.linkGuild.exec(val);
			if(matches) {
				const [,, channelid, messageid] = matches;
				return msg.channel.guild.channels.get(channelid).messages.cache.get(messageid);
			}
		}
		// Discord's dm message link format (https://discord.com/@me/<user id>/<message id>)
		{
			const matches = RegExpMessage.linkDM.exec(val);
			if(matches) {
				const [,, messageid] = matches;
				return msg.channel.messages.cache.get(messageid);
			}
		}
		throw new SyntaxError();
	}
}

module.exports = MessageArgumentType;
