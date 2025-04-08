const cloudinary = require("./configs/cloudinary-config");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

exports.generateReferralCode = async () => {
  // Generate 8 random bytes, convert to base36 (numbers + letters), and ensure uppercase
  const referralCode = crypto.randomBytes(8).toString("hex").toUpperCase();

  console.log("Referral code generated: ", referralCode);
  return referralCode;
};

// Helper function to upload files to Cloudinary
exports.uploadToCloudinary = (file, folder) => {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: folder }, (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result.secure_url);
          }
        }
      )
      .end(file.buffer);
  });
};

exports.generateToken = ({ userId, email }) => {
  const token = jwt.sign({ userId, email }, process.env.JWT_SECRET_KEY);

  return token;
};

exports.getPagination = ({page, limit}) => {
  // Pagination logic
  const pageNumber = parseInt(page, 10);
  const pageSize = parseInt(limit, 10);
  const startIndex = (pageNumber - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  return { pageNumber, pageSize, startIndex, endIndex };
};

exports.sendNotification = async ({token, payload}) => {
  try {
    // Send the notification using Firebase Admin SDK
    const response = await admin.messaging().send({
      token: token,
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: {
        ...payload.data,
      },
    });

    // Log and return success response
    return { success: true, response }; // Return success response as an object
  } catch (error) {
    // Log and return error response
    console.error("Error sending notification:", error);
    return { success: false, error: error.message }; // Return error with success status as false
  }
};

