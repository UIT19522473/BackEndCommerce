const User = require("../models/user");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");

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
    const { password, role, ...userData } = findUser.toObject();
    return res.status(200).json({ success: true, userData });
  } else {
    throw new Error("Invalid credentials!");
  }
});

module.exports = {
  register,
  login,
};
