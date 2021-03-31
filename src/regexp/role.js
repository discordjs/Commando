exports.RegExp = {
	Ping: () => /<@&([0-9]{7,})>/
};

exports.RegExpSingle = {
	Ping: () => /^<@&([0-9]{7,})>$/
};
