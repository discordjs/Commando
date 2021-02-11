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
 * @param {Object} obj Object to traverse
 * @param {any} val Value to set
 * @param {any} key1 First key
 * @param  {...any} keys Other keys
 */
function setValRecursive(obj, val, key1, ...keys) {
	if(keys.length === 0) {
		obj[key1] = val;
		return;
	}

	if(obj[key1] === undefined) obj[key1] = {};

	setValRecursive(obj[key1], val, ...keys);
}

/**
 *
 * @param {Object} obj Object to traverse
 * @param {string} key1 First key
 * @param {...string} keys Other keys
 * @returns {any}
 */
function getValRecursive(obj, key1, ...keys) {
	if(keys.length === 0) {
		return obj[key1];
	}

	if(obj[key1] === undefined) return undefined;

	return getValRecursive(obj[key1], ...keys);
}

/**
 * Traverses the object.
 * If function returns a non-undefined value sets its value to the result of the function
 * @param {Object} obj Object to traverse
 * @param {(key:any, value:any) => any | undefined} func Function to apply
 */
function forEach(obj, func) {
	for(const key in obj) {
		if(Object.prototype.hasOwnProperty.call(obj, key)) {
			const result = func(key, obj[key]);
			if(result !== undefined) {
				obj[key] = result;
			}
		}
	}
}

/**
 *
 * @param {Object} obj Object to traverse
 * @param {(key:any, value:any) => any} func Function to apply
 * @param {number} depth Depth of traversal
 */
function forEachVarRecursiveDepth(obj, func, depth = 0) {
	if(depth <= 0) {
		forEach(obj, func);
	} else {
		for(const key in obj) {
			if(typeof obj[key] === 'object') {
				forEachVarRecursiveDepth(obj[key], func, depth - 1);
			}
		}
	}
}

function isObject(obj) {
	return obj && typeof obj === 'object';
}

// If arrays should be overritten entirely
// function isObject(obj) {
// 	return (obj && typeof obj === 'object' && !Array.isArray(obj));
// }

function assignDeep(target, ...sources) {
	if(isObject(target)) {
		sources.forEach(source => {
			if(isObject(source)) {
				Object.keys(source).forEach(key => {
					if(isObject(source[key])) {
						if(!(key in target)) {
							Object.assign(target, { [key]: source[key] });
						} else {
							assignDeep(target[key], source[key]);
						}
					} else {
						Object.assign(target, { [key]: source[key] });
					}
				});
			}
		});
	}

	return target;
}

function assignDeepCheck(target, ...sources) {
	if(isObject(target)) {
		sources.forEach(source => {
			if(isObject(source)) {
				Object.keys(source).forEach(key => {
					if(isObject(source[key])) {
						if(!(key in target)) {
							if(target[key] !== undefined && !isObject(target[key])) throw new Error('Source value is object when target value is not');
							Object.assign(target, { [key]: source[key] });
						} else {
							assignDeepCheck(target[key], source[key]);
						}
					} else {
						if(target[key] !== undefined && isObject(target[key])) throw new Error('Source value is not object when target value is');
						Object.assign(target, { [key]: source[key] });
					}
				});
			}
		});
	}

	return target;
}

function merge(...sources) {
	return Object.assign({}, ...sources);
}

function mergeDeep(...sources) {
	const output = {};
	sources.forEach(source => {
		if(isObject(source)) {
			Object.keys(source).forEach(key => {
				if(isObject(source[key])) {
					if(!(key in output)) {
						Object.assign(output, { [key]: source[key] });
					} else {
						output[key] = mergeDeep(output[key], source[key]);
					}
				} else {
					Object.assign(output, { [key]: source[key] });
				}
			});
		}
	});

	return output;
}

function mergeDeepCheck(...sources) {
	const output = {};
	sources.forEach(source => {
		if(isObject(source)) {
			Object.keys(source).forEach(key => {
				if(isObject(source[key])) {
					if(!(key in output)) {
						if(!isObject(output[key])) throw new Error('Source value is object when target value is not');
						Object.assign(output, { [key]: source[key] });
					} else {
						output[key] = mergeDeepCheck(output[key], source[key]);
					}
				} else {
					if(isObject(output[key])) throw new Error('Source value is not object when target value is');
					Object.assign(output, { [key]: source[key] });
				}
			});
		}
	});

	return output;
}

function flattenObject(target) {
	const result = {};

	for(const key in target) {
		if(!Object.prototype.hasOwnProperty.call(target, key)) continue;

		if(typeof target[key] === 'object' && target[key] !== null) {
			const flatObject = flattenObject(target[key]);
			for(const fkey in flatObject) {
				if(!Object.prototype.hasOwnProperty.call(flatObject, fkey)) continue;

				result[`${key}.${fkey}`] = flatObject[fkey];
			}
		} else {
			result[key] = target[key];
		}
	}

	return result;
}

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
	setValRecursive,
	getValRecursive,
	forEach,
	forEachVarRecursiveDepth,
	assignDeep,
	assignDeepCheck,
	merge,
	mergeDeep,
	mergeDeepCheck,
	flattenObject,
	applyExtensions,
	applyExtensionsLater,
	execCallback,
	makeCallback,
	Collection
};
