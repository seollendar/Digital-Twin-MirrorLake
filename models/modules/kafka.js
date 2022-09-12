const config = require("../../config");
const { connectHost } = config.kafka;
const [hostname, port] = connectHost.split(":");

const http = require("http");

class Kafka {
	/**
	 * kafka와 통신하기 위한 options 설정
	 * @param {String} method (required) post, get, put, delete 등 http request method
	 * @param {String} path (required) host:port/ 뒤의 나머지 address
	 * @returns {Json} {hostname, port, path, headers, maxRedirects, method, ...}
	 */
	setOptions({ method, path }) {
		if (!method || !path) {
			throw ` > method || path undefined in kafka sink `;
		}

		return {
			method,
			hostname,
			port,
			path,
			headers: {
				"Content-Type": "application/json",
			},
			maxRedirects: 20,
		};
	}

	deleteSink(connectorName) {
		console.log("Delete Sink Connector");
		/**
		 * Send Request to Kafka Connect Server
		 */
		var request = http.request(this.setOptions({ method: "delete", path: `/connectors/${connectorName}` }), function (response) {
			let fullBody = "";

			response.on("data", function (chunk) {
				fullBody += chunk;
			});

			response.on("end", function () {
				console.log(fullBody);
			});

			response.on("error", function (error) {
				console.error(error);
			});
		});
		request.end();
	}

	async CreateSimulationSinkConnector(resObject) {
		let sinkConnectorBody;
		const { name, url, arg } = { ...resObject };
		console.log("resObject", resObject);
		let splitURLsink = url.split(":");
		switch (splitURLsink[0]) {
			case "http":
				sinkConnectorBody = await SimulationHttpSinkConnector(resObject);
				console.log("http sink");
				break;
			case "mqtt":
				sinkConnectorBody = await SimulationMQTTSinkConnector(resObject, splitURLsink);
				console.log("mqtt sink");
				break;
			default:
				console.log(`out of ${splitURLsink[0]}`);
		}

		console.log("sinkConnectorBody\n", sinkConnectorBody);
		/**
		 * Send Request to Kafka Connect Server
		 */
		var request = http.request(this.setOptions({ method: "post", path: "/connectors" }), function (response) {
			var chunks = [];

			response.on("data", function (chunk) {
				chunks.push(chunk);
			});

			response.on("end", function (chunk) {
				var body = Buffer.concat(chunks);
				console.log(body.toString());
			});

			response.on("error", function (error) {
				console.error(error);
			});
		});
		request.write(JSON.stringify(sinkConnectorBody));
		request.end();
	}

	SimulationHttpSinkConnector(resObject) {
		const DOs = Object.keys(resObject.arg); //[ 'DO1', 'DO2' ]
		console.log("DOs: ", DOs);
		let DO_DOs = DOs.map((d) => "DO_" + d);
		console.log("DO_DOs: ", DO_DOs);
		let topics = "";
		for (i in DO_DOs) {
			topics += DO_DOs[i];
			if (i != DO_DOs.length - 1) {
				topics += ",";
			}
		}
		console.log("topics", topics);

		let sinkConnectorBody = {
			name: resObject.name,
			config: {
				"connector.class": "uk.co.threefi.connect.http.HttpSinkConnector",
				"tasks.max": "1",
				"request.method": "",
				headers: "Content-Type:application/json|Accept:application/json",
				"key.converter": "org.apache.kafka.connect.storage.StringConverter",
				"value.converter": "org.apache.kafka.connect.storage.StringConverter",
				"http.api.url": resObject.url,
				"request.method": "POST",
				topics: topics,
				"response.topic": `SIM_${resObject.name}`,
				"kafka.api.url": `${config.kafkaHost}`,
			},
		};

		return sinkConnectorBody;
	}

	SimulationMQTTSinkConnector({ resObject, splitURLsink }) {
		const DOs = Object.keys(resObject.arg); //[ 'DO1', 'DO2' ]
		let DO_DOs = DOs.map((d) => "DO_" + d);

		let topics = "";
		for (i in DO_DOs) {
			topics += DO_DOs[i];
			if (i != DO_DOs.length - 1) {
				topics += ",";
			}
		}
		console.log(topics);
		let SQL = "";
		for (i in DO_DOs) {
			SQL += `INSERT INTO /mqtt/data SELECT * FROM ${DO_DOs[i]};`;
		}
		let sinkConnectorBody = {
			name: resObject.name,
			config: {
				"connector.class": "com.datamountaineer.streamreactor.connect.mqtt.sink.MqttSinkConnector",
				"tasks.max": "1",
				topics: topics,
				"connect.mqtt.hosts": `tcp:${splitURLsink[1]}:${splitURLsink[2]}`,
				"connect.mqtt.clean": "true",
				"connect.mqtt.timeout": "1000",
				"connect.mqtt.keep.alive": "1000",
				"connect.mqtt.service.quality": "1",
				"key.converter": "org.apache.kafka.connect.json.JsonConverter",
				"key.converter.schemas.enable": "false",
				"value.converter": "org.apache.kafka.connect.json.JsonConverter",
				"value.converter.schemas.enable": "false",
				"connect.mqtt.kcql": SQL,
			},
		};
		return sinkConnectorBody;
	}

