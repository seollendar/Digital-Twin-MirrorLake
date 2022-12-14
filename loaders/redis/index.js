const redis = require("redis");
const config = require("../../config");
const { ip, port } = config.redis;

exports.init = () => {
	global.Rclient = redis.createClient({
		host: ip,
		port,
	});

	Rclient.on("error", function (error) {
		console.error(error);
	});
};
