const express = require("express");
const { body } = require("express-validator/check");

const User = require("../models/user");

const authController = require("../controllers/auth");
const router = express.Router();

router.put("/signup", [
	body("email")
		.isEmail()
		.withMessage("Please Enter valid email")
		.custom((value, { req }) => {
			return User.findOne({ email: value }).then((userDoc) => {
				if (userDoc) {
					return Promise.reject("Email address already Exist");
				}
			});
		})
		.normalizeEmail(),
	body("password").trim().isLength({ min: 5 }),
	body("name").trim().not().notEmpty(),
	authController.signup,
]);

module.exports = router;
