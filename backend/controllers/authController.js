const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");
const otpStore = require("../utils/otpStore");

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    const existingUser = await User.findOne({
  $or: [
    { email },
    { phone }
  ]
});

if (existingUser) {
  if (existingUser.email === email) {
    return res.status(400).json({
      message: "Email already registered",
    });
  }

  if (existingUser.phone === phone) {
    return res.status(400).json({
      message: "Phone number already registered",
    });
  }
}

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.sendOtp = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    const existingUser = await User.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({
          message: "Email already registered",
        });
      }

      if (existingUser.phone === phone) {
        return res.status(400).json({
          message: "Phone number already registered",
        });
      }
    }

    const otp = generateOTP();

    otpStore[email] = {
      otp,
      userData: {
        name,
        email,
        password,
        phone,
        role,
      },
      expiresAt: Date.now() + 5 * 60 * 1000,
    };

    await sendEmail(email, otp);

    res.status(200).json({
      message: "OTP sent successfully",
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const storedData = otpStore[email];

    if (!storedData) {
      return res.status(400).json({
        message: "Please register again.",
      });
    }

    const otp = generateOTP();

    otpStore[email].otp = otp;
    otpStore[email].expiresAt = Date.now() + 5 * 60 * 1000;

    await sendEmail(email, otp);

    res.status(200).json({
      message: "OTP resent successfully",
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const storedData = otpStore[email];

    if (!storedData) {
      return res.status(400).json({
        message: "OTP not found. Please request a new OTP.",
      });
    }

    if (Date.now() > storedData.expiresAt) {
      delete otpStore[email];

      return res.status(400).json({
        message: "OTP has expired.",
      });
    }

    if (storedData.otp !== otp) {
      return res.status(400).json({
        message: "Invalid OTP.",
      });
    }

    const hashedPassword = await bcrypt.hash(
      storedData.userData.password,
      10
    );

    const user = await User.create({
      name: storedData.userData.name,
      email: storedData.userData.email,
      phone: storedData.userData.phone,
      password: hashedPassword,
      role: storedData.userData.role,
    });

    delete otpStore[email];

    res.status(201).json({
      message: "Registration successful",
      user,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Profile API
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};