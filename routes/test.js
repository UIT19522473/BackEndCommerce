const ctrls = require("../controllers/test");
const router = require("express").Router();
// const { verifyAccessToken, isAdmin } = require("../middleware/verifyToken");

//test route
router.post("/", ctrls.testCookie);

module.exports = router;
