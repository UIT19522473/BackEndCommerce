const ctrls = require("../controllers/brand");
const router = require("express").Router();
const { verifyAccessToken, isAdmin } = require("../middleware/verifyToken");

//create new productBrand
router.post("/", [verifyAccessToken, isAdmin], ctrls.createBrand);

//get all brands
router.get("/", ctrls.getBrands);

//delete productBrand
router.delete("/:bid", [verifyAccessToken, isAdmin], ctrls.deleteBrand);

module.exports = router;
