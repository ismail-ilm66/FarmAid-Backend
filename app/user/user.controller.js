const userService = require("./user.service");

exports.signup = async (req, res) => {
  const userData = ({ name, email, password, contact, fcmToken, language } =
    req.body);

  if (!email || !password)
    return res.status(400).json({
      status: false,
      code: 400,
      message: "email and password are required",
    });
  userData.profilePic = req?.file ?? null;
  try {
    const userSignedUp = await userService.createAccount(userData);

    return res.status(userSignedUp.code).json(userSignedUp);
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, code: 500, message: error.message });
  }
};

exports.signin = async (req, res) => {
  const { email, password, fcmToken } = req.body;

  if (!email || !password || !fcmToken)
    return res.status(400).json({
      status: false,
      code: 400,
      message: "email, password and fcmToken are required",
    });
  try {
    const userSignedIn = await userService.signIn({
      email,
      password,
      fcmToken,
    });
    return res.status(userSignedIn.code).json(userSignedIn);
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, code: 500, message: error.message });
  }
};

exports.googleSignIn = async (req, res) => {
  console.log("This is the request body: " + req.body);
  const userDatafromReq = ({ name, email, fcmToken, language, profilePic } =
    req.body);
  console.log(
    "This is the data from the request body:" + userDatafromReq.email
  );
  if (!email) {
    return res.status(400).json({
      status: false,
      code: 400,
      message: "Email is required .",
    });
  }
  try {
    console.log("before user Data");

    console.log("after user data");
    const userSignedIn = await userService.googleSignIn(userDatafromReq);
    return res.status(userSignedIn.code).json(userSignedIn);
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, code: 500, message: error.message });
  }
};

exports.deleteAccount = async (req, res) => {
  const { userId } = req.query;

  if (!userId)
    return res
      .status(400)
      .json({ status: false, code: 400, message: "userId is required" });

  try {
    const userDeleted = await userService.deleteUserById({ userId });
    return res.status(userDeleted.code).json(userDeleted);
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

exports.checkUser = async (req, res) => {
  const { email } = req.query;

  if (!email)
    return res
      .status(400)
      .json({ status: false, code: 400, message: "Email is required" });

  try {
    const userFound = await userService.findUserByEmail({ email });
    return res.status(userFound.code).json(userFound);
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({
      status: false,
      code: 400,
      message: "email and password are required",
    });
  try {
    const passwordReset = await userService.resetPassword({ email, password });
    return res.status(passwordReset.code).json(passwordReset);
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

exports.editAccount = async (req, res) => {
  const { userId } = req.query;
  const userData = req.body;

  if (!userId)
    return res
      .status(400)
      .json({ status: false, code: 400, message: "userId is required" });

  userData.profilePic = req?.file ?? null;

  try {
    const userEdited = await userService.editAccount({ userId, userData });
    return res.status(userEdited.code).json(userEdited);
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};
