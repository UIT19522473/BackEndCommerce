const User = require("../models/user");
const Product = require("../models/product");
const asyncHandler = require("express-async-handler");
const sendMail = require("../utilities/sendMail");
const crypto = require("crypto");

const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utilities/jwt");
const jwt = require("jsonwebtoken");

const checkNullInfor = (data) => {
  return data ? 1 : 0;
};

//register
const register = asyncHandler(async (req, res) => {
  const { email, password, firstname, lastname } = req.body;

  if (!email || !password || !firstname || !lastname) {
    return res.status(400).json({
      success: false,
      mes: {
        warning: "Missing Input",
        email: checkNullInfor(email),
        password: checkNullInfor(password),
        firstname: checkNullInfor(firstname),
        lastname: checkNullInfor(lastname),
      },
    });
  }

  const user = await User.findOne({ email });
  if (user) {
    throw new Error("User has existed");
  } else {
    const newUser = await User.create(req.body);
    return res.status(200).json({
      success: newUser ? true : false,
      mes: newUser ? "Register is successfuly" : "Something went wrong",
    });
  }
});

//login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      mes: {
        warning: "Missing Input",
        email: checkNullInfor(email),
        password: checkNullInfor(password),
      },
    });
  }
  const findUser = await User.findOne({ email: email });

  if (!findUser)
    return res
      .status(200)
      .json({ success: false, mes: "Your account is not registered" });

  if (!(await findUser.isCorrectPassword(password)))
    return res
      .status(200)
      .json({ success: false, mes: "Password is incorrect" });

  if (findUser && (await findUser.isCorrectPassword(password))) {
    //split password and role from findUser
    const { password, role, refreshToken, ...userData } = findUser.toObject();

    //create accessToekn
    const accessToken = generateAccessToken(userData._id, role);

    // create refreshToken
    const newRefreshToken = generateRefreshToken(userData._id);

    // save the refresh token into the database
    await User.findByIdAndUpdate(
      userData._id,
      { refreshToken: newRefreshToken },
      { new: true }
    );

    //save the refresh token into the cookie
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({ success: true, accessToken, userData });
  } else {
    throw new Error("Invalid credentials!");
  }
});

// CRUD USER --------------------------

// get one user
const getCurrent = asyncHandler(async (req, res) => {
  const { _id } = req.user;

  const user = await User.findById(_id).select("-refreshToken -password -role");
  return res
    .status(200)
    .json({ success: user ? true : false, rs: user ? user : "user not found" });
});

//get all user
const getUsers = asyncHandler(async (req, res) => {
  const response = await User.find().select("-refreshToken -password -role");
  return res
    .status(200)
    .json({ success: response ? true : false, users: response });
});

//delete user
const deleteUser = asyncHandler(async (req, res) => {
  const { _id } = req.query;
  if (!_id) throw new Error("Missing inputs");
  const response = await User.findByIdAndDelete(_id);
  return res.status(200).json({
    success: response ? true : false,
    deletedUser: response
      ? `user with email ${response.email} deleted`
      : "No user delete",
  });
});

//update user
const updateUser = asyncHandler(async (req, res) => {
  const { _id } = req.user;

  if (!_id || Object.keys(req.body).length === 0)
    throw new Error("Missing inputs");
  const response = await User.findOneAndUpdate({ _id }, req.body, {
    new: true,
  }).select("-password -role");
  return res.status(200).json({
    success: response ? true : false,
    updatedUser: response ? response : "Some thing went wrong",
  });
});

//updateUserByAdmin
const updateUserByAdmin = asyncHandler(async (req, res) => {
  const { uid } = req.params;

  if (Object.keys(req.body).length === 0) throw new Error("Missing inputs");
  const response = await User.findOneAndUpdate({ uid }, req.body, {
    new: true,
  }).select("-password -role");
  return res.status(200).json({
    success: response ? true : false,
    updatedUser: response ? response : "Some thing went wrong",
  });
});

// CRUD USER ENDS HERE---------------

