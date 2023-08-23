const ctrls = require("../controllers/payment");
const router = require("express").Router();
const { verifyAccessToken } = require("../middleware/verifyToken");

//payment by stripe
// router.post("/", [verifyAccessToken, isAdmin], ctrls.createProduct);
router.post("/", verifyAccessToken, ctrls.createPayment);

module.exports = router;
