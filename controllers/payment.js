const dotenv = require("dotenv");
dotenv.config();

const stripe = require("stripe")(`${process.env.STRIPE_KEY}`);

const createPayment = async (req, res) => {
  const line_items = req?.body?.listProducts?.map((item) => {
    // Làm một phép chuyển đổi từ USD sang cent
    const amountInUSD = item?.product?.coupon?.value
      ? item?.variant?.price * (1 - item?.product?.coupon?.value / 100) * 100
      : item?.variant?.price * 100;
    const amountInCents = Math.round(amountInUSD); // Chuyển đổi thành cent
    return {
      price_data: {
        currency: "usd",
        product_data: {
          name: item?.product?.title,
          images: item?.product?.images,
          // description: "{size M. color Red} ",
          description: `{color: ${item?.variant?.color}} , {size: ${item?.variant?.size}} `,
          metadata: {
            color: item?.variant?.color, // Thêm thông tin về màu sắc
            size: item?.variant?.size, // Thêm thông tin về kích thước
          },
        },
        // unit_amount: item?.product?.coupon?.value
        //   ? item?.variant?.price *
        //     (1 - item?.product?.coupon?.value / 100) *
        //     100
        //   : item?.variant?.price * 100,
        unit_amount: amountInCents, // Sử dụng giá trị ở dạng cent
      },
      quantity: item?.quantity,
    };
  });

  const session = await stripe.checkout.sessions.create({
    line_items: line_items,
    mode: "payment",
    // success_url: `${process.env.CLIENT_URL}/success`,
    // success_url: `${process.env.CLIENT_URL}/account/login`,
    // cancel_url: `${process.env.CLIENT_URL}/cancel`,
    success_url: `${process.env.CLIENT_URL}/success-payment`,
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
