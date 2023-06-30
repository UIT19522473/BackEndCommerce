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

  const respone = await User.create(req.body);

  return res.status(200).json({ success: respone ? true : false, respone });
});

//login
const login = asyncHandler(async (req, res) => {
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
  const findUser = await User.findOne({ email: email });
  if (findUser) {
    const comparePassword = bcrypt.compareSync(password, findUser.password);
    if (comparePassword) {
      return res.status(200).json({ success: true, mes: "login successfully" });
    } else {
      return res
        .status(400)
        .json({ success: false, mes: "password is not exactly" });
    }
  } else {
    return res.status(400).json({ success: false, mes: "User is not exist" });
  }

  // const respone = await User.create(req.body);
});

module.exports = {
  register,
  login,
};
