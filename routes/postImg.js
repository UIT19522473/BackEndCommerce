const ctrls = require("../controllers/postImg");
const router = require("express").Router();

//create new product
router.post("/", ctrls.postImg);

module.exports = router;
