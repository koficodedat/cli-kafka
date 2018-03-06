#!/usr/bin/env node

const program = require('commander');
const {prompt} = require('inquirer');

const broker = require('./commands/broker.js');
const zookeeper = require('./commands/zookeeper.js');
const kafka = require('./commands/kafka.js');
const topic = require('./commands/topic.js');

program
	.version('1.0.0')
	.description('Simplified Command-Line tool for common Kafka functionality.');

buildCommands();

function buildCommands(){
	broker();
	zookeeper();
	kafka();
	topic();
}

if (!process.argv.slice(2).length || !/[arudl]/.test(process.argv.slice(2))) {
		program.outputHelp();
		process.exit();
}

program.parse(process.argv);

process.on( 'unhandledRejection', (err) => { console.error(err); } );