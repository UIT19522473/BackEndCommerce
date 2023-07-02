const User = require("../models/user");
const asyncHandler = require("express-async-handler");
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
  const { email, password, firstname, lastname, mobile } = req.body;

  if (!email || !password || !firstname || !lastname || !mobile) {
    return res.status(400).json({
      success: false,
      mes: {
        warning: "Missing Input",
        email: checkNullInfor(email),
        password: checkNullInfor(password),
        firstname: checkNullInfor(firstname),
        lastname: checkNullInfor(lastname),
        mobile: checkNullInfor(mobile),
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
  if (findUser && (await findUser.isCorrectPassword(password))) {
    //split password and role from findUser
    const { password, role, ...userData } = findUser.toObject();

    //create accessToekn
    const accessToken = generateAccessToken(userData._id, role);

    // create refreshToken
    const refreshToken = generateRefreshToken(userData._id);

    // save the refresh token into the database
    await User.findByIdAndUpdate(userData._id, { refreshToken }, { new: true });

    //save the refresh token into the cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({ success: true, accessToken, userData });
  } else {
    throw new Error("Invalid credentials!");
  }
});

// get one user
const getCurrent = asyncHandler(async (req, res) => {
  const { _id } = req.user;

  const user = await User.findById(_id).select("-refreshToken -password -role");
  return res
    .status(200)
    .json({ success: true, rs: user ? user : "user not found" });
});

//refreshAccessToken when it is expried
const refreshAccessToken = asyncHandler(async (req, res) => {
  //get token from cookie
  const cookie = req.cookies;
  //check token yes or no
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
  res.clearCookie("refreshToken", { httpOnly: true, secure: true });

  return res.status(200).json({ success: true, mes: "LogOut is done" });
});

module.exports = {
  register,
  login,
  getCurrent,
  refreshAccessToken,
  logout,
};
