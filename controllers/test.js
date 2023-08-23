const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");

const testCookie = asyncHandler(async (req, res) => {
  return res.status(200).json({ success: true, mes: req.cookies.refreshToken });
});

module.exports = { testCookie };
