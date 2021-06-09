// This returns Object.prototype in order to return a valid object
// without creating a new one each time this is called just to discard it the moment after.
const isConstructorProxyHandler = { construct() { return Object.prototype; } };

function escapeRegex(str) {
	return str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
}

function disambiguation(items, label, property = 'name') {
	const itemList = items.map(item => `"${(property ? item[property] : item).replace(/ /g, '\xa0')}"`).join(',   ');
	return `Multiple ${label} found, please be more specific: ${itemList}`;
}

function isConstructor(func, _class) {
	try {
		// eslint-disable-next-line no-new
		new new Proxy(func, isConstructorProxyHandler)();
		if(!_class) return true;
		return func.prototype instanceof _class;
	} catch(err) {
		return false;
	}
}

function paginate(items, page = 1, pageLength = 10) {
	const maxPage = Math.ceil(items.length / pageLength);
	if(page < 1) page = 1;
	if(page > maxPage) page = maxPage;
	const startIndex = (page - 1) * pageLength;
	return {
		items: items.length > pageLength ? items.slice(startIndex, startIndex + pageLength) : items,
		page,
		maxPage,
		pageLength
	};
}

const permissions = {
	ADD_REACTIONS: 'Add Reactions',
	ADMINISTRATOR: 'Administrator',
	ATTACH_FILES: 'Attach Files',
	BAN_MEMBERS: 'Ban Members',
	CREATE_INSTANT_INVITE: 'Create Instant Invite',
	CHANGE_NICKNAME: 'Change Nickname',
	CONNECT: 'Connect',
	DEAFEN_MEMBERS: 'Deafen Members',
	EMBED_LINKS: 'Embed Links',
	KICK_MEMBERS: 'Kick Members',
	MANAGE_CHANNELS: 'Manage Channel',
	MANAGE_EMOJIS: 'Manage Emojis',
	MANAGE_GUILD: 'Manage Guild',
	MANAGE_MESSAGES: 'Manage Messages',
	MANAGE_NICKNAMES: 'Manage Nicknames',
	MANAGE_ROLES: 'Manage Roles',
	MANAGE_WEBHOOKS: 'Manage Webhooks',
	MENTION_EVERYONE: 'Mention @everyone, @here and All Roles',
	MOVE_MEMBERS: 'Move Members',
	MUTE_MEMBERS: 'Mute Members',
	PRIORITY_SPEAKER: 'Priority Speaker',
	READ_MESSAGE_HISTORY: 'Read Message History',
	REQUREST_TO_SPEAK: 'Request to Speak',
	SEND_MESSAGES: 'Send Messages',
	SEND_TTS_MESSAGES: 'Send TTS Messages',
	SPEAK: 'Speak',
	STREAM: 'Stream',
	USE_APPLICATION_COMMANDS: 'Use Slash Commands',
	USE_EXTERNAL_EMOJIS: 'Use External Emojis',
	USE_VAD: 'Use Voice Activity',
	VIEW_AUDIT_LOG: 'View Audit Log',
    	VIEW_CHANNEL: 'View Channel',
    	VIEW_GUILD_INSIGHTS: 'View Guild Insights'
};

module.exports = {
	escapeRegex,
	disambiguation,
	paginate,
	permissions,
	isConstructor
};
