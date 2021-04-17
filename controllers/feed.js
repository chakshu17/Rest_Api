const { validationResult } = require("express-validator/check");

const fs = require("fs");
const path = require("path");

const Post = require("../models/post");

exports.getPosts = (req, res, next) => {
	Post.find()
		.then((posts) => {
			res.status(200).json({
				message: "Fetched PostsSuccessfully.",
				posts: posts,
			});
		})
		.catch((err) => {
			if (!err.statusCode) {
				err.statusCode = 500;
			}
			next(err);
		});
};

exports.createPost = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const error = new Error("Validation Failed, Entered data is incorrect");
		error.statusCode = 422;
		throw error;
		// return res.status(422).json({
		// 	message: "Validation Failed, Entered data is incorrect",
		// 	error: errors.array(),
		// });
	}
	if (!req.file) {
		const error = new Error("No Image Provided.");
		const statusCode = 422;
		throw error;
	}
	const imageUrl = req.file.path.replace("\\", "/");
	const title = req.body.title;
	const content = req.body.content;
	const post = new Post({
		title: title,
		content: content,
		imageUrl: imageUrl,
		creator: { name: "Kratos" },
	});

	post.save()
		.then((result) => {
			// console.log(result);
			res.status(201).json({
				message: "Post Created Successfully",
				post: result,
			});
		})
		.catch((err) => {
			if (!err.statusCode) {
				err.statusCode = 500;
			}
			next(err);
		});
	// create post in db
};

exports.getPost = (req, res, next) => {
	const postId = req.params.postId;
	Post.findById(postId)
		.then((post) => {
			if (!post) {
				const error = new Error("Could not find Post.");
				error.statusCode = 400;
				throw error;
			}
			res.status(200).json({ message: "Post Fetched.", post: post });
		})
		.catch((err) => {
			if (!err.statusCode) {
				err.statusCode = 500;
			}
			next(err);
		});
};

exports.updatePost = (req, res, next) => {
	const postId = req.params.postId;
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const error = new Error("Validation Failed, Entered data is incorrect");
		error.statusCode = 422;
		throw error;
	}
	const title = req.body.title;
	const content = req.body.content;
	let imageUrl = req.body.image;
	if (req.file) {
		imageUrl = req.file.path;
	}
	if (!imageUrl) {
		const error = new Error("No file Picked.");
		error.statusCode(422);
		throw error;
	}

	Post.findById(postId)
		.then((post) => {
			if (!post) {
				const error = new Error("Could not find Post.");
				error.statusCode(400);
				throw error;
			}
			if (imageUrl !== post.imageUrl) {
				clearImage(post.imageUrl);
			}
			post.title = title;
			post.imageUrl = imageUrl;
			post.content = content;
			return post.save();
		})
		.then((result) => {
			res.status(200).json({
				message: "Post Updated",
				post: result,
			});
		})
		.catch((err) => {
			if (!err.statusCode) {
				err.statusCode = 500;
			}
			next(err);
		});
};

const clearImage = (filePath) => {
	filePath = path.join(__dirname, "..", filePath);
	console.log(filePath);
	fs.unlink(filePath, (err) => console.log(err));
};
