const program = require('commander');
const {prompt} = require('inquirer');
const { spawn } = require('child_process');
const fs = require('fs');

const parser = require('properties-parser');

const constant = require('../feeds/constant.js');
const { dirExists, fileExists } = require('../util.js');

const questions = [
	{
		type: 'input',
		name: 'broker',
		message: '(Required) Enter broker endpoints. Defaults to 127.0.0.1:9092 :'
	},
    {
        type: 'input',
        name: 'brokers',
        message: '(Required) Enter comma separated broker-list endpoints. Defaults to 127.0.0.1:9092 :'
    }
];

function run(){

	program
		.command('start-kafka')
		.description('Start a Kafka Server')
		.option('-d, --default', 'use default values')
        .option('-q, --quiet', 'start in quiet mode. allows for the spin up several Kafka nodes at once')
		.action(
			(options) => {
				!options.default ? (
					() => {

                        !options.quiet ?
							prompt(questions[0])
                                .then( answers => {
                                    startKafka( answers.broker, false );
                                }) :
							prompt(questions[1])
								.then( answers => {
									startKafka( answers.brokers, true );
							});

					}
				)() : (
					() => {
						parser
							.read(`${constant.df}`,(error, data) => {
								if(error) throw error;
								startKafka( data['broker.list'], false );
							})
					}
				)()
			}
		);

    program
        .command('start-kafka')
        .description('Start a Kafka Server')
        .option('-d, --default', 'use default values')
        .option('-q, --quiet', 'start in quiet mode. allows for the spin up several Kafka nodes at once')
        .action(
            (options) => {
                !options.default ? (
                    () => {

                        !options.quiet ?
                            prompt(questions[0])
                                .then( answers => {
                                    startKafka( answers.broker, false );
                                }) :
                            prompt(questions[1])
                                .then( answers => {
                                    startKafka( answers.brokers, true );
                                });

                    }
                )() : (
                    () => {
                        parser
                            .read(`${constant.df}`,(error, data) => {
                                if(error) throw error;
                                startKafka( data['broker.list'], false );
                            })
                    }
                )()
            }
        );

}

function startKafka(brokers, isQuiet){
	if( brokers === 'null' ) throw new Error('Broker-list endpoints missing!');
	else if( brokers === '' ) spawnKafka(constant.cf_kf, false);
	else if( brokers !== '' ){

        const kf = brokers.split(',').reduce((accumulator, item) => {
            return `${accumulator}, ${item.trim()}`;
        }).split(/,\s*/);

        kf.forEach((item) => {
            const i = item.trim().split(/:\s*/);
            if ( isDefualtBrokerEndpoint(i) ) spawnKafka(constant.cf_kf, isQuiet);
            else{
                const file = doesUrlExist(i[1]);
                if( !file ) console.error(`Property file for ${brokers} does not exists. You may create it with 'cli-kafka create-broker'.`);
                else spawnKafka(file, isQuiet);
            }
        });

        if( isQuiet ) console.info(`Kafka nodes successfully started quiet mode on ${kf.join(',')}`);
		
	} 
}

function spawnKafka(property_file_route, quiet){
	const child = !quiet ? spawn( `${constant.st_kf}`, [ `${property_file_route}` ] ) : spawn( `${constant.st_kf}`, [ `${property_file_route}` ], { detached: true } );

	if( !quiet ){
        child.stdout.on('data', (data) => {
            console.log(`${data}`);
        });

        child.stderr.on('data', (data) => {
            console.log(`${data}`);
        });
	}else {
		setTimeout(() => {
			process.exit();
		},2000)
	}

}

function doesUrlExist(port) {

    if( dirExists(`${constant.cfg_dir}/custom-servers/`) ){

        const file =  fs
			.readdirSync(`${constant.cfg_dir}/custom-servers/`)
			.filter((file) => {
        		return file.replace(/[A-z.*]/g, '').includes(port);
			})[0];

        return file ? `${constant.cfg_dir}/custom-servers/${file}` : false;
	}

	return false;
}

function isDefualtBrokerEndpoint(url) {
	return ( url[0] === 'localhost' || url[0] === '127.0.0.1' ) && ( url[1] === '9092' );
}

module.exports = run;