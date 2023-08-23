const dotenv = require("dotenv");
dotenv.config();

const stripe = require("stripe")(`${process.env.STRIPE_KEY}`);

const createPayment = async (req, res) => {
  // console.log(process.env.STRIPE_KEY);
  // console.log("log here", req?.body?.listProducts[0]);
  const line_items = req?.body?.listProducts?.map((item) => {
    return {
      price_data: {
        currency: "usd",
        product_data: {
          name: item?.product?.title,
          images: item?.product?.images,
          description: "{size M. color Red} ",
          metadata: {
            color: "Blue", // Thêm thông tin về màu sắc
            size: "M", // Thêm thông tin về kích thước
          },
        },
        unit_amount: item?.product?.price,
      },
      quantity: 2,
    };
  });

  const session = await stripe.checkout.sessions.create({
    line_items: line_items,
    mode: "payment",
    // success_url: `${process.env.CLIENT_URL}/success`,
    // success_url: `${process.env.CLIENT_URL}/account/login`,
    // cancel_url: `${process.env.CLIENT_URL}/cancel`,
    success_url: `${process.env.CLIENT_URL}`,
    cancel_url: `${process.env.CLIENT_URL}`,
  });

  res.status(200).json({
    success: session ? true : false,
    url: session.url ? session?.url : "url is error",
  });
};

module.exports = {
  createPayment,
};
