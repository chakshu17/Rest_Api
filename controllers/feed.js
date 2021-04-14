const { validationResult } = require("express-validator/check");

const Post = require("../models/post");

exports.getPosts = (req, res, next) => {
	res.status(200).json({
		posts: [
			{
				_id: "1",
				title: "First Posts",
				content: "This is first Post",
				imageUrl: "images/nke.jpg",
				creator: {
					name: "Chakshu",
				},
				createdAt: new Date(),
			},
		],
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
	const title = req.body.title;
	const content = req.body.content;
	const post = new Post({
		title: title,
		content: content,
		imageUrl: "images/nike.jpg",
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
