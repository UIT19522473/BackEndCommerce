const ctrls = require("../controllers/product");
const router = require("express").Router();
const { verifyAccessToken, isAdmin } = require("../middleware/verifyToken");

//create new product
router.post("/", [verifyAccessToken, isAdmin], ctrls.createProduct);

//get all product
router.get("/", ctrls.getProducts);

//test
router.get("/test", ctrls.testFunc);
//ratings
router.put("/ratings", verifyAccessToken, ctrls.ratings);

//update product
router.put("/:pid", [verifyAccessToken, isAdmin], ctrls.updateProduct);
//update product
router.delete("/:pid", [verifyAccessToken, isAdmin], ctrls.deleteProduct);
//get one product by id
router.get("/:pid", ctrls.getProduct);

module.exports = router;
