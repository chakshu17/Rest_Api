const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
	const authHeader = req.get("Authorization");
	if (!authHeader) {
		const error = new Error("Not Authenticated.");
		error.statusCode = 401;
		throw error;
	}
	const token = authHeader.split(" ")[1];
	let decodedToken;
	try {
		decodedToken = jwt.verify(token, "somesupersecretsecret");
	} catch (err) {
		err.status = 500;
		throw err;
	}
	if (!decodedToken) {
		const error = new Error("Not Authenticated.");
		error.statusCode = 401;
		throw error;
	}
	// console.log("token", decodedToken);
	req.userId = decodedToken.userId;
	// console.log("req", req.userId);
	next();
};
