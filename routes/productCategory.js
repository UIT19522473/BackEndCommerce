const ctrls = require("../controllers/productCategory");
const router = require("express").Router();
const { verifyAccessToken, isAdmin } = require("../middleware/verifyToken");

//create new productCategory
router.post("/", [verifyAccessToken, isAdmin], ctrls.createProductCategory);

//get all categories
router.get("/", ctrls.getCategories);

//delete productCategory
router.delete(
  "/:pcid",
  [verifyAccessToken, isAdmin],
  ctrls.deleteProductCategory
);

module.exports = router;
