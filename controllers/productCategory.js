const ProductCategory = require("../models/productCategory");

const asyncHandler = require("express-async-handler");

//CRUD

//Create

const createProductCategory = asyncHandler(async (req, res) => {
  const response = await ProductCategory.create(req.body);
  return res.status(200).json({
    success: response ? true : false,
    createdCategory: response ? response : "cannot create new category",
  });
});

//get all categories
const getCategories = asyncHandler(async (req, res) => {
  const response = await ProductCategory.find().select("title", "_id");
  return res.status(200).json({
    success: response ? true : false,
    getCategories: response ? response : "cannot get all categories",
  });
});

//update
const updateCategory = asyncHandler(async (req, res) => {
  const { pcid } = req.params;
  const response = await ProductCategory.findByIdAndUpdate(pcid, req.body, {
    new: true,
  });
  return res.status(200).json({
    success: response ? true : false,
    updatedCategory: response ? response : "cannot update category",
  });
});

//remove
const deleteProductCategory = asyncHandler(async (req, res) => {
  const { pcid } = req.params;

  const response = await ProductCategory.findByIdAndDelete(pcid);

  return res.status(200).json({
    success: response ? true : false,
    deletedCategory: response ? response : "cannot delete category",
  });
});

module.exports = {
  createProductCategory,
  deleteProductCategory,
  getCategories,
  updateCategory,
};
