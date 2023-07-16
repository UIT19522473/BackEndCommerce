const mongoose = require("mongoose"); // Erase if already required
const bcrypt = require("bcrypt");
const crypto = require("crypto");

// Declare the Schema of the Mongo model
var userSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    // mobile: {
    //   type: String,
    //   required: true,
    //   unique: true,
    // },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "user",
    },
    cart: {
      type: Array,
      default: [],
    },
    address: [{ type: mongoose.Types.ObjectId, ref: "Address" }],

    wishlist: [{ type: mongoose.Types.ObjectId, ref: "Product" }],

    isBlocked: {
      type: Boolean,
      default: false,
    },

    refreshToken: {
      type: String,
    },

    passwordChangeAt: {
      type: String,
    },

    passwordResetToken: {
      type: String,
    },

    passwordResetExpries: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// hash password before creating new user
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.pre("findOneAndUpdate", async function (next) {
  // console.log("update herre");
  if (!this._update.password) {
    next();
  }
  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);
  this._update.password = await bcrypt.hash(this._update.password, salt);
});

//compare password
userSchema.methods = {
  isCorrectPassword: async function (password) {
    return await bcrypt.compare(password, this.password);
  },

  createPasswordChangedToken: function () {
    const resetToken = crypto.randomBytes(32).toString("hex");
    this.passwordResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    this.passwordResetExpries = Date.now() + 5 * 60 * 1000;
    return resetToken;
  },
};

//Export the model
module.exports = mongoose.model("User", userSchema);
