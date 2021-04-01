exports.RegExp = {
	ping: () => /<@&([0-9]{7,})>/
};

exports.RegExpSingle = {
	ping: () => /^<@&([0-9]{7,})>$/
};
