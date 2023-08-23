// firebase test here
const axios = require("axios");
const fs = require("fs");
const path = require("path");

const postImg = async (req, res) => {
  const apiKey = "AIzaSyCmcXHOKnIaS6FnyCyJhMcBqWytGKKWHX4";
  const bucketName = "e-commerce-27217.appspot.com"; // Replace with your bucket name

  const filePath = "C:\\Users\\TuanNguyen\\OneDrive\\Desktop\\contactus.png";
  // const fileExtension = filePath.split(".").pop();
  const fileName = `images/image_${Date.now()}${path.extname(filePath)}`;

  const fileStream = fs.createReadStream(filePath);

  const storageUrl = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o`;
  const storageParams = `?uploadType=media&name=${encodeURIComponent(
    fileName
  )}&key=${apiKey}`;

  // Xác định Content-Type phù hợp dựa vào phần mở rộng của file
  const contentType = "application/octet-stream";

  axios({
    method: "POST",
    url: `${storageUrl}${storageParams}`,
    headers: {
      "Content-Type": contentType, // Adjust content type based on your image type
    },
    data: fileStream,
  })
    .then(() => {
      // Construct the download URL manually based on the bucket and file path
      const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(
        fileName
      )}?alt=media&token=${apiKey}`;
      //   console.log("Image uploaded and URL:", imageUrl);

      res
        .status(200)
        .json({ success: true, mes: imageUrl ? imageUrl : "no img url" });

      // Now you can store the image's URL or reference in your own database or Firestore.
    })
    .catch((error) => {
      //   console.error("Error uploading image:", error);
      res.status(500).json({ success: false, mes: error.message });
    });
};

module.exports = {
  postImg,
};