//refreshAccessToken when it is expried
const refreshAccessToken = asyncHandler(async (req, res) => {
  //get token from cookie
  const cookie = req.cookies;

  // console.log("refreshToken", cookie);

  if (!cookie && !cookie.refreshToken) {
    throw new Error("No refreshToken in cookies");
  }
  //check invalid token
  const rs = await jwt.verify(cookie.refreshToken, process.env.JWT_SECRET);
  const response = await User.findOne({
    _id: rs._id,
    refreshToken: cookie.refreshToken,
  });

  return res.status(200).json({
    success: response ? true : false,
    newAccessToken: response
      ? generateAccessToken(response._id, response.role)
      : "Refresh token not matched",
  });
});

// logout
const logout = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie || !cookie.refreshToken) {
    throw new Error("No refresh token in cookies");
  }

  //delete refreshtoken in database
  await User.findOneAndUpdate(
    { refreshToken: cookie.refreshToken },
    { refreshToken: "" },
    { new: true }
  );
  //delete refresh token in browser cookie
  res.clearCookie("refreshToken", { httpOnly: false, secure: true });

  return res.status(200).json({ success: true, mes: "LogOut is done" });
});

//send email forgot password

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.query;
  if (!email) throw new Error("Missing email");
  const user = await User.findOne({ email: email });
  if (!user) throw new Error("User not found");
  const resetToken = user.createPasswordChangedToken();
  await user.save();

  //send mail
  const html = `<p>You have requested a password reset</p>
  <p>If not you, ignore this email.</p>
  <p>To reset your password, please visit the following link:</p>
  <a href="${process.env.URL_SERVER}/api/user/reset-password/${resetToken}">Reset Password</a>`;

  const data = {
    email: email,
    html: html,
  };

  const rs = await sendMail(data);
  return res.status(200).json({ success: rs ? true : false, rs });
});

//route resetPassword
const resetPassword = asyncHandler(async (req, res) => {
  const { password, token } = req.body;

  if (!password || !token) throw new Error("Missing Inputs");

  const passwordResetToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken,
    passwordResetExpries: { $gt: Date.now() },
  });

  if (!user) throw new Error("Invalid reset token");
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordChangeAt = Date.now();
  user.passwordResetExpries = undefined;
  await user.save();

  return res.status(200).json({
    success: user ? true : false,
    mes: user ? "Updated password" : "Something went wrong",
  });
});

//add product to cart here
// const addCart = asyncHandler(async (req, res) => {
//   const { idProduct } = req.body;
//   const { _id } = req.user;

//   if (!idProduct) throw new Error("Missing Inputs");

//   const product = await Product.findById(idProduct.trim());

//   if (!product) throw new Error("No have a product");

//   const response = await User.findByIdAndUpdate(_id, {
//     $push: { cart: product },
//   });
//   return res.status(200).json({
//     success: response ? true : false,
//     mes: response ? "Add a product to cart" : "Something went wrong",
//   });
// });

const addCart = asyncHandler(async (req, res) => {
  // console.log(req.body);
  const { listProduct } = req.body;
  const { _id } = req.user;

  if (!listProduct) throw new Error("Missing Inputs");

  const response = await User.findByIdAndUpdate(_id, {
    // $push: { cart: product },
    cart: listProduct,
  });
  return res.status(200).json({
    success: response ? true : false,
    mes: response ? "Add a product to cart" : "Something went wrong",
  });
});

const getCart = asyncHandler(async (req, res) => {
  // console.log(req.body);
  // const { listProduct } = req.body;
  const { _id } = req.user;

  // if (!listProduct) throw new Error("Missing Inputs");

  const response = await User.findById(_id);
  return res.status(200).json({
    success: response ? true : false,
    data: response ? response.cart : [],
    mes: response ? "get cart success" : "Something went wrong",
  });
});

const removeCart = asyncHandler(async (req, res) => {
  // console.log(req.body);
  // const { listProduct } = req.body;
  const { _id } = req.user;

  const response = await User.findByIdAndUpdate(_id, {
    cart: [],
  });
  return res.status(200).json({
    success: response ? true : false,
    mes: response ? "Remove cart success" : "Something went wrong",
  });
});

//add product to cart ends here----------

module.exports = {
  register,
  login,
  getCurrent,
  refreshAccessToken,
  logout,
  forgotPassword,
  resetPassword,
  addCart,
  getCart,
  removeCart,

  getUsers,
  deleteUser,
  updateUser,
  updateUserByAdmin,
};
