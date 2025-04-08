const bcrypt = require("bcrypt");

//models used
const user = require("./user.model");

//helpers used
const helperFunctions = require("../../utils");

exports.createAccount = async (userData) => {
  //check if the email does not exist
  const userExists = await user.findOne({ where: { email } });
  if (userExists)
    return {
      code: 409,
      status: false,
      message: "user with this email already exists",
    };
  const { profilePic, ...cleanUser } = userData;
  //if it does not exist, then create the account
  const accountCreated = await user.create({
    ...cleanUser,
    profilePic: profilePic
      ? await helperFunctions.uploadToCloudinary(
          profilePic,
          "/FarmAid/profilePics/"
        )
      : null,
    password: await bcrypt.hash(userData.password, 10),
    signUpMethod: "mail",
  });

  return {
    code: 201,
    status: true,
    message: "user created successfully",
    user: accountCreated,
  };
};

exports.signIn = async ({ email, password, fcmToken }) => {
  //check if the email exists
  const userExists = await user.findOne({
    where: { email },
  });

  if (!userExists)
    return {
      code: 404,
      status: false,
      message: "user with this email does not exist",
    };

  if (userExists.activeStatus === false)
    return {
      code: 403,
      status: false,
      message: "This account is deactivated, contact customer support",
    };

  if (userExists.signUpMethod !== "mail") {
    return {
      code: 403,
      status: false,
      message: "This account is not created with email, try with other methods",
    };
  }

  //check if the provided password matches with the stored password
  const isPasswordValid = await bcrypt.compare(password, userExists.password);
  if (!isPasswordValid)
    return { code: 401, status: false, message: "Invalid Password provided" };

  await userExists.update({ fcmToken });

  return {
    code: 200,
    status: true,
    message: "signed in successfully",
    user: userExists,
    token: helperFunctions.generateToken({
      userId: userExists.id,
      email: userExists.email,
    }),
  };
};

exports.deleteUserById = async ({ userId }) => {
  //check if the user exists
  const userExists = await user.findByPk(userId, { attributes: ["id"] });
  if (!userExists)
    return {
      code: 404,
      status: false,
      message: "User not found",
    };

  // Delete the user in the background
  setImmediate(async () => {
    try {
      await userExists.destroy();
      console.log(`User with ID ${userId} deleted successfully`);
    } catch (error) {
      console.error(`Error deleting user with ID ${userId}:`, error);
    }
  });

  return { code: 200, status: true, message: "User Deleted Successfully" };
};

exports.resetPassword = async ({ email, password }) => {
  const userExists = await user.findOne({ where: { email } });
  if (!userExists)
    return {
      code: 404,
      status: false,
      message: "user with email does not exist",
    };

  userExists.password = await bcrypt.hash(password, 10);
  await userExists.save();

  return { code: 200, status: true, message: "Password Reset Successfully" };
};

exports.findUserByEmail = async ({ email }) => {
  //check user exists
  const userExists = await user.findOne({
    where: { email },
    attributes: { exclude: ["password"] },
  });
  if (!userExists)
    return { code: 404, status: false, message: "user not found" };

  return {
    code: 200,
    status: true,
    message: "user found successfully",
    user: userExists,
  };
};

exports.findUserById = async ({ userId }) => {
  //check user exists
  const userExists = await user.findByPk(userId, {
    attributes: { exclude: ["password"] },
  });
  if (!userExists)
    return { code: 404, status: false, message: "user not found" };

  return {
    code: 200,
    status: true,
    message: "user found successfully",
    user: userExists,
  };
};

exports.editAccount = async ({ userId, userData }) => {
  //check if the user exists
  const userExists = await user.findByPk(userId);
  if (!userExists)
    return { code: 404, status: false, message: "User not found" };

  //if the user is found
  let {
    name,
    contact,
    profilePic,
    currentPassword,
    newPassword,
    allowNotifications,
  } = userData;

  if ((currentPassword && !newPassword) || (!currentPassword && newPassword)) {
    return {
      code: 400,
      status: false,
      message: "Both currentPassword and newPassword must be provided",
    };
  }

  // If passwords are provided, validate the current password
  if (currentPassword) {
    const passwordMatches = await bcrypt.compare(
      currentPassword,
      userExists.password
    );
    if (!passwordMatches)
      return {
        code: 403,
        status: false,
        message: "Current password is incorrect",
      };

    // Hash the new password (using a helper function)
    newPassword = await bcrypt.hash(newPassword, 10);
  }

  const updateBody = {
    ...(name && { name }),
    ...(contact && { contact }),
    ...(profilePic && {
      profilePic: await helperFunctions.uploadToCloudinary(
        profilePic,
        "/Bodo/profilePics/"
      ),
    }),
    ...(newPassword && { password: newPassword }),
    ...(allowNotifications && {
      allowNotifications: allowNotifications == "true" ? 1 : 0,
    }),
  };

  await userExists.update(updateBody);

  return {
    code: 200,
    status: true,
    message: "User Edited Successfully",
    user: userExists,
  };
};
