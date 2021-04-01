exports.RegExp = {
	ping: () => /<#([0-9]{7,})>/,
	linkGuild: () => /(?:https?:\/\/)?(?:ptb\.|canary\.)?discord\.com\/channels\/([0-9]{7,})\/([0-9]{7,})\/?/,
	linkDM: () => /(?:https?:\/\/)?(?:ptb\.|canary\.)?discord\.com\/channels\/@me\/([0-9]{7,})\/?/,
	link: () => /(?:https?:\/\/)?(?:ptb\.|canary\.)?discord\.com\/channels\/([0-9]{7,}|@me)\/([0-9]{7,})\/?/,
	linkChannel: channelid => new RegExp(`(?:https?:\\/\\/)?discord.com\\/channels\\/(${channelid})\\/([0-9]{7,})\\/?`)
};

exports.RegExpSingle = {
	ping: () => /^<#([0-9]{7,})>$/,
	linkGuild: () => /^(?:https?:\/\/)?(?:ptb\.|canary\.)?discord\.com\/channels\/([0-9]{7,})\/([0-9]{7,})\/?$/,
	linkDM: () => /^(?:https?:\/\/)?(?:ptb\.|canary\.)?discord\.com\/channels\/@me\/([0-9]{7,})\/?$/,
	link: () => /^(?:https?:\/\/)?(?:ptb\.|canary\.)?discord\.com\/channels\/([0-9]{7,}|@me)\/([0-9]{7,})\/?$/
};
