const otp = require("./otp.model");

const transporter = require("../../configs/otp-config");

exports.generateOtp = async (email) => {
  const currentTime = new Date();

  // Fetch the existing OTP record for the given email
  const existingOtp = await otp.findOne({ where: { email } });

  // Check if OTP generation is disabled due to previous failed attempts
  if (
    existingOtp?.otpDisabledTime &&
    currentTime < existingOtp.otpDisabledTime
  ) {
    const remainingTime = Math.ceil(
      (existingOtp.otpDisabledTime - currentTime) / 1000
    );
    return {
      code: 409,
      status: false,
      message: `OTP generation is disabled. Try again in ${remainingTime} seconds.`,
    };
  }

  // Generate a new OTP and set expiry time (2 minutes from now)
  const otpCode = Math.floor(1000 + Math.random() * 9000);
  const otpExpiry = new Date(Date.now() + 2 * 60 * 1000);

  // Update existing OTP record or create a new one
  const otpData = {
    email,
    otpCode,
    otpExpiry,
    otpRetries: 2,
    otpDisabledTime: null,
    otpStatus: false, // Reset OTP status to false
  };

  existingOtp
    ? await otp.update(otpData, { where: { email } })
    : await otp.create(otpData);

  // Send OTP via email
  const mailOptions = {
    from: process.env.APP_USER,
    to: email,
    subject: "OTP for Verification",
    text: `Your OTP is ${otpCode}. It will expire in 60 seconds.`,
  };
  await transporter.sendMail(mailOptions);

  return {
    code: 201,
    status: true,
    message: "OTP Generated and Sent Successfully",
    otp: otpCode,
  };
};

exports.verifyOtp = async (email, submittedOtp) => {
  const otpRecord = await otp.findOne({ where: { email } });
  submittedOtp = parseInt(submittedOtp, 10);

  if (!otpRecord)
    return {
      code: 404,
      status: false,
      message: "No OTP record found for this email",
    };

  const currentTime = new Date();

  if (otpRecord.otpExpiry < currentTime)
    return { code: 401, status: false, message: "OTP has expired" };

  if (otpRecord.otpCode !== submittedOtp) {
    const retriesLeft = otpRecord.otpRetries - 1;

    if (retriesLeft <= 0) {
      // Set the OTP disabled time to 2 minutes from now
      const otpDisabledTime = new Date(Date.now() + 2 * 60 * 1000);
      await otp.update(
        { otpRetries: 0, otpDisabledTime },
        { where: { email } }
      );

      return {
        code: 401,
        status: false,
        message:
          "Invalid OTP. No retries left. OTP generation disabled for 2 minutes.",
      };
    } else {
      await otp.update({ otpRetries: retriesLeft }, { where: { email } });
      return {
        code: 401,
        status: false,
        message: `Invalid OTP. You have ${retriesLeft} retries left.`,
      };
    }
  }

  // Mark OTP as verified
  await otp.update(
    {
      otpCode: null,
      otpExpiry: null,
      otpRetries: 0,
      otpDisabledTime: null,
      otpStatus: true,
    },
    { where: { email } }
  );

  return { code: 200, status: true, message: "OTP verified Successfully" };
};
