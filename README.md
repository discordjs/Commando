# discord.js Commando
[![Discord](https://discordapp.com/api/guilds/222078108977594368/embed.png)](https://discord.gg/bRCvFy9)
[![Downloads](https://img.shields.io/npm/dt/discord.js-commando.svg)](https://www.npmjs.com/package/discord.js-commando)
[![Version](https://img.shields.io/npm/v/discord.js-commando.svg)](https://www.npmjs.com/package/discord.js-commando)
[![Dependency status](https://david-dm.org/Gawdl3y/discord.js-commando.svg)](https://david-dm.org/Gawdl3y/discord.js-commando)
[![License](https://img.shields.io/npm/l/discord.js-commando.svg)](LICENSE)

This is the __**WIP**__ official command framework for discord.js' indev branch.
It makes full use of ES2017's `async`/`await`.

## Features
- Plain names and aliases
- Robust argument parsing (with "quoted strings" support)
- Regular expression triggers
- Multiple responses
- Command editing
- Command reloading
- Command throttling/cooldowns
- Automatic command argument prompting

## Installation
**Node 7.0.0 or newer is required.** Use a nightly or beta version.  
`npm install --save discord.js-commando`

When running a bot using Commando, make sure to run Node with the `--harmony` flag. Examples:
- `node --harmony somebot.js`
- `pm2 start somebot.js --node-flags='--harmony'`

## Documentation (WIP)
[View the docs here.](https://gawdl3y.github.io/discord.js-commando/0.2.0/)  
See the [discord.js documentation](http://hydrabolt.github.io/discord.js/#!/docs/tag/indev/file/general/Welcome) as well.
