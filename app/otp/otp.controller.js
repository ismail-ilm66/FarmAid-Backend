const otpService = require("./otp.service");
const userService = require("../user/user.service");

exports.sendOtp = async (req, res) => {
  const { email } = req.body;

  if (!email)
    return res
      .status(400)
      .json({ code: 400, status: false, message: "email is required" });
  const userFound = await userService.findUserByEmail({ email });
  if (userFound.code == 404) {
    return res.status(userFound.code).json(userFound);
  }

  try {
    const otpGenerated = await otpService.generateOtp(email);
    return res.status(otpGenerated.code).json(otpGenerated);
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email)
    return res
      .status(400)
      .json({ code: 400, status: false, message: "email is required" });
  if (!otp)
    return res
      .status(400)
      .json({ code: 400, status: false, message: "otp is required" });

  try {
    const otpVerified = await otpService.verifyOtp(email, otp);
    return res.status(otpVerified.code).json(otpVerified);
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};
