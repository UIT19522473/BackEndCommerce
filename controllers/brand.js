const Brand = require("../models/brand");

const asyncHandler = require("express-async-handler");

//CRUD

//Create
const createBrand = asyncHandler(async (req, res) => {
  const response = await Brand.create(req.body);
  return res.status(200).json({
    success: response ? true : false,
    createdBrand: response ? response : "cannot create new brand",
  });
});

//get all brands
const getBrands = asyncHandler(async (req, res) => {
  const response = await Brand.find();
  return res.status(200).json({
    success: response ? true : false,
    getBrands: response ? response : "cannot get all brands",
  });
});

//update
const updateBrand = asyncHandler(async (req, res) => {
  const { bid } = req.params;
  const response = await Brand.findByIdAndUpdate(bid, req.body, {
    new: true,
  });
  return res.status(200).json({
    success: response ? true : false,
    updatedBrand: response ? response : "cannot update brand",
  });
});

//remove
const deleteBrand = asyncHandler(async (req, res) => {
  const { bid } = req.params;

  const response = await Brand.findByIdAndDelete(bid);

  return res.status(200).json({
    success: response ? true : false,
    deletedBrand: response ? response : "cannot delete brand",
  });
});

module.exports = {
  createBrand,
  deleteBrand,
  getBrands,
  updateBrand,
  deleteBrand,
};
