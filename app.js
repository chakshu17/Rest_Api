const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const feedRoutes = require("./routes/feed");
const authRoutes = require("./routes/auth");
const multer = require("multer");

const app = express();

const { v4: uuidv4 } = require("uuid");

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "images");
	},
	filename: function (req, file, cb) {
		if (file.mimetype === "image/png") {
			cb(null, `${uuidv4()}.png`);
		} else if (file.mimetype === "image/jpg") {
			cb(null, `${uuidv4()}.jpg`);
		} else if (file.mimetype === "image/jpeg") {
			cb(null, `${uuidv4()}.jpeg`);
		}
	},
});

const filefilter = (req, file, cb) => {
	if (
		file.mimetype === "image/png" ||
		file.mimetype === "image/jpg" ||
		file.mimetype === "image/jpeg"
	) {
		cb(null, true);
	} else {
		cb(null, false);
	}
};

// app.use(bodyParser.urlencoded()) // x-www-form-urlencoded <form>
app.use(express.json()); // application/json
app.use(multer({ storage: storage, fileFilter: filefilter }).single("image"));
app.use("/images", express.static(path.join(__dirname, "images")));

//general middleware to set headers
app.use((req, res, next) => {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE");
	res.setHeader("Access-Control-Allow-Headers", "Content-type,Authorization");
	next();
});

app.use("/feed", feedRoutes);
app.use("/auth", authRoutes);

app.use((error, req, res, next) => {
	console.log(error);
	const status = error.statusCode;
	const message = error.message;
	const data = error.data;
	res.status(status).json({ message: message, data: data });
});

mongoose
	.connect(
		"mongodb+srv://chakshu:chakshu@cluster0.pfrj6.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
		{ useUnifiedTopology: true, useNewUrlParser: true }
	)
	.then((result) => {
		const server = app.listen(8080);
		const io = require("socket.io")(server);


		io.on("connection", (socket) => {
			console.log("CLient Connected");
		});
	})
	.catch((err) => console.log(err));
