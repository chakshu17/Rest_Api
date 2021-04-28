const { RSA_NO_PADDING } = require("constants");
const { validationResult } = require("express-validator");

const fs = require("fs");
const path = require("path");

const io = require("../socket");
const Post = require("../models/post");
const User = require("../models/user");

exports.getPosts = async (req, res, next) => {
	const currentPage = req.query.page || 1;
	const perPage = 2;
	let totalItems;
	try {
		const totalItems = await Post.find().countDocuments();

		const posts = await Post.find()
			.populate("creator")
			.skip((currentPage - 1) * perPage)
			.limit(perPage);

		res.status(200).json({
			message: "Fetched PostsSuccessfully.",
			posts: posts,
			totalItems: totalItems,
		});
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};

exports.createPost = async (req, res, next) => {
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
	let creator;
	console.log(req.userId);
	const post = new Post({
		title: title,
		content: content,
		imageUrl: imageUrl,
		creator: req.userId,
	});
	// console.log(post);
	try {
		await post.save();
		const user = await User.findById(req.userId);

		user.posts.push(post);

		await user.save();
		io.getIO().emit("posts", {
			action: "create",
			post: { ...post._doc, creator: { _id: req.userId, name: user.name } },
		});

		res.status(201).json({
			message: "Post Created Successfully",
			post: post,
			creator: { _id: user._id, name: user.name },
		});
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
	// create post in db
};

exports.getPost = async (req, res, next) => {
	const postId = req.params.postId;
	const post = await Post.findById(postId);
	try {
		if (!post) {
			const error = new Error("Could not find Post.");
			error.statusCode = 400;
			throw error;
		}
		res.status(200).json({ message: "Post Fetched.", post: post });
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};

exports.updatePost = async (req, res, next) => {
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
	try {
		const post = await Post.findById(postId);

		if (!post) {
			const error = new Error("Could not find Post.");
			error.statusCode = 400;
			throw error;
		}
		if (post.creator.toString() !== req.userId) {
			const error = new Error("Not Authorized.");
			error.statusCode = 403;
			throw error;
		}
		if (imageUrl !== post.imageUrl) {
			clearImage(post.imageUrl);
		}
		post.title = title;
		post.imageUrl = imageUrl;
		post.content = content;
		const result = await post.save();

		res.status(200).json({
			message: "Post Updated",
			post: result,
		});
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};

exports.deletePost = async (req, res, next) => {
	const postId = req.params.postId;
	try {
		const post = await Post.findById(postId);
		if (!post) {
			const error = new Error("Could not find Post.");
			error.statusCode = 400;
			throw error;
		}
		if (post.creator.toString() !== req.userId) {
			const error = new Error("Not Authorized.");
			error.statusCode = 403;
			throw error;
		}
		//checked Loggedin User
		clearImage(post.imageUrl);
		await Post.findByIdAndRemove(postId);

		const user = await User.findById(req.userId);

		user.posts.pull(postId);
		await user.save();

		res.status(200).json({ message: "Post Deleted." });
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};

const clearImage = (filePath) => {
	filePath = path.join(__dirname, "..", filePath);
	console.log(filePath);
	fs.unlink(filePath, (err) => console.log(err));
};
