// This returns Object.prototype in order to return a valid object
// without creating a new one each time this is called just to discard it the moment after.
const isConstructorProxyHandler = { construct() { return Object.prototype; } };

function escapeRegex(str) {
	return str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
}

function disambiguation(items, property = 'name') {
	const itemList = items.map(item => `"${(property ? item[property] : item).replace(/ /g, '\xa0')}"`)
		.join(',   ');
	return itemList;
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
	ADMINISTRATOR: 'permission.administrator',
	VIEW_AUDIT_LOG: 'permission.view_audit_log',
	MANAGE_GUILD: 'permission.manage_guild',
	MANAGE_ROLES: 'permission.manage_roles',
	MANAGE_CHANNELS: 'permission.manage_channels',
	KICK_MEMBERS: 'permission.kick_members',
	BAN_MEMBERS: 'permission.ban_members',
	CREATE_INSTANT_INVITE: 'permission.create_instant_invite',
	CHANGE_NICKNAME: 'permission.change_nickname',
	MANAGE_NICKNAMES: 'permission.manage_nicknames',
	MANAGE_EMOJIS: 'permission.manage_emojis',
	MANAGE_WEBHOOKS: 'permission.manage_webhooks',
	VIEW_CHANNEL: 'permission.view_channel',
	SEND_MESSAGES: 'permission.send_messages',
	SEND_TTS_MESSAGES: 'permission.send_tts_messages',
	MANAGE_MESSAGES: 'permission.manage_messages',
	EMBED_LINKS: 'permission.embed_links',
	ATTACH_FILES: 'permission.attach_files',
	READ_MESSAGE_HISTORY: 'permission.read_message_history',
	MENTION_EVERYONE: 'permission.mention_everyone',
	USE_EXTERNAL_EMOJIS: 'permission.use_external_emojis',
	ADD_REACTIONS: 'permission.add_reactions',
	CONNECT: 'permission.connect',
	SPEAK: 'permission.speak',
	MUTE_MEMBERS: 'permission.mute_members',
	DEAFEN_MEMBERS: 'permission.deafen_members',
	MOVE_MEMBERS: 'permission.move_members',
	USE_VAD: 'permission.use_vad'
};

module.exports = {
	escapeRegex,
	disambiguation,
	paginate,
	permissions,
	isConstructor
};
