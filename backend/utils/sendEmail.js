const nodemailer = require("nodemailer");

const sendEmail = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      family: 4,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "LeaseFlow Email Verification OTP",
      html: `
        <h2>Welcome to LeaseFlow 👋</h2>
        <p>Your OTP for email verification is:</p>

        <h1 style="color:#2563eb;">${otp}</h1>

        <p>This OTP is valid for <b>5 minutes</b>.</p>

        <p>If you didn't request this, please ignore this email.</p>
      `,
    });

    console.log("OTP sent successfully.");
  } catch (error) {
    console.log(error);
    throw error;
  }
};

module.exports = sendEmail;