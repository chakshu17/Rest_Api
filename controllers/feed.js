exports.getPosts = (req, res, next) => {
	res.status(200).json({
		posts: [
			{
				_id: "",
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
	const title = req.body.title;
	const content = req.body.content;
	// create post in db
	res.status(201).json({
		message: "Post Created Successfully",
		post: {
			_id: new Date().toISOString(),
			title: title,
			content: content,
			creator: { name: "Chakshu" },
			createdAt: new Date(),
		},
	});
};
