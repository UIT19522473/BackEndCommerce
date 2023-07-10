const ctrls = require("../controllers/productCategory");
const router = require("express").Router();
const { verifyAccessToken, isAdmin } = require("../middleware/verifyToken");

//create new productCategory
router.post("/", [verifyAccessToken, isAdmin], ctrls.createProductCategory);

//delete productCategory
router.delete(
  "/:pid",
  [verifyAccessToken, isAdmin],
  ctrls.deleteProductCategory
);

module.exports = router;
