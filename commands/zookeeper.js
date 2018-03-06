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
		name: 'zookeeper',
		message: '(Required) Enter zookeeper endpoint. :'
	}
];

const custom_zookeepers = 'custom-zookeepers';

function run(){

	program
		.command('start-zk')
		.description('Start a Zookeeper Server')
		.option('-d, --default', 'use default values')
		.action(
			(options) => {
				!options.default ? (
					() => {
						prompt(questions)
						.then( answers => {
							startZookeeper( answers.zookeeper );
						});
					}
				)() : (
					() => {
						parser
							.read(`${constant.df}`,(error, data) => {
								if(error) throw error;
								startZookeeper( data.zookeeper );
							})
					}
				)()
			}
		);

}

function startZookeeper(zookeeper){
	if( zookeeper === 'null' ) console.error('Zookeeper endpoint missing!');
	else if( zookeeper === '' ) spawnZookeeper(`${constant.cf_zk}`);
	else if( zookeeper !== '' ){
		const zk = zookeeper.trim().split(':');
		if( ( zk[0] === 'localhost' || zk[0] === '127.0.0.1' ) && ( zk[1] === '2181' ) ) spawnZookeeper(`${constant.cf_zk}`);
		else{
			//todo: create property file for the zookeeper endpoint and pass it to spawnZookeeper
            spawnZookeeper( createPropertyFile(zookeeper) );
		}
	}
}

function spawnZookeeper(property_file_route){
	const child = spawn(
		`${constant.st_zk}`, [ `${property_file_route}` ]
	);
	std(child);
}

function std(child_proc) {

    child_proc.stdout.on('data', (data) => {
        console.log(`${data}`);
    });

    child_proc.stderr.on('data', (data) => {
        console.log(`${data}`);
    });

}

function createPropertyFile(zookeeper) {

    const host_port = zookeeper.split(/:\s*/);

    if( host_port.length !== 2 ) console.error(`Error parsing ${zookeeper}`);
    else{
        const host = host_port[0];
        const port = parseInt( host_port[1] );
        if( isNaN(port) ) console.error(`Port for ${zookeeper} is not a number`);
        else {

            if( !dirExists(`${constant.cfg_dir}/${custom_zookeepers}/`) ) fs.mkdirSync(`${constant.cfg_dir}/${custom_zookeepers}/`);

            const dir = fs.readdirSync(`${constant.cfg_dir}/${custom_zookeepers}/`);
            const portExists = dir.length > 0 ?
                dir
                    .reduce( (accumulator, file) => `${accumulator}, ${file.replace(/[A-z.*]/g, '')}`, '' )
                    .split(',')
                    .filter( (_port) => !isNaN( parseInt(_port) ) )
                    .join('')
                    .includes(port.toString()) :
                false;

            const file_name = `zookeeper.${host}.${port}.properties`;

            if( portExists ) return `${constant.cfg_dir}/${custom_zookeepers}/${file_name}`;
            else{

                if( !fileExists(`${constant.cfg_dir}/${custom_zookeepers}/${file_name}`) ){

                    fs.copyFileSync(constant.cf_zk,`${constant.cfg_dir}/${custom_zookeepers}/${file_name}`);

                    const newProp = parser.createEditor(`${constant.cfg_dir}/${custom_zookeepers}/${file_name}`);

                    newProp.set('clientPort',port.toString());
                    newProp.save();

                    return `${constant.cfg_dir}/${custom_zookeepers}/${file_name}`;

                }
            }

		}
	}

}

module.exports = run;