	/**
	 * CreateSinkConnector => service, simulation
	 * MQTT, HTTP
	 */

	async CreateServiceSinkConnector(resObject) {
		let sinkConnectorBody;
		const { name, url, DO_arg, SIM_arg } = { ...resObject };
		console.log("resObject", resObject);
		let splitURLsink = url.split(":");
		switch (splitURLsink[0]) {
			case "http":
				sinkConnectorBody = await ServiceHttpSinkConnector(resObject);
				console.log("http sink");
				break;
			case "mqtt":
				sinkConnectorBody = await ServiceMQTTSinkConnector(resObject, splitURLsink);
				console.log("mqtt sink");
				break;
			default:
				console.log(`out of ${splitURLsink[0]}`);
		}

		console.log("sinkConnectorBody\n", sinkConnectorBody);
		/**
		 * Send Request to Kafka Connect Server
		 */
		var request = http.request(this.setOptions({ method: "post", path: "/connectors" }), function (response) {
			var chunks = [];

			response.on("data", function (chunk) {
				chunks.push(chunk);
			});

			response.on("end", function (chunk) {
				var body = Buffer.concat(chunks);
				console.log(body.toString());
			});

			response.on("error", function (error) {
				console.error(error);
			});
		});
		request.write(JSON.stringify(sinkConnectorBody));
		request.end();
	}

	ServiceHttpSinkConnector(resObject) {
		let topicArg = resObject.arg;
		let topics = "";
		for (i in topicArg) {
			topics += topicArg[i];
			if (i != topicArg.length - 1) {
				topics += ",";
			}
		}
		//console.log(topics);

		let sinkConnectorBody = {
			name: resObject.name,
			config: {
				"connector.class": "uk.co.threefi.connect.http.HttpSinkConnector",
				"tasks.max": "1",
				"request.method": "",
				headers: "Content-Type:application/json|Accept:application/json",
				"key.converter": "org.apache.kafka.connect.storage.StringConverter",
				"value.converter": "org.apache.kafka.connect.storage.StringConverter",
				"http.api.url": resObject.url,
				"request.method": "POST",
				topics: topics,
				"response.topic": `Service_${resObject.name}`,
				"kafka.api.url": `${config.kafkaHost}`,
			},
		};

		return sinkConnectorBody;
	}

	ServiceMQTTSinkConnector({ resObject, splitURLsink }) {
		const DOs = Object.keys(resObject.DO_arg); //[ 'DO1', 'DO2' ]
		const SIMs = Object.keys(resObject.SIM_arg);
		let DO_DOs = DOs.map((d) => "DO_" + d);
		let SIM_SIMs = SIMs.map((s) => "SIM_" + s);
		let DO_SIM_arr = DO_DOs.concat(SIM_SIMs);
		//console.log(DO_SIM_arr);

		let topics = "";
		for (i in DO_SIM_arr) {
			topics += DO_SIM_arr[i];
			if (i != DO_SIM_arr.length - 1) {
				topics += ",";
			}
		}
		//console.log(topics);

		let SQL = "";
		for (i in DO_DOs) {
			SQL += `INSERT INTO /mqtt/data SELECT * FROM ${DO_DOs[i]};`;
		}

		for (i in SIM_SIMs) {
			SQL += `INSERT INTO /mqtt/simulation SELECT * FROM ${SIM_SIMs[i]};`;
		}

		let sinkConnectorBody = {
			name: resObject.name,
			config: {
				"connector.class": "com.datamountaineer.streamreactor.connect.mqtt.sink.MqttSinkConnector",
				"tasks.max": "1",
				topics: topics,
				"connect.mqtt.hosts": `tcp:${splitURLsink[1]}:${splitURLsink[2]}`,
				"connect.mqtt.clean": "true",
				"connect.mqtt.timeout": "1000",
				"connect.mqtt.keep.alive": "1000",
				"connect.mqtt.service.quality": "1",
				"key.converter": "org.apache.kafka.connect.json.JsonConverter",
				"key.converter.schemas.enable": "false",
				"value.converter": "org.apache.kafka.connect.json.JsonConverter",
				"value.converter.schemas.enable": "false",
				"connect.mqtt.kcql": SQL,
			},
		};

		//console.log("sinkConnectorBody\n", sinkConnectorBody);
		return sinkConnectorBody;
	}
}

module.exports = Kafka;