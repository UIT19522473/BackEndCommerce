const ctrls = require("../controllers/user");

const router = require("express").Router();

const { verifyAccessToken } = require("../middleware/verifyToken");

//route register
router.post("/register", ctrls.register);

//route login
router.post("/login", ctrls.login);

//get user
//get current user
router.get("/current", verifyAccessToken, ctrls.getCurrent);

//refresh token
router.post("/refreshtoken", ctrls.refreshAccessToken);
//logout
router.post("/logout", verifyAccessToken, ctrls.logout);

//send email forgot-password
router.post("/forgotpassword", ctrls.forgotPassword);
//reset password
router.put("/reset-password", ctrls.resetPassword);

module.exports = router;
