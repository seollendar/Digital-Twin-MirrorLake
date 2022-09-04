exports.digitalBrain = {
	ip: "localhost",
	port: "1005",
};

exports.redis = {
	ip: "localhost",
	port: "6379",
};

exports.mqtt = {
	ip: "localhost",
	port: "1883",
};

exports.kafka = {
	host: "172.20.171.179:9092",
	connectHost: "172.20.171.179:8083",
};

exports.flink = {
	ksqlOptions: {
		hostname: "localhost",
		port: 8088,
		headers: {
			"Content-Type": "application/vnd.ksql.v1+json",
			Accept: "application/vnd.ksql.v1+json",
		},
	},
	gwOption: {
		hostname: "172.20.171.179",
		port: 8087,
	},
};
