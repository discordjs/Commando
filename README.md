# Commando
[![Discord](https://discordapp.com/api/guilds/222078108977594368/embed.png)](https://discord.gg/bRCvFy9)
[![Downloads](https://img.shields.io/npm/dt/discord.js-commando.svg)](https://www.npmjs.com/package/discord.js-commando)
[![Version](https://img.shields.io/npm/v/discord.js-commando.svg)](https://www.npmjs.com/package/discord.js-commando)
[![Dependency status](https://david-dm.org/Gawdl3y/discord.js-commando.svg)](https://david-dm.org/Gawdl3y/discord.js-commando)
[![Build status](https://travis-ci.org/hydrabolt/discord.js.svg)](https://travis-ci.org/hydrabolt/discord.js)

## About
Commando is the official command framework for [discord.js](https://github.com/hydrabolt/discord.js).
It is flexible, fully object-oriented, easy to use, and makes it trivial to create your own powerful commands.
Additionally, it makes full use of ES2017's `async`/`await` functionality for clear, concise code that is simple to write and easy to comprehend.

## Features
- Plain command names and aliases
- Regular expression triggers
- Robust parsing of arguments (with "quoted strings" support)
- Sophisticated argument system (optional)
	* Automatic prompting for arguments that aren't provided
	* Type system with rules, automatic validation, and parsing to usable values
		- Basic types (string, integer, float, boolean)
		- Discord objects (user, member, role, channel, message)
		- User-defined custom types
	* Automatic re-prompting of invalid arguments
	* Optional arguments with default values
	* Infinite arguments (arguments that accept as many values as provided)
- Multiple responses to commands
- Command editing (user edits their message that triggered the command, and the bot's response updates with it)
- Command reloading, as well as loading/unloading
- Command throttling/cooldowns

## Installation
**Node 7.0.0 or newer is required.**  
`npm install discord.js-commando --save`

When running a bot using Commando, make sure to run Node with the `--harmony` flag. Examples:
- `node --harmony somebot.js`
- `pm2 start somebot.js --node-args '--harmony'`

No version of Node older than 7.0.0 supports `async`/`await`, although you can compile it down to ES6 or ES5 with the
[fast-async](https://www.npmjs.com/package/fast-async) Babel plugin. You must do this for your code and the framework's manually if you wish
to use Commando on older Node versions.

## Documentation
[View the docs here.](https://discord.js.org/#/docs/commando)  
See the [discord.js documentation](https://discord.js.org/#/docs) as well.
