const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product", // Liên kết với Schema sản phẩm
    required: true,
  },
  variant: {
    color: { type: String },
    size: { type: String },
    price: { type: Number },
  },
  quantity: {
    type: Number,
    required: true,
    default: 1, // Số lượng mặc định khi thêm sản phẩm vào giỏ hàng
  },
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Liên kết với Schema người dùng
    required: true,
  },
  items: [cartItemSchema], // Mảng các sản phẩm trong giỏ hàng
  count: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
});

const Cart = mongoose.model("Cart", cartSchema);

module.exports = Cart;
