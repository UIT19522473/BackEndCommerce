const mongoose = require("mongoose"); // Erase if already required

const variantSchema = new mongoose.Schema({
  color: {
    type: String,
    required: true,
  },
  size: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  stock: {
    type: Number,
    required: true,
  },
  // Bất kỳ thuộc tính khác của biến thể
});

// Declare the Schema of the Mongo model
var productSchema = new mongoose.Schema(
  {
    tags: { type: Array },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: true,
    },

    sold: {
      type: Number,
      default: 0,
    },

    images: {
      type: Array,
    },

    //price: {
    //  type: Number,
    //  required: true,
    // },
    // quantity: {
    //   type: Number,
    //   default: 0,
    // },
    // color: {
    //   type: Array,
    //   // enum: ["Black", "Grown", "Red"],
    // },
    coupon: {
      type: mongoose.Types.ObjectId,
      ref: "Coupon",
    },
    category: {
      type: mongoose.Types.ObjectId,
      ref: "ProductCategory",
    },
    brand: {
      type: mongoose.Types.ObjectId,
      ref: "Brand",
    },
    ratings: [
      {
        star: { type: Number },
        postedBy: { type: mongoose.Types.ObjectId, ref: "User" },
        title: { type: String },
        comment: { type: String },
        createAt: { type: String },
      },
    ],
    totalRatings: {
      type: Number,
      default: 0,
    },

    variants: [variantSchema], // Mảng các biến thể của sản phẩm
  },
  { timestamps: true }
);

//Export the model
module.exports = mongoose.model("Product", productSchema);
