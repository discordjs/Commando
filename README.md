# Commando
[![Discord](https://discordapp.com/api/guilds/222078108977594368/embed.png)](https://discord.gg/bRCvFy9)
[![Downloads](https://img.shields.io/npm/dt/discord.js-commando.svg)](https://www.npmjs.com/package/discord.js-commando)
[![Version](https://img.shields.io/npm/v/discord.js-commando.svg)](https://www.npmjs.com/package/discord.js-commando)
[![Dependency status](https://david-dm.org/discordjs/Commando.svg)](https://david-dm.org/discordjs/Commando)
[![Build status](https://github.com/discordjs/Commando/workflows/Testing/badge.svg)](https://github.com/discordjs/Commando/actions?query=workflow%3ATesting)

## About
This is a fork of the discord.js commando framework (https://github.com/discordjs/Commando) that enables other bots and webhooks to use your commands.

## Use
Everything from the original commando framework applies, for that refer to the [docs](https://discord.js.org/#/docs/commando) and [guide](https://discordjs.guide/commando/).

In this fork you can include options when creating a command to accept commands from other bots and webhooks like such:
```
class MyCommand extends Command {
    constructor(client) {
        super(client, {
            ignoreBots: false,
	    allowedWebhooks: [<my webhook id>, <my webhook name>] // or
	    allowedWebhooks: 'all'
        });
    }
}
```
**Parameters**

| Name | Description | Type | Default Value |
|------|-------------|------|---------------|
| ignoreBots | Wether this command should ignore calls from other bots. | Boolean | true | 
| allowedWebhooks | What webhooks are allowed to use this command. | Array \<String id or name\> or 'all' | [] |


## Installation
**Node 12.0.0 or newer is required.**  
`npm install discord.js`
`npm install https://github.com/argArthur/Commando.git`

## Documentation
Original discord.js and commando framework documentations here:
[View the docs here.](https://discord.js.org/#/docs/commando)  
See the [discord.js documentation](https://discord.js.org/#/docs) as well.
