const ctrls = require("../controllers/product");
const router = require("express").Router();
const { verifyAccessToken, isAdmin } = require("../middleware/verifyToken");

//test
router.get("/test", ctrls.testFunc);

// get stock status
router.get("/stock-status", ctrls.getStockStatus);
//get unique color
router.get("/color-size", ctrls.getColorsSizes);

//create new product
router.post("/", [verifyAccessToken, isAdmin], ctrls.createProduct);

//get all product
router.get("/", ctrls.getProducts);
//get ratings
router.get("/ratings/:pid", ctrls.getRatings);

//test update all variant
router.get(
  "/update-all-variant",
  [verifyAccessToken, isAdmin],
  ctrls.updateAllVariant
);
//test update all variant

//ratings
router.put("/ratings", verifyAccessToken, ctrls.ratings);

//update product
router.put("/:pid", [verifyAccessToken, isAdmin], ctrls.updateProduct);
//update product
router.delete("/:pid", [verifyAccessToken, isAdmin], ctrls.deleteProduct);
//get one product by id
router.get("/:pid", ctrls.getProduct);

module.exports = router;
