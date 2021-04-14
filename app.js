const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const feedRoutes = require("./routes/feed");

const app = express();

// app.use(bodyParser.urlencoded()) // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // application/json
app.use("/images", express.static(path.join(__dirname, "images")));

//general middleware to set headers
app.use((req, res, next) => {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE");
	res.setHeader("Access-Control-Allow-Headers", "Content-type,Authorization");
	next();
});

app.use("/feed", feedRoutes);

app.use((error, req, res, next) => {
	console.log(error);
	const status = error.statusCode;
	const message = error.message;
	res.status(status).json({ message: message });
});

mongoose.connect(
	"mongodb+srv://chakshu:chakshu@cluster0.pfrj6.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
	{ useUnifiedTopology: true, useNewUrlParser: true }
)
	.then((result) => {
		app.listen(8080);
	})
	.catch((err) => console.log(err));
