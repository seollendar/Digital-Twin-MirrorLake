const express = require("express");
const asyncify = require("express-asyncify");
const router = asyncify(express.Router());

const service = require("../../../services");
const ErrorHandler = require("../../../lib/error-handler");

/**
 * DO Creation
 * @body {String} name (required)
 * @body {String Array} sensor (required)
 * @returns {Json} {}
 */
router.post("/", async function (req, res) {
	try {
		const { name, sensor } = req.body;

		const result = await service.do.create({ name, sensor });

		res.success(201, result);
	} catch (e) {
		if (!(e instanceof ErrorHandler)) {
			console.log(e);
			e = new ErrorHandler(500, 500, "Internal Server Error");
		}
		e.handle(req, res, "POST /DigitalTwin/DO");
	}
});

/*
 * DO Retrieve
 * localhost:1005/DigitalTwin/DO?name=DOcrain26
 */
router.get("/", async (req, res) => {
	const { name } = req.query;
	try {
		const result = await service.do.get({ name });

		res.success(200, result);
	} catch (e) {
		if (!(e instanceof ErrorHandler)) {
			console.log(e);
			e = new ErrorHandler(500, 500, "Internal Server Error");
		}
		e.handle(req, res, `Retrieve /DigitalTwin/DO`);
	}
});

/*
 * DO Entire Retrieve
 */
router.get("/all", async function (req, res) {
	try {
		const result = await service.do.getAll();

		res.success(200, result);
	} catch (e) {
		if (!(e instanceof ErrorHandler)) {
			console.log(e);
			e = new ErrorHandler(500, 500, "Internal Server Error");
		}
		e.handle(req, res, `Retrieve /DigitalTwin/DO/all`);
	}
});

/*
 * DO DELETE
 * localhost:1005/DigitalTwin/DO?name=DOcrain26
 */
router.delete("/", async (req, res) => {
	const { name } = req.query;
	try {
		const result = await service.do.delete({ name });

		res.success(200, result);
	} catch (e) {
		if (!(e instanceof ErrorHandler)) {
			console.log(e);
			e = new ErrorHandler(500, 500, "Internal Server Error");
		}
		e.handle(req, res, `Retrieve /DigitalTwin/DO/all`);
	}
});

/*
 * DO Entire Delete
 */
router.delete("/all", async function (req, res) {
	try {
		const result = await service.do.deleteAll();

		res.success(200, result);
	} catch (e) {
		if (!(e instanceof ErrorHandler)) {
			console.log(e);
			e = new ErrorHandler(500, 500, "Internal Server Error");
		}
		e.handle(req, res, `Retrieve /DigitalTwin/DO/all`);
	}
});

/*
 * DO UPDATE
 * flink alter table 구현X
 */
router.put("/", async (req, res) => {
	try {
		const { name, sensor } = req.body;

		const result = await service.do.update({ name, sensor });

		res.success(201, result);
	} catch (e) {
		if (!(e instanceof ErrorHandler)) {
			console.log(e);
			e = new ErrorHandler(500, 500, "Internal Server Error");
		}
		e.handle(req, res, "UPDATE /DigitalTwin/DO");
	}
});

module.exports = router;
