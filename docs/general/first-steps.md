# First steps
The first thing you need to do to use Commando is ensure you're creating a [CommandoClient](https://discord.js.org/#/docs/commando/master/class/CommandoClient)
rather than the regular discord.js [Client](https://discord.js.org/#/docs/main/master/class/Client).
A CommandoClient is just an extension of the base Client, so all options, properties, methods, and events on Client are also on CommandoClient.

You should provide the `owner` option to the constructor, which is an option specific to CommandoClient, and should be set to the ID of your Discord user.
This will give you full access to control everything about the bot, in any guild.

```javascript
const Commando = require('discord.js-commando');

const client = new Commando.Client({
	owner: '1234567890'
});
```

Then, to make use of the command framework (what else would you be doing with Commando?), you need to register your command groups, commands, and argument types,
in addition to any of the built-in stuff that you want make use of. This will look something like this:

```javascript
const path = require('path');

client.registry
	// Registers your custom command groups
	.registerGroups([
		['fun', 'Fun commands'],
		['some', 'Some group'],
		['other', 'Some other group']
	])

	// Registers all built-in groups, commands, and argument types
	.registerDefaults()

	// Registers all of your commands in the ./commands/ directory
	.registerCommandsIn(path.join(__dirname, 'commands'));
```

Commando has built-in command prefix configuration per-guild, as well as enabling and disabling commands per-guild.
In order for this to persist across restarts, you should use a [SettingProvider](https://discord.js.org/#/docs/commando/master/class/SettingProvider).
There is a built-in SQLiteProvider that comes with Commando, which stores all settings in an SQLite3 database.
To use it, install the `sqlite` module with NPM (`npm install --save sqlite`). Then, set the provider on the client:

```javascript
const sqlite = require('sqlite');

client.setProvider(
	sqlite.open(path.join(__dirname, 'settings.sqlite3')).then(db => new Commando.SQLiteProvider(db))
).catch(console.error);
```

Finally, you must log in, just as if you were using a regular Client.

```javascript
client.login('token goes here');
```

There is an extremely simple example bot used to test Commando, of which you can view the source [here](https://github.com/discordjs/Commando/tree/master/test).
