exports.RegExp = {
	channelMessage: () => /([0-9]{7,})\/([0-9]{7,})/,
	linkGuild: () => /(?:https?:\/\/)?discord.com\/channels\/([0-9]{7,})\/([0-9]{7,})\/([0-9]{7,})\/?/,
	linkDM: () => /(?:https?:\/\/)?discord.com\/channels\/@me\/([0-9]{7,})\/([0-9]{7,})\/?/,
	link: () => /(?:https?:\/\/)?discord.com\/channels\/([0-9]{7,}|@me)\/([0-9]{7,})\/([0-9]{7,})\/?/
};

exports.RegExpSingle = {
	channelMessage: () => /^([0-9]{7,})\/([0-9]{7,})$/,
	linkGuild: () => /^(?:https?:\/\/)?discord.com\/channels\/([0-9]{7,})\/([0-9]{7,})\/([0-9]{7,})\/?$/,
	linkDM: () => /^(?:https?:\/\/)?discord.com\/channels\/@me\/([0-9]{7,})\/([0-9]{7,})\/?$/,
	link: () => /^(?:https?:\/\/)?discord.com\/channels\/([0-9]{7,}|@me)\/([0-9]{7,})\/([0-9]{7,})\/?$/
};
