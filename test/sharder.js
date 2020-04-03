#!/usr/bin/env node
const path = require('path');
const { ShardingManager } = require('discord.js');
const { token } = require('./auth');

/* eslint-disable no-console */

const manager = new ShardingManager(path.join(__dirname, 'bot.js'), {
	token,
	totalShards: 2,
	mode: 'worker'
});

manager.on('shardCreate', shard => {
	console.log(`----- SHARD ${shard.id} LAUNCHED -----`);
	shard.on('death', () => console.log(`----- SHARD ${shard.id} DIED -----`))
		.on('ready', () => console.log(`----- SHARD ${shard.id} READY -----`))
		.on('disconnect', () => console.log(`----- SHARD ${shard.id} DISCONNECTED -----`))
		.on('reconnecting', () => console.log(`----- SHARD ${shard.id} RECONNECTING -----`));
});

manager.spawn().catch(console.error);
