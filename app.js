const express = require("express");
const bodyParser = require("body-parser");
const moongoose = require("mongoose");

const feedRoutes = require("./routes/feed");
const app = express();

// app.use(bodyParser.urlencoded()) // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // application/json

//general middleware to set headers
app.use((req, res, next) => {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE");
	res.setHeader("Access-Control-Allow-Headers", "Content-type,Authorization");
	next();
});

app.use("/feed", feedRoutes);

moongoose.mongo
	.connect(
		"mongodb+srv://chakshu:chakshu@cluster0.fjlpu.mongodb.net/messages?authSource=admin&replicaSet=atlas-1ocqy4-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true"
	)
	.then((result) => {
		app.listen(8080);
	})
	.catch((err) => console.log(err));
