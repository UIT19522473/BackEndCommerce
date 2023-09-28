const router = require("express").Router();
const ctrls = require("../controllers/cart");

const { verifyAccessToken } = require("../middleware/verifyToken");

//add product to cart
router.post("/add-to-cart", [verifyAccessToken], ctrls.addToCart);
//update quantity to cart
router.put(
  "/update-quantity-to-cart",
  [verifyAccessToken],
  ctrls.updateQuantityToCart
);
//get cart
router.get("/get-cart", [verifyAccessToken], ctrls.getCart);
//delete one product from cart
router.put("/delete-one-cart", [verifyAccessToken], ctrls.deleteOneCart);

module.exports = router;
