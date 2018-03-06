const psettings = require('../project-settings.js');

const constants = {
	st_zk: 	`${psettings.baseDir}/libs/kafka/bin/zookeeper-server-start.sh`,
	cf_zk: 	`${psettings.baseDir}/libs/kafka/config/zookeeper.properties`,
	st_kf: 	`${psettings.baseDir}/libs/kafka/bin/kafka-server-start.sh`,
	cf_kf: 	`${psettings.baseDir}/libs/kafka/config/server.properties`,
	tp: 	`${psettings.baseDir}/libs/kafka/bin/kafka-topics.sh`,
	prd: 	`${psettings.baseDir}/libs/kafka/bin/kafka-console-producer.sh`,
	con: 	`${psettings.baseDir}/libs/kafka/bin/kafka-console-consumer.sh`,
	df: 	`${psettings.baseDir}/feeds/defaults.properties`,
	cfg_dir: `${psettings.baseDir}/libs/kafka/config`
};

module.exports = constants;