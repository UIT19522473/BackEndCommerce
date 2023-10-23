const asyncHandler = require("express-async-handler");
const Product = require("../models/product");
const User = require("../models/user");

const addToWishlist = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { idProduct } = req.body;

  try {
    if (!idProduct) {
      throw new Error("Missing input");
    }

    const product = await Product.findById(idProduct);
    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { wishlist: idProduct } },
      { new: true } // Trả về tài khoản đã cập nhật
    );

    if (updatedUser) {
      return res.status(200).json({
        message: "Sản phẩm đã được thêm vào wishlist",
        data: updatedUser.wishlist,
      });
    } else {
      return res
        .status(500)
        .json({ message: "Lỗi khi thêm sản phẩm vào wishlist" });
    }
  } catch (error) {
    console.error("Lỗi khi thêm sản phẩm vào wishlist:", error);
    return res
      .status(500)
      .json({ message: "Lỗi khi thêm sản phẩm vào wishlist" });
  }
});

const getWishlist = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  try {
    const wishListByUser = await User.findById(userId).populate({
      path: "wishlist",
      // Populate trường coupon trong sản phẩm của danh sách wishlist
      populate: { path: "coupon" },
    });

    return res.status(200).json({
      message: "Lay danh sach wishlist thanh cong",
      data: wishListByUser.wishlist,
    });
  } catch (error) {
    console.error("Lỗi khi lay wishlist:", error);
    return res
      .status(500)
      .json({ message: "Lỗi khi thêm sản phẩm vào wishlist" });
  }
});

const deleteWishlist = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { pid } = req.params;

  try {
    if (!pid) {
      return res.status(400).json({ message: "Missing productId" });
    }

    const wishListRemoved = await User.findByIdAndUpdate(userId, {
      $pull: { wishlist: pid },
    });

    if (wishListRemoved) {
      const updatedUser = await User.findById(userId).populate("wishlist");

      if (updatedUser) {
        return res.status(200).json({
          message: "Xóa sản phẩm khỏi wishlist thành công",
          data: updatedUser.wishlist,
        });
      }
    }

    console.error("Lỗi khi xóa sản phẩm khỏi wishlist");
    return res
      .status(500)
      .json({ message: "Lỗi khi xóa sản phẩm khỏi wishlist" });
  } catch (error) {
    console.error("Lỗi khi xóa sản phẩm khỏi wishlist:", error);
    return res
      .status(500)
      .json({ message: "Lỗi khi xóa sản phẩm khỏi wishlist" });
  }
});

module.exports = { addToWishlist, getWishlist, deleteWishlist };
