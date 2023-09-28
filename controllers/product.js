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
  try {
    const {
      category,
      brand,
      availIn,
      availOut,
      minPrice,
      maxPrice,
      color,
      size,
      title,
    } = req.query;
    const filter = {};

    // Lọc sản phẩm theo category (nếu được cung cấp)
    if (category) {
      filter.category = { $in: category.split(",") };
    }

    // Lọc sản phẩm theo brand (nếu được cung cấp)
    if (brand) {
      filter.brand = { $in: brand.split(",") };
    }

    // Lọc sản phẩm theo màu sắc (nếu được cung cấp)
    if (color) {
      filter["variants.color"] = { $in: color.split(",") };
    }

    // Lọc sản phẩm theo kích thước (nếu được cung cấp)
    if (size) {
      filter["variants.size"] = { $in: size.split(",") };
    }

    // Lọc sản phẩm theo trường avail (có sẵn trong kho hay không)
    // if (avail !== undefined) {
    //   if (avail === "true") {
    //     filter["variants.stock"] = { $gt: 0 };
    //   } else {
    //     filter["variants.stock"] = 0;
    //   }
    // }
    if (availIn) {
      filter["variants.stock"] = { $gt: 0 };
    }
    if (availOut) {
      filter["variants.stock"] = 0;
    }
    if (availIn && availOut) {
      filter["variants.stock"] = { $gt: 0 };
    }

    // Tạo điều kiện cho giá (price) của biến thể
    const priceCondition = {};

    if (minPrice && maxPrice) {
      priceCondition.$gte = parseInt(minPrice);
      priceCondition.$lte = parseInt(maxPrice);
    } else if (minPrice) {
      priceCondition.$gte = parseInt(minPrice);
    } else if (maxPrice) {
      priceCondition.$lte = parseInt(maxPrice);
    }

    if (Object.keys(priceCondition).length > 0) {
      filter["variants.price"] = priceCondition;
    }

    // Lọc sản phẩm theo title (nếu được cung cấp)
    if (title) {
      filter.title = { $regex: title, $options: "i" }; // Sử dụng $regex để tìm kiếm dựa trên title
    }

    const filteredProducts = await Product.find(filter).populate([
      "coupon",
      "category",
      "brand",
    ]);

    res.status(200).json({
      success: true,
      counts: filteredProducts.length,
      products: filteredProducts,
    });
  } catch (error) {
    console.error("Lỗi khi lọc sản phẩm:", error);
    res.status(500).json({ success: false, message: "Lỗi khi lọc sản phẩm" });
  }
});

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
  const { star, title, comment, pid } = req.body;

  if (!star || !pid) throw new Error("Missing Input");

  const ratingProduct = await Product.findById(pid);
  const alreadyRating = ratingProduct?.ratings?.find(
    (el) => el.postedBy.toString() === _id.toString()
  );

  // Tạo một đối tượng Date đại diện cho ngày và giờ hiện tại
  const currentDate = new Date();

  // Lấy ngày, tháng, và năm hiện tại
  const day = currentDate.getDate();
  const month = currentDate.getMonth() + 1; // Lưu ý: getMonth trả về từ 0 (tháng 1) đến 11 (tháng 12)
  const year = currentDate.getFullYear();

  // Tạo chuỗi định dạng mm/dd/yy
  const createAt = `${month}/${day}/${year.toString().slice(-2)}`;

  if (alreadyRating) {
    await Product.findOneAndUpdate(
      { _id: pid, "ratings.postedBy": _id },
      {
        $set: {
          "ratings.$.star": star,
          "ratings.$.title": title,
          "ratings.$.comment": comment,
          "ratings.$.createAt": createAt,
        },
      },
      { new: true }
    );
  } else {
    await Product.findByIdAndUpdate(
      pid,
      {
        $push: { ratings: { star, title, comment, createAt, postedBy: _id } },
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

  // console.log(sumRatings);
  updatedProduct.totalRatings =
    Math.round((sumRatings * 10) / ratingCount) / 10;
  await updatedProduct.save();

  return res.status(200).json({ status: true });
});

//rating product by User
const getRatings = asyncHandler(async (req, res) => {
  const { pid } = req.params;

  if (!pid) throw new Error("Missing Input");

  const ratingProduct = await Product.findById(pid);
  if (!ratingProduct) return res.status(500).json({ status: false });

  return res.status(200).json({
    metadata: {
      totalRatings: ratingProduct.totalRatings,
      ratings: ratingProduct.ratings,
    },
  });
});

const updateAllVariant = asyncHandler(async (req, res) => {
  try {
    const updatedVariants = [
      {
        color: "red",
        size: "S",
        price: 100,
        stock: 50,
      },
      {
        color: "red",
        size: "M",
        price: 110,
        stock: 50,
      },
      {
        color: "red",
        size: "L",
        price: 110,
        stock: 50,
      },
      {
        color: "green",
        size: "M",
        price: 90,
        stock: 55,
      },
      {
        color: "green",
        size: "L",
        price: 90,
        stock: 55,
      },
      {
        color: "green",
        size: "XL",
        price: 90,
        stock: 55,
      },
      {
        color: "yellow",
        size: "L",
        price: 90,
        stock: 60,
      },
      {
        color: "yellow",
        size: "XL",
        price: 90,
        stock: 60,
      },
      {
        color: "yellow",
        size: "XXL",
        price: 90,
        stock: 60,
      },
      // Thêm các biến thể khác nếu cần
    ];

    // Sử dụng .updateMany() để cập nhật toàn bộ sản phẩm
    const result = await Product.updateMany(
      {},
      { $set: { variants: updatedVariants } }
    );

    // result nên chứa thông tin về số lượng sản phẩm đã được cập nhật
    return res
      .status(200)
      .json({ message: `Đã cập nhật ${result.nModified} sản phẩm` });
  } catch (error) {
    console.error("Lỗi khi cập nhật sản phẩm:", error);
    return res.status(500).json({ message: "Lỗi khi cập nhật sản phẩm" });
  }
});

const getStockStatus = asyncHandler(async (req, res) => {
  try {
    // Số lượng sản phẩm còn hàng (stock > 0)
    const productsInStock = await Product.countDocuments({
      "variants.stock": { $gt: 0 },
    });

    // Số lượng sản phẩm đã hết hàng (stock <= 0)
    const productsOutOfStock = await Product.countDocuments({
      "variants.stock": { $lte: 0 },
    });

    return res.status(200).json({
      productsInStock,
      productsOutOfStock,
    });
  } catch (error) {
    // console.error("Lỗi khi lấy thông tin số lượng sản phẩm:");
    return res
      .status(500)
      .json({ message: "Lỗi khi lấy thông tin số lượng sản phẩm" });
  }
});

const getColorsSizes = asyncHandler(async (req, res) => {
  try {
    // Sử dụng aggregation để lấy danh sách màu sắc duy nhất
    const uniqueColors = await Product.aggregate([
      { $unwind: "$variants" }, // Tách các biến thể thành từng dòng
      { $group: { _id: "$variants.color" } }, // Nhóm các màu sắc duy nhất
      { $project: { _id: 0, color: "$_id" } }, // Chọn trường 'color' và loại bỏ '_id'
    ]);

    // Sử dụng aggregation để lấy danh sách kích thước duy nhất và số lượng hiện có của mỗi kích thước
    const uniqueSizesWithQuantity = await Product.aggregate([
      { $unwind: "$variants" }, // Tách các biến thể thành từng dòng
      {
        $group: {
          _id: "$variants.size",
          totalQuantity: { $sum: "$variants.stock" }, // Tính tổng số lượng tồn kho
        },
      }, // Nhóm các kích thước duy nhất và tính tổng số lượng tồn kho
      { $project: { _id: 0, size: "$_id", totalQuantity: 1 } }, // Chọn trường 'size' và 'totalQuantity' và loại bỏ '_id'
    ]);

    return res.status(200).json({ uniqueColors, uniqueSizesWithQuantity });
  } catch (error) {
    console.error(
      "Lỗi khi lấy danh sách màu sắc và kích thước duy nhất:",
      error
    );
    return res.status(500).json({
      message: "Lỗi khi lấy danh sách màu sắc và kích thước duy nhất",
    });
  }
});

module.exports = {
  createProduct,
  getProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  ratings,
  getRatings,
  testFunc,
  updateAllVariant,
  getStockStatus,
  getColorsSizes,
};
