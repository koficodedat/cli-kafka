const program = require('commander');
const {prompt} = require('inquirer');
const { spawn } = require('child_process');

const parser = require('properties-parser');

const constant = require('../feeds/constant.js');

const questions = [
    {
        type: 'input',
        name: 'topic',
        message: '(Required) Enter topic name. :'
    },
    {
        type: 'input',
        name: 'zookeeper',
        message: '(Required) Enter zookeeper endpoint. :'
    },
    {
        type: 'input',
        name: 'replication',
        message: '(Required) Enter replication factor. :'
    },
    {
        type: 'input',
        name: 'partitions',
        message: '(Required) Enter number of partitions. :'
    }
];

function run(){

    program
        .command('create-topic')
        .description('Create a Kafka Topic')
        .option('-d, --default', 'use default values: zookeeper => localhost2181, replication => 1, partition: 5')
        .action(
            (options) => {
                !options.default ? (
                    () => {

                        prompt(questions)
                            .then( answers => {
                                createTopic( answers.topic, answers.zookeeper, answers.replication, answers.partitions );
                            });

                    }
                )() : (
                    () => {

                        prompt(questions[0])
                            .then( answers => {
                                parser
                                    .read(`${constant.df}`,(error, data) => {
                                        if(error) throw error;
                                        createTopic( answers.topic, data['zookeeper'], data['replication'], data['partitions'] );
                                    })
                            });

                    }
                )()
            }
        );

    program
        .command('list-topics')
        .description('List Kafka Topics')
        .option('-d, --default', 'use default values: zookeeper => localhost2181')
        .action(
            (options) => {
                !options.default ? (
                    () => {

                        prompt(questions[1])
                            .then( answers => {
                                listTopic( answers.zookeeper );
                            });

                    }
                )() : (
                    () => {

                        parser
                            .read(`${constant.df}`,(error, data) => {
                                if(error) throw error;
                                listTopic( data['zookeeper'] );
                            })

                    }
                )()
            }
        );

}

function createTopic(topic, zookeeper, replication, partitions){

    if( topic === '' || topic === 'null' ) console.error('Topic is missing!');
    else if( zookeeper === '' || zookeeper === 'null' ) console.error('Zookeeper endpoint missing!');
    else if( replication === '' || replication === 'null' ) console.error('Replication factor is missing!');
    else if( partitions === '' || partitions === 'null' ) console.error('Partition is missing!');
    else {
        const child = spawn( `${constant.tp} --create --zookeeper ${zookeeper} --replication ${replication} --partitions ${partitions} --topic ${topic}`, { shell: true } );
        std(child);
    }

}

function listTopic(zookeeper){

    if( zookeeper === '' || zookeeper === 'null' ) console.error('Zookeeper endpoint missing!');
    else {
        const child = spawn( `${constant.tp} --list --zookeeper ${zookeeper}`, { shell: true } );
        std(child);
    }

}

function std(child_proc) {

    child_proc.stdout.on('data', (data) => {
        console.log(`${data}`);
    });

    child_proc.stderr.on('data', (data) => {
        console.log(`${data}`);
    });

}

module.exports = run;