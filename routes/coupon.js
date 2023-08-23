const ctrls = require("../controllers/coupon");
const router = require("express").Router();
const { verifyAccessToken, isAdmin } = require("../middleware/verifyToken");

//create new productBrand
router.post("/", [verifyAccessToken, isAdmin], ctrls.createCoupon);

//delete productBrand
router.delete("/:cid", [verifyAccessToken, isAdmin], ctrls.deleteCoupon);

module.exports = router;
