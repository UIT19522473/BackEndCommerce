const userRouter = require("./user");
const { notFound, errHandler } = require("../middleware/errHandler");

const initRoutes = (app) => {
  app.use("/api/user", userRouter);

  //routes handler when error
  app.use(notFound);
  app.use(errHandler);
};

module.exports = initRoutes;
