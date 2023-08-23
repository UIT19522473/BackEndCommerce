const Product = require("../models/product");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const productCategory = require("../models/productCategory");
const brand = require("../models/brand");
const coupon = require("../models/coupon");
const product = require("../models/product");

//create product by admin
const createProduct = asyncHandler(async (req, res) => {
  if (Object.keys(req.body).length === 0) throw new Error("Missing Input");
  if (req.body && req.body.title) {
    req.body.slug = slugify(req.body.title);
  }
  const { idCategory, idBrand, idCoupon, ...data } = req.body;

  const categoryFind = await productCategory.findById(idCategory);
  const brandFind = await brand.findById(idBrand);
  const couponFind = idCoupon ? await coupon.findById(idCoupon) : false;
  // console.log(couponFind);

  if (!categoryFind) {
    return res.status(200).json({
      success: false,
      createdProduct: "Cannot create new product - id category error",
    });
  }
  if (!brandFind) {
    return res.status(200).json({
      success: false,
      createdProduct: "Cannot create new product - id brand error",
    });
  }

  if (categoryFind && brandFind) {
    const newProduct = await Product.create({
      ...data,
      category: categoryFind._id,
      brand: brandFind._id,
      coupon: couponFind ? couponFind._id : null,
    });
    return res.status(200).json({
      success: newProduct ? true : false,
      createdProduct: newProduct ? newProduct : "Cannot create new product",
    });
  }

  return res.status(200).json({
    success: false,
    createdProduct: "Cannot create new product",
  });
});

//get one product
const getProduct = asyncHandler(async (req, res) => {
  const { pid } = req.params;

  const product = await Product.findById(pid).populate([
    "coupon",
    "category",
    "brand",
  ]);

  return res.status(200).json({
    success: product ? true : false,
    productData: product ? product : "Cannot get product",
  });
});

//get all product (filtering, sorting, pagination)

//test
const testFunc = asyncHandler(async (req, res) => {
  const queries = { ...req.query };
  // split special fields form query
  console.log(queries);
  const excludeFields = ["limit", "sort", "page", "fields"];
  excludeFields.forEach((el) => delete queries[el]);
  let queryString = JSON.stringify(queries);

  try {
    queryString = queryString.replace(
      /\b(gte|gt|lt|lte)\b/g,
      (matchedEl) => `$${matchedEl}`
    );
  } catch (error) {
    throw new Error(error);
  }

  const formatedQueries = JSON.parse(queryString);

  //filtering
  if (queries?.title) {
    formatedQueries.title = { $regex: queries.title, $options: "i" };
  }
  console.log(formatedQueries);
  res.status(200).json({ mes: queries });
});

//test ends here

const getProducts = asyncHandler(async (req, res) => {
  const queries = { ...req.query };
  const { category, brand, avail, minPrice, maxPrice, color, size, title } =
    queries;

  const dynamicQuery = {};

  if (category) {
    dynamicQuery.category = { $in: category.split(",") };
  }

  if (brand) {
    dynamicQuery.brand = { $in: brand.split(",") };
  }

  if (minPrice && maxPrice) {
    dynamicQuery.price = {
      $gt: parseInt(minPrice),
      $lt: parseInt(maxPrice),
    };
  } else if (minPrice) {
    dynamicQuery.price = {
      $gt: parseInt(minPrice),
    };
  } else if (maxPrice) {
    dynamicQuery.price = {
      $lt: parseInt(maxPrice),
    };
  }

  if (color) {
    dynamicQuery.color = { $in: color.split(",") };
  }

  if (size) {
    dynamicQuery.size = { $in: size.split(",") };
  }

  if (title) {
    dynamicQuery.title = { $regex: title, $options: "i" };
  }

  try {
    const response = await product.find(dynamicQuery);
    res.status(200).json({
      success: response ? true : false,
      counts: response ? response?.length : 0,
      products: response ? response : "Cannot get products",
    });
  } catch (error) {
    res.status(500).json({ success: false, mes: error.message });
  }

  // res.status(200).json(response);
});

// const getProducts = asyncHandler(async (req, res) => {
//   const queries = { ...req.query };
//   // console.log(queries);
//   // split special fields form query
//   const excludeFields = ["limit", "sort", "page", "fields"];
//   excludeFields.forEach((el) => delete queries[el]);

