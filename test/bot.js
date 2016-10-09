const commando = require('../src/index');
const token = require('./auth.json').token;

const client = new commando.Client({
	owner: '90997305578106880',
	selfbot: true,
	commandPrefix: 'self '
});

client.on('error', console.error)
	.on('warn', console.warn)
	.on('debug', console.log)
	.on('commandRun', cmd => { console.log(`Running command ${cmd.groupID}:${cmd.memberName}.`); })
	.on('commandError', (cmd, err) => { console.error(`Error in command ${cmd.groupID}:${cmd.memberName}`, err); });

client.registry.registerDefaults();

client.login(token);
