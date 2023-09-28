const asyncHandler = require("express-async-handler");
const Product = require("../models/product"); // Import model sản phẩm
const Cart = require("../models/cart"); // Import model giỏ hàng
const { ObjectId } = require("mongodb");

// API để thêm sản phẩm vào giỏ hàng của người dùng
const addToCart = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { product, quantity, variant } = req.body;
  const productId = product._id;
  // Cart.create({ user: userId, items: [] });
  // return res.status(200).json("Ok");
  // console.log({ productId, quantity, variant, userId });

  try {
    // Kiểm tra xem sản phẩm có tồn tại không
    const product = await Product.findOne({ _id: productId });
    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }

    // Tìm giỏ hàng của người dùng hoặc tạo mới nếu chưa có
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = await Cart.create({ user: userId, items: [] });
    }

    // Tìm và cập nhật sản phẩm trong giỏ hàng
    const existingCartItem = cart.items.find(
      (item) =>
        item.product.toString() === productId &&
        item.variant.color === variant.color &&
        item.variant.size === variant.size
    );

    if (existingCartItem) {
      // Nếu sản phẩm đã có trong giỏ hàng, tăng số lượng
      existingCartItem.quantity += quantity;
    } else {
      // Nếu sản phẩm chưa có trong giỏ hàng, thêm mới
      cart.items.push({ product: productId, variant, quantity: quantity });
    }

    // Lưu giỏ hàng đã cập nhật vào cơ sở dữ liệu
    const updatedCart = await Cart.findOneAndUpdate(
      { user: userId },
      { items: cart.items },
      { new: true, upsert: true }
    );

    return res.status(200).json({
      message: "Sản phẩm đã được thêm vào giỏ hàng",
      data: updatedCart,
    });
  } catch (error) {
    console.error("Lỗi khi thêm sản phẩm vào giỏ hàng:", error);
    return res
      .status(500)
      .json({ message: "Lỗi khi thêm sản phẩm vào giỏ hàng" });
  }
});

// API để update sản phẩm vào giỏ hàng của người dùng
const updateQuantityToCart = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // console.log(req.body);
  const { product, variant, quantityChange } = req.body;
  const productId = product._id;

  try {
    // Kiểm tra xem sản phẩm có tồn tại không
    const product = await Product.findOne({ _id: productId });
    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }

    // Tìm giỏ hàng của người dùng hoặc tạo mới nếu chưa có
    let cart = await Cart.findOne({ user: userId });
    if (cart) {
      const productIdCheck = new ObjectId(product._id); // Chuyển đổi product._id thành ObjectId
      const indexItemCart = cart.items.findIndex(
        (item) =>
          item.product.toString() === productIdCheck.toString() &&
          item.variant.color === variant.color &&
          item.variant.size === variant.size
      );

      // console.log(itemCart);
      if (indexItemCart !== -1) {
        cart.items[indexItemCart].quantity = quantityChange;
        await cart.save();
        return res.status(200).json({ mess: "update gio hang thanh cong" });
      }
      return res.status(500).json({ mess: "ko cap nhat duoc gio hang" });
    }
    return res.status(500).json({ mess: "ko cap nhat duoc gio hang" });
  } catch (error) {
    return res
      .status(500)
      .json({ mess: "ko cap nhat duoc gio hang" + { error } });
  }
});

const getCart = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  try {
    const response = await Cart.findOne({ user: userId }).populate([
      {
        path: "items.product",
        populate: [{ path: "coupon" }, { path: "brand" }, { path: "category" }],
      },
    ]);
    return res
      .status(200)
      .json({ mess: "get cart success", data: response ? response : null });
  } catch (error) {
    return res.status(500).json({ mess: "get cart error", error: error });
  }
});

const deleteOneCart = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { product, variant } = req.body;

  // Sử dụng findOneAndUpdate để xóa một phần tử từ mảng items dựa trên idProduct và variant
  try {
    // Tìm cart dựa trên cartId và xác định phần tử cần xóa
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ success: false, mes: "Cart not found" });
    }

    // Xác định phần tử cần xóa trong mảng items
    const itemIndexToRemove = cart.items.findIndex((item) => {
      return (
        item.product.toString() === product._id &&
        item.variant.color === variant.color &&
        item.variant.size === variant.size
      );
    });

    // Nếu tìm thấy phần tử thỏa mãn điều kiện, xóa nó khỏi mảng items
    if (itemIndexToRemove !== -1) {
      cart.items.splice(itemIndexToRemove, 1);
    }

    // Lưu lại giỏ hàng sau khi xóa
    const updatedCart = await cart.save();

    // Thành công, trả về giỏ hàng sau khi xóa
    return res.status(200).json({
      success: true,
      mes: "Item removed from cart",
      data: updatedCart,
    });
  } catch (err) {
    // Xử lý lỗi
    console.error(err);
    return res.status(500).json({
      success: false,
      mes: "Error removing item from cart",
      error: err,
    });
  }
});

module.exports = { addToCart, getCart, deleteOneCart, updateQuantityToCart };