//   //format operators true syntax of mongoose
//   let queryString = JSON.stringify(queries);

//   // const products = await Product.find(queries);
//   try {
//     queryString = queryString.replace(
//       /\b(gte|gt|lt|lte)\b/g,
//       (matchedEl) => `$${matchedEl}`
//     );
//   } catch (error) {
//     throw new Error(error);
//   }

//   const formatedQueries = JSON.parse(queryString);

//   // console.log(formatedQueries);

//   //filtering
//   if (queries?.title) {
//     formatedQueries.title = { $regex: queries.title, $options: "i" };
//   }
//   if (queries?.category) {
//     const categoryFind = await productCategory.findById(queries?.category);
//     if (categoryFind) {
//       formatedQueries.category = categoryFind._id;
//     } else {
//       delete formatedQueries.category;
//     }
//   }

//   // console.log(formatedQueries);

//   let queryCommand = Product.find(formatedQueries).populate([
//     "coupon",
//     "category",
//     "brand",
//   ]);

//   //sorting
//   if (req.query.sort) {
//     const sortBy = req.query.sort.split(",").join(" ");
//     queryCommand = queryCommand.sort(sortBy);
//   }

//   //fields limiting
//   if (req.query.fields) {
//     const fields = req.query.fields.split(",").join(" ");
//     queryCommand = queryCommand.select(fields);
//   }

//   //pagination
//   //limit: object number has in one page
//   //skip: number want to skip
//   const page = req.query.page * 1 || 1;
//   const limit = req.query.limit * 1 || process.env.LIMIT_PRODUCT;
//   const skip = (page - 1) * limit;

//   queryCommand.skip(skip).limit(limit);

//   //querryCommand excute
//   queryCommand
//     .then(async (response) => {
//       // if (err) throw new Error(err.message);
//       const counts = await Product.find(formatedQueries).countDocuments();

//       // test
//       // res.cookie("test", "test 2222", {
//       //   httpOnly: false,
//       //   maxAge: 7 * 24 * 60 * 60 * 1000,
//       // });

//       return res.status(200).json({
//         success: response ? true : false,
//         counts,
//         products: response ? response : "Cannot get products",
//       });
//     })
//     .catch((err) => {
//       res.status(500).json({ success: false, mes: err.message });
//     });
// });

//update Product
const updateProduct = asyncHandler(async (req, res) => {
  const { pid } = req.params;

  if (req.body && req.body.title) req.body.slug = slugify(req.body.title);
  const updatedProduct = await Product.findByIdAndUpdate(pid, req.body, {
    new: true,
  });

  return res.status(200).json({
    success: updatedProduct ? true : false,
    updatedProduct: updatedProduct ? updatedProduct : "Cannot update products",
  });
});

//delete Product
const deleteProduct = asyncHandler(async (req, res) => {
  const { pid } = req.params;
  const deletedProduct = await Product.findByIdAndDelete(pid);

  return res.status(200).json({
    success: deletedProduct ? true : false,
    deletedProduct: deletedProduct ? deletedProduct : "Cannot update products",
  });
});

//rating product by User
const ratings = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { star, comment, pid } = req.body;

  if (!star || !pid) throw new Error("Missing Input");

  const ratingProduct = await Product.findById(pid);
  const alreadyRating = ratingProduct?.ratings?.find(
    (el) => el.postedBy.toString() === _id.toString()
  );

  if (alreadyRating) {
    await Product.findOneAndUpdate(
      { _id: pid, "ratings.postedBy": _id },
      { $set: { "ratings.$.star": star, "ratings.$.comment": comment } },
      { new: true }
    );
  } else {
    await Product.findByIdAndUpdate(
      pid,
      {
        $push: { ratings: { star, comment, postedBy: _id } },
      },
      { new: true }
    );
  }

  //update totalratings
  const updatedProduct = await Product.findById(pid);
  const ratingCount = updatedProduct.ratings.length;
  const sumRatings = updatedProduct.ratings.reduce(
    (sum, el) => sum + el.star,
    0
  );

  console.log(sumRatings);
  updatedProduct.totalRatings =
    Math.round((sumRatings * 10) / ratingCount) / 10;
  await updatedProduct.save();

  return res.status(200).json({ status: true });
});

module.exports = {
  createProduct,
  getProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  ratings,
  testFunc,
};
