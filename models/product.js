const mongoose = require("mongoose"); // Erase if already required

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

    price: {
      type: Number,
      required: true,
    },

    quantity: {
      type: Number,
      default: 0,
    },
    sold: {
      type: Number,
      default: 0,
    },

    images: {
      type: Array,
    },
    color: {
      type: Array,
      // enum: ["Black", "Grown", "Red"],
    },
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
        comment: { type: String },
      },
    ],
    totalRatings: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

//Export the model
module.exports = mongoose.model("Product", productSchema);
