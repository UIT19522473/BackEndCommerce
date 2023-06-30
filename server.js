const express = require("express");
const dbConnect = require("./config/dbconnect");
const initRoutes = require("./routes");

const dotenv = require("dotenv");

//config .env
dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//connect database
dbConnect();

//routers
initRoutes(app);

//listening port
const port = process.env.PORT || 8888;
app.listen(port, () => {
  console.log("Listening in the port: " + port);
});
