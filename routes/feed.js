const express = require('express');

const feedController = require('../controllers/feed');

const router = express.Router();

// GEt /feed/posts
router.get('/posts', feedController.getPosts);

module.exports = router