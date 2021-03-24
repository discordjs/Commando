# Creating new commands

> *Note: if you're using VSCode for editing, consider installing the `iceproductions.commando-snippets` extension.*

Commando has an easy way of adding new commands. Once you have the basic `index.js` file (see [welcome](../general/first-steps)), you can
simply create new files in the `commands` directory.

The file paths have the following format: `commands/[group]/[command].js`, where `group` is the group name (the first string in the array, for example
`fun` in `['fun', 'Fun commands']`) and `command` is the command name. Note that while this format isn't enforced by itself, not using this format will
prevent the `load`/`unload`/`reload` commands to work.

Commands are classes (each command is in it's own class), and are configured by their constructors. The basic format is

```js
const { Command } = require("@iceprod/discord.js-commando");

module.exports = class CustomCommand extends Command {
    constructor(client) {
        super(client, {
            // options
        });
    }

    run(msg, args) {
        // code to run
    }
}
```

## Options

For the options, you can take a look at the [CommandInfo typedef](https://discordjs.danbulant.eu/#/docs/commando/master/typedef/CommandInfo). Basically, the most basic config is:

```js
{
    name: "custom-command",
    memberName: "custom-command", // you want this to be same as name
    group: "fun", // this should be the code of group (the first argument). Same as folder name.
    description: "My custom command"
}
```

If you don't set the `args` property, commando will not try to validate the arguments at all. The second argument to run (usually named `args`) will be an array of strings. If you set the `argsType` property to `single`, commando will not parse arguments and just pass everything after the command into `args`. Using this, you can make a simple `say` command like this:

```js
const { Command } = require("@iceprod/discord.js-commando");

module.exports = class CustomCommand extends Command {
    constructor(client) {
        super(client, {
            name: "say",
            memberName: "say",
            group: "fun",
            description: "Says the message as the bot",
            argsType: "single"
        });
    }

    run(msg, args) {
        return msg.channel.send(args, { disableMentions: "all" });
    }
}
```

Commando also shortcuts replies into `say` method of message which tries to send a normal message in the current channel, and if the bot doesn't have permission will DM the user that started the command.

## Comamnd editing

To support command editing, simply return the message from `run` method. If a message is not returned, commando will ignore message edits.

### Async commands

The `run` method can be async, in which case the bot will `await` the result (so you can have command editing with `async` commands as well).

### Multiple responses

The `run` method can also return an array of responses. This can also be mixed with `async` commands.

## Argument parsing and validation

Commando has advanced argument parsing and validation builtin, using the `args` property in command config. The `args` property is an array of objects, where each object specifies the type of a single argument (arguments can be quoted to allow spaces in them). The type definition can be found [here](https://discordjs.danbulant.eu/#/docs/commando/master/typedef/ArgumentInfo). The second parameter to `run` will then have an object with `key` mapped values (where `key` is the `key` in args).

Arguments have 2 formats:

* type driven (uses one of the builtin types or a custom defined type):

```js
{
    key: "argument",
    type: "string",
    prompt: "What's the value of argument?"
}
```

* validation driven (each argument has it's own validate and parse methods):

```js
{
    key: "argument",
    prompt: "What's the value of argument?",
    parse(val, msg): { return val },
    validate(val, msg): { return !!val }
}
```

You can also mix the arguments (i.e. set `type` but have custom `parse` method) and mix types (using `|`, you can specify fallback types like `integer|string` which will first try to check for integer, and if fails will return the argument as string). If argument is required (`default` property is not set), commando will attempt to ask the user for the value before running the command (if it fails, the command gets cancelled and the `run` method is never called). Parse can return any type which will get saved into the args object.

Simple example sending the tag of the user selected:

```js
const { Command } = require("@iceprod/discord.js-commando");

module.exports = class CustomCommand extends Command {
    constructor(client) {
        super(client, {
            name: "tag",
            memberName: "tag",
            group: "fun",
            description: "Says the tag of the selected user",
            args: [{
                type: "user",
                prompt: "Which user to show the tag of?",
                key: "user"
            }]
        });
    }

    run(msg, args) {
        return msg.channel.send(args.user.tag, { disableMentions: "all" });
    }
}
```

Then simply running `!tag [username]` will show the full tag of given user (named `"[username]"`).

See [CommandoRegistry#registerDefaultTypes](https://discordjs.danbulant.eu/#/docs/commando/master/class/CommandoRegistry?scrollTo=registerDefaultTypes) for list of default types.
