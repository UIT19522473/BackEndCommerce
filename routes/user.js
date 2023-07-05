const ctrls = require("../controllers/user");

const router = require("express").Router();

const { verifyAccessToken, isAdmin } = require("../middleware/verifyToken");

//route register
router.post("/register", ctrls.register);

//route login
router.post("/login", ctrls.login);

//refresh token
router.post("/refreshtoken", ctrls.refreshAccessToken);
//logout
router.post("/logout", verifyAccessToken, ctrls.logout);

//send email forgot-password
router.post("/forgotpassword", ctrls.forgotPassword);
//reset password
router.put("/reset-password", ctrls.resetPassword);

// CRUD User

//get user
//get current user
router.get("/current", verifyAccessToken, ctrls.getCurrent);
//get all user
router.get("/", [verifyAccessToken, isAdmin], ctrls.getUsers);
//delete user
router.delete("/", [verifyAccessToken, isAdmin], ctrls.deleteUser);
//update user own
router.put("/current", verifyAccessToken, ctrls.updateUser);
//update user by admin
router.put("/:uid", [verifyAccessToken, isAdmin], ctrls.updateUserByAdmin);

module.exports = router;
