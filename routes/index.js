const router = require('express').Router();
const userRoute = require('./users');
const articleRoute = require('./articles');

router.use(userRoute, articleRoute);

module.exports = router;