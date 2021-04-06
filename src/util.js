const Discord = require('discord.js');

// This returns Object.prototype in order to return a valid object
// without creating a new one each time this is called just to discard it the moment after.
const isConstructorProxyHandler = { construct() { return Object.prototype; } };

function escapeRegex(str) {
	return str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
}

function disambiguation(items, locale, label, property = 'name') {
	const itemList = items.map(item => `"${(property ? item[property] : item).replace(/ /g, '\xa0')}"`).join(',   ');
	return locale.util.disambiguation({ label, itemList });
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

const permissions = makeCallback(locale => locale.permissions);

/**
 *
 * @param {string} str String to apply extensions to via {{name}}
 * @param {Object} entries Object to get the extension values from
 * @returns {string}
 */
function applyExtensions(str, entries = {}) {
	for(const key in entries) {
		const re = new RegExp(`{{${key}}}`, 'g');
		let value = entries[key];
		if(typeof value === 'function') value = value();
		str = str.replace(re, value);
	}

	return str;
}

/**
 *
 * @param {string} str String to apply extensions to via {{name}}
 * @param {Object} entries Object to get the extension values from
 * @returns {string}
 */
// function applyExtensions(str, entries = {}) {
// 	const regex = /{{([^s]+?)}}/gi;

// 	// eslint-disable-next-line no-constant-condition
// 	while(true) {
// 		const match = regex.exec(str);
// 		if(match === null) break;
// 		const value = entries[match[1]];
// 		if(value === undefined) continue;
// 		const strvalue = String(value);
// 		const re = new RegExp(match[0], 'g');
// 		str = str.replace(re, strvalue);
// 		regex.lastIndex = regex.lastIndex - match[0].length + strvalue.length;
// 	}

// 	return str;
// }

/**
 *
 * @param {string} str String to apply extensions to via {{name}}
 * @returns {(entries: Object) => string}
 */
function applyExtensionsLater(str) {
	/**
	 *
	 * @param {Object} entries
	 * @returns {string}
	 */
	return function(entries = {}) {
		return applyExtensions(str, entries);
	};
}

function execCallback(val, ...args) {
	return (typeof val === 'function') ? val(...args) : val;
}

function makeCallback(func) {
	return function(...args) {
		return func(...args);
	};
}

const Collection = {
	fromObject: function(...collections) {
		return new Discord.Collection().concat(...collections.map(col => Object.entries(col)));
	}
};

module.exports = {
	escapeRegex,
	disambiguation,
	paginate,
	permissions,
	isConstructor,
	applyExtensions,
	applyExtensionsLater,
	execCallback,
	makeCallback,
	Collection
};
