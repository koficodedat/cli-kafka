const program = require('commander');
const {prompt} = require('inquirer');
const fs = require('fs');

const replace = require('replace');
const parser = require('properties-parser');

const constant = require('../feeds/constant.js');
const { dirExists, fileExists } = require('../util.js');


const questions = [
	{
		type: 'input',
		name: 'brokers',
		message: '(Required) Enter comma separated broker-list endpoints. Eg: localhost:9093, localhost:9094 :'
	}
];

const custom_servers = 'custom-servers';

function run(){

	program
		.command('create-broker')
		.description('Create new Broker Property File(s). File names are in the format server.{host}.{port}.{broker-id}.properties')
		.action(
			() => {
				prompt(questions)
				.then( answers => {
					if( answers.brokers.trim() === '' ) throw new Error('Broker-list endpoints missing!');

					answers.brokers
						.split(/,\s*/)
						.forEach((broker) => {
							createPropertyFile(broker);
						});
				});
			}
		);

}

function createPropertyFile(broker){

    try{
        const editor = parser.createEditor(`${constant.df}`);

        const host_port = broker.split(/:\s*/);

        if( host_port.length !== 2 ) console.error(`Error parsing ${broker}`);
        else {

            const host = host_port[0];
            const port = parseInt( host_port[1] );
            if( isNaN(port) ) console.error(`Port for ${broker} is not a number`);
            else{

                const inc = parseInt(editor.get('broker.count')) + 1;
                const file_name = `server.${host}.${port}.${inc}.properties`;

                if( !dirExists(`${constant.cfg_dir}/${custom_servers}/`) ) fs.mkdirSync(`${constant.cfg_dir}/${custom_servers}/`);

                const dir = fs.readdirSync(`${constant.cfg_dir}/${custom_servers}/`);
                const portExists = dir.length > 0 ?
                    dir
                        .reduce( (accumulator, file) => `${accumulator}, ${file.replace(/[A-z.*]/g, '')}`, '' )
                        .split(',')
                        .filter( (_port) => !isNaN( parseInt(_port) ) )
                        .join('')
                        .includes(port.toString()) :
                    false;

                if( portExists ) console.warn(`Port ${port} is taken`);
                else{
                    if( !fileExists(`${constant.cfg_dir}/${custom_servers}/${file_name}`) ){

                        fs.copyFileSync(constant.cf_kf,`${constant.cfg_dir}/${custom_servers}/${file_name}`);

                        const newProp = parser.createEditor(`${constant.cfg_dir}/${custom_servers}/${file_name}`);

                        newProp.set('broker.id',inc.toString());
                        newProp.set('log.dirs',`/tmp/kafka-logs-${inc}`);
                        newProp.save();

                        replace({
                            regex: '#listeners=PLAINTEXT://:9092',
                            replacement: `listeners=PLAINTEXT://${host}:${port}`,
                            paths: [`${constant.cfg_dir}/${custom_servers}/${file_name}`],
                            recursive: false,
                            silent: true
                        });

                        editor.set('broker.count',inc.toString());
                        editor.save();

                    }
                }

            }
        }

    }
    catch (e) { throw e; }

}

module.exports = run;