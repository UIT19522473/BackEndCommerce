const userRouter = require("./user");
const productRouter = require("./product");
const { notFound, errHandler } = require("../middleware/errHandler");

const initRoutes = (app) => {
  app.use("/api/user", userRouter);
  app.use("/api/product", productRouter);

  //routes handler when error
  app.use(notFound);
  app.use(errHandler);
};

module.exports = initRoutes;
