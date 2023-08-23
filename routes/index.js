const userRouter = require("./user");
const productRouter = require("./product");
const productCategoryRouter = require("./productCategory");
const paymentRouter = require("./payment");
const brandRouter = require("./brand");
const couponRouter = require("./coupon");

const testRouter = require("./test");
const postImgRouter = require("./postImg");

const router = require("express").Router();

const { notFound, errHandler } = require("../middleware/errHandler");

const initRoutes = (app) => {
  app.use("/api/user", userRouter);
  app.use("/api/product", productRouter);
  app.use("/api/productcategory", productCategoryRouter);
  app.use("/api/payment", paymentRouter);
  app.use("/api/brand", brandRouter);
  app.use("/api/coupon", couponRouter);

  // test---------
  app.use("/api/test", testRouter);
  app.use(
    router.get("/api/test", (req, res) => {
      // res.cookie("testssss", "testoday", {
      //   httpOnly: true,
      //   maxAge: 7 * 24 * 60 * 60 * 1000,
      // });
      res.status(200).json({ success: true, mes: "oke oke" });
    })
  );

  app.use("/api/postImg", postImgRouter);

  // test

  //routes handler when error
  app.use(notFound);
  app.use(errHandler);
};

module.exports = initRoutes;
