const express = require("express");
const { body, check } = require("express-validator");

const User = require("../models/user");

const authController = require("../controllers/auth");
const router = express.Router();

router.put(
	"/signup",
	[
		body("email")
			.isEmail()
			.withMessage("Please enter a valid email.")
			.custom((value, { req }) => {
				return User.findOne({ email: value }).then((userDoc) => {
					// console.log(userDoc);
					if (userDoc) {
						return Promise.reject(
							"Email address already Exist"
						);
					}
				});
			})
			.normalizeEmail(),
		body("password").trim().isLength({ min: 5 }),
		body("name").trim().not().notEmpty(),
	],
	authController.signup
);

router.post("/login", authController.login);

module.exports = router;
