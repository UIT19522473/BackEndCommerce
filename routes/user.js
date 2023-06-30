const ctrls = require("../controllers/user");

const router = require("express").Router();

//route register
router.post("/register", ctrls.register);

//route login
router.post("/login", ctrls.login);

module.exports = router;
