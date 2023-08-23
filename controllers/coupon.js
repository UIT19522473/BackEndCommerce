const Coupon = require("../models/coupon");

const asyncHandler = require("express-async-handler");

//CRUD

//Create
const createCoupon = asyncHandler(async (req, res) => {
  const response = await Coupon.create(req.body);
  return res.status(200).json({
    success: response ? true : false,
    createdCoupon: response ? response : "cannot create new coupon",
  });
});

//get all categories
const getCoupons = asyncHandler(async (req, res) => {
  const response = await Coupon.find().select("title", "_id");
  return res.status(200).json({
    success: response ? true : false,
    getCoupons: response ? response : "cannot get all coupons",
  });
});

//update
const updateCoupon = asyncHandler(async (req, res) => {
  const { cid } = req.params;
  const response = await Coupon.findByIdAndUpdate(cid, req.body, {
    new: true,
  });
  return res.status(200).json({
    success: response ? true : false,
    updatedCoupon: response ? response : "cannot update coupon",
  });
});

//remove
const deleteCoupon = asyncHandler(async (req, res) => {
  const { cid } = req.params;

  const response = await Coupon.findByIdAndDelete(cid);

  return res.status(200).json({
    success: response ? true : false,
    deletedCoupon: response ? response : "cannot delete coupon",
  });
});

module.exports = {
  createCoupon,
  deleteCoupon,
  getCoupons,
  updateCoupon,
};
