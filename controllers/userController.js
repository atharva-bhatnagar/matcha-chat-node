const User = require("../models/User");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

exports.registerUser = async (req, res) => {
  const { email, user_id, is_comp,name } = req.body;
  const code = crypto.randomBytes(8).toString("hex");

  try {
    let new_id=""
    let mail=""
    if(is_comp){
      new_id=`${user_id}`
      mail=`<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Company Email Verification - Matcha</title>
  </head>
  <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 30px; color: #333;">
   <div style="text-align: center; margin-bottom: 20px;">
        <img src="https://firebasestorage.googleapis.com/v0/b/omrulancer.appspot.com/o/matchaLogoBlue.png?alt=media&token=6e38fb55-8ddf-4ba8-b6fd-427b7e871d89" alt="Matcha Logo" style="height: 100px;" />
      </div>
    <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
      <h2 style="color: #0038FF; text-align: center;">✨ Your company is now registered on Matcha! ✨</h2>
      <p>Hello <strong>${name}</strong>,</p>

      <p>Welcome to <strong>Matcha</strong>! You are now ready to hire the latest talent across <strong>Tech, AI, Quantum, Blockchain</strong> and more.</p>

      <p><strong>Please verify your email</strong> to complete registration and gain access to your dashboard!</p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.BASE_URL}/api/users/verify/${code}"
           style="background-color: #0038FF; color: white; padding: 12px 24px; text-decoration: none; font-size: 16px; border-radius: 5px;">
          Verify Email
        </a>
      </div>

      <p>Let’s help you find your next hire,</p>
      <p><strong>Team Matcha</strong></p>
      <p><a href="https://yourdomain.com" style="color: #0038FF; text-decoration: underline;">Visit Matcha</a></p>
    </div>
  </body>
</html>
`
    }else{
      new_id=`${user_id}`
      mail=`<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Talent Email Verification - Matcha</title>
  </head>
  <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 30px; color: #333;">
   <div style="text-align: center; margin-bottom: 20px;">
        <img src="https://firebasestorage.googleapis.com/v0/b/omrulancer.appspot.com/o/matchaLogoBlue.png?alt=media&token=6e38fb55-8ddf-4ba8-b6fd-427b7e871d89" alt="Matcha Logo" style="height: 100px;" />
      </div>
    <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
      <h2 style="color: #0038FF; text-align: center;">✨ You’re officially registered on Matcha! ✨</h2>
      
      <p>Hello <strong>${name}</strong>,</p>

      <p>Welcome to <strong>Matcha</strong> — the fastest way to connect with projects in <strong>Tech, AI, Quantum, Blockchain</strong> and more.</p>

      <p><strong>Please verify your email</strong> to complete your profile and gain access to top-tier opportunities!</p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.BASE_URL}/api/users/verify/${code}"
           style="background-color: #0038FF; color: white; padding: 12px 24px; text-decoration: none; font-size: 16px; border-radius: 5px;">
          Verify Email
        </a>
      </div>

      <p>Let’s get you hired,</p>
      <p><strong>Team Matcha</strong></p>
      <p><a href="https://yourdomain.com" style="color: #0038FF; text-decoration: underline;">Visit Matcha</a></p>
    </div>
  </body>
</html>
`
    }
    let user = await User.findOne({ new_id });
    if (user) return res.status(400).json({ msg: "User already exists" });

    user = new User({ email, user_id:new_id, code });
    await user.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Verify your email - Matcha",
      html: mail
    };

    await transporter.sendMail(mailOptions);
    res.status(201).json({ msg: "Verification email sent" });
  } catch (err) {
    res.status(500).json({ msg: "Server error", err });
  }
};

exports.verifyUser = async (req, res) => {
  const { code } = req.params;
  try {
    const user = await User.findOne({ code });
    if (!user) return res.status(400).send("Invalid verification code");
    user.verified = true;
    user.code = undefined;
    await user.save();
    res.send("<h2>Your email is verified by Matcha, now you can close this tab.</h2>");
  } catch (err) {
    res.status(500).send("Server error");
  }
};

exports.getUser = async (req, res) => {
  const { user_id } = req.params;
  try {
    const user = await User.findOne({ user_id });
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};