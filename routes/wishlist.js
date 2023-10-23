const router = require("express").Router();
const ctrls = require("../controllers/wishlist");

const { verifyAccessToken } = require("../middleware/verifyToken");

//add product to wishlist
router.post("/", [verifyAccessToken], ctrls.addToWishlist);

//get wishlist
router.get("/", [verifyAccessToken], ctrls.getWishlist);
// //delete one product from wishlist
router.delete("/:pid", [verifyAccessToken], ctrls.deleteWishlist);

module.exports = router;
