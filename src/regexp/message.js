exports.RegExp = {
	channelMessage: () => /([0-9]{7,})\/([0-9]{7,})/,
	linkGuild: () => /(?:https?:\/\/)?(?:ptb\.|canary\.)?discord\.com\/channels\/([0-9]{7,})\/([0-9]{7,})\/([0-9]{7,})\/?/,
	linkDM: () => /(?:https?:\/\/)?(?:ptb\.|canary\.)?discord\.com\/channels\/@me\/([0-9]{7,})\/([0-9]{7,})\/?/,
	link: () => /(?:https?:\/\/)?(?:ptb\.|canary\.)?discord\.com\/channels\/([0-9]{7,}|@me)\/([0-9]{7,})\/([0-9]{7,})\/?/
};

exports.RegExpSingle = {
	channelMessage: () => /^([0-9]{7,})\/([0-9]{7,})$/,
	linkGuild: () => /^(?:https?:\/\/)?(?:ptb\.|canary\.)?discord\.com\/channels\/([0-9]{7,})\/([0-9]{7,})\/([0-9]{7,})\/?$/,
	linkDM: () => /^(?:https?:\/\/)?(?:ptb\.|canary\.)?discord\.com\/channels\/@me\/([0-9]{7,})\/([0-9]{7,})\/?$/,
	link: () => /^(?:https?:\/\/)?(?:ptb\.|canary\.)?discord\.com\/channels\/([0-9]{7,}|@me)\/([0-9]{7,})\/([0-9]{7,})\/?$/
};
