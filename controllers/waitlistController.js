const User = require("../models/User");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const WaitList = require("../models/WaitList");
const emailCache = require("../cache");

exports.registerWait = async (req, res) => {
  const { email, user_id,user_type,company,name,website,linkedIn,sub_type } = req.body;

  try {
    let mail=""
    if(user_type=="c"){
        mail=`<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Matcha Waitlist - Company Confirmation</title>
  </head>
  <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 30px; color: #333;">
  <div style="text-align: center; margin-bottom: 20px;">
        <img src="https://firebasestorage.googleapis.com/v0/b/omrulancer.appspot.com/o/matchaLogoBlue.png?alt=media&token=6e38fb55-8ddf-4ba8-b6fd-427b7e871d89" alt="Matcha Logo" style="height: 100px;" />
      </div>
    <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
      <h2 style="color: #0038FF; text-align: center;">✨ You are on the Matcha Waitlist! ✨</h2>
      
      <p>Hi <strong>${company}</strong>,</p>

      <p>Thank you for signing your company up to the <strong>Matcha</strong> waitlist! You are now in line to discover, hire, and grow with exceptional talent — and to gain early access to the platform where top talent meets breakthrough opportunities.</p>

      <p><strong>Early Matcha “Companies” will get:</strong></p>
      <ul>
        <li>🔵 Free access to <strong>Matcha Pro</strong> for 6 months.</li>
        <li>🔵 An <strong>“Early Partner”</strong> badge to boost visibility and trust.</li>
        <li>🔵 First access to a global pool of talent.</li>
      </ul>

      <p>Please note, each application goes through manual review to ensure a high standard of both talent and opportunities on the platform. If you are selected, we will notify you as soon as your invite is ready!</p>

      <p>Thanks for being early,</p>
      <p><strong>Team Matcha</strong></p>

      <p>
        <a href="https://www.linkedin.com/company/quantum-leap-labs/" style="color: #0038FF; text-decoration: underline;">Connect on LinkedIn</a> &nbsp;|&nbsp;
        <a href="https://x.com/quantumleaplab" style="color: #0038FF; text-decoration: underline;">Follow us on X</a> &nbsp;|&nbsp;
        <a href="https://discord.gg/wBHEDr9Awh" style="color: #0038FF; text-decoration: underline;">Join our startup community</a>
      </p>
    </div>
  </body>
</html>
`
    }else{
        mail=`<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Matcha Waitlist - Talent Confirmation</title>
  </head>
  <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 30px; color: #333;">
  <div style="text-align: center; margin-bottom: 20px;">
        <img src="https://firebasestorage.googleapis.com/v0/b/omrulancer.appspot.com/o/matchaLogoBlue.png?alt=media&token=6e38fb55-8ddf-4ba8-b6fd-427b7e871d89" alt="Matcha Logo" style="height: 100px;" />
      </div>
    <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
      <h2 style="color: #0038FF; text-align: center;">✨ You are on the Matcha Waitlist! ✨</h2>
      
      <p>Hi <strong>${name}</strong>,</p>

      <p>Thank you for joining the <strong>Matcha</strong> waitlist! You are now in line for early access to the platform where top talent meets breakthrough opportunities!</p>

      <p><strong>Early Matcha “Talent” users will get:</strong></p>
      <ul>
        <li>🔵 Free access to <strong>Matcha Pro</strong> for 6 months.</li>
        <li>🔵 A <strong>“Founding Talent”</strong> badge.</li>
        <li>🔵 First access to exclusive job opportunities.</li>
      </ul>

      <p>Please note, each application goes through manual review to ensure a high standard of both talent and opportunities on the platform. If you are selected, we will notify you as soon as your invite is ready!</p>

      <p>Thanks for being early,</p>
      <p><strong>Team Matcha</strong></p>

      <p>
        <a href="https://www.linkedin.com/company/quantum-leap-labs/" style="color: #0038FF; text-decoration: underline;">Connect on LinkedIn</a> &nbsp;|&nbsp;
        <a href="https://x.com/quantumleaplab" style="color: #0038FF; text-decoration: underline;">Follow us on X</a> &nbsp;|&nbsp;
        <a href="https://discord.gg/wBHEDr9Awh" style="color: #0038FF; text-decoration: underline;">Join our startup community</a>
      </p>
    </div>
  </body>
</html>
`
    }
    let user = await WaitList.findOne({ user_id });
    if (user) return res.json({ msg: "User already exists in waitlist for this email" });

    user = new WaitList({ email, user_id, user_type,company,name,website,linkedIn,sub_type });
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
      subject: "Welcome to waitlist - Matcha",
      html: mail
    };

    await transporter.sendMail(mailOptions);
    res.status(201).json({ msg: "Added to waitlist" });
  } catch (err) {
    res.status(500).json({ msg: "Server error", err });
    console.log(err)
  }
};


exports.getWait = async (req, res) => {
  const { user_id } = req.params;
  try {
    const user = await WaitList.findOne({ user_id });
    if (!user) return res.status(404).json({ msg: "User not found in waitlist" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

exports.sendMail=async(req,res)=>{

  let idempotencyKey=""

  try {
    const apiKey = req.headers['x-api-key'];

  if (apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: 'Unauthorized: Invalid API Key' });
  }
  const { name, email, userType } = req.body;

  if (!name || !email || !userType) {
    return res.status(400).json({ error: 'Missing name, email, or userType' });
  }
  let mail=""
  if(userType=="company"){
    idempotencyKey=`c_${email}`
    mail=`<!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>Matcha Waitlist - Company Confirmation</title>
      </head>
      <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 30px; color: #333;">
      <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://firebasestorage.googleapis.com/v0/b/omrulancer.appspot.com/o/matchaLogoBlue.png?alt=media&token=6e38fb55-8ddf-4ba8-b6fd-427b7e871d89" alt="Matcha Logo" style="height: 100px;" />
          </div>
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
          <h2 style="color: #0038FF; text-align: center;">✨ You are on the Matcha Waitlist! ✨</h2>
          
          <p>Hi <strong>${name}</strong>,</p>
    
          <p>Thank you for signing your company up to the <strong>Matcha</strong> waitlist! You are now in line to discover, hire, and grow with exceptional talent — and to gain early access to the platform where top talent meets breakthrough opportunities.</p>
    
          <p><strong>Early Matcha “Companies” will get:</strong></p>
          <ul>
            <li>🔵 Free access to <strong>Matcha Pro</strong> for 6 months.</li>
            <li>🔵 An <strong>“Early Partner”</strong> badge to boost visibility and trust.</li>
            <li>🔵 First access to a global pool of talent.</li>
          </ul>
    
          <p>Please note, each application goes through manual review to ensure a high standard of both talent and opportunities on the platform. If you are selected, we will notify you as soon as your invite is ready!</p>
    
          <p>Thanks for being early,</p>
          <p><strong>Team Matcha</strong></p>
    
          <p>
            <a href="https://www.linkedin.com/company/quantum-leap-labs/" style="color: #0038FF; text-decoration: underline;">Connect on LinkedIn</a> &nbsp;|&nbsp;
            <a href="https://x.com/quantumleaplab" style="color: #0038FF; text-decoration: underline;">Follow us on X</a> &nbsp;|&nbsp;
            <a href="https://discord.gg/wBHEDr9Awh" style="color: #0038FF; text-decoration: underline;">Join our startup community</a>
          </p>
        </div>
      </body>
    </html>
    `
  }else{
    idempotencyKey=`t_${email}`
    mail=`<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Matcha Waitlist - Talent Confirmation</title>
  </head>
  <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 30px; color: #333;">
  <div style="text-align: center; margin-bottom: 20px;">
        <img src="https://firebasestorage.googleapis.com/v0/b/omrulancer.appspot.com/o/matchaLogoBlue.png?alt=media&token=6e38fb55-8ddf-4ba8-b6fd-427b7e871d89" alt="Matcha Logo" style="height: 100px;" />
      </div>
    <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
      <h2 style="color: #0038FF; text-align: center;">✨ You are on the Matcha Waitlist! ✨</h2>
      
      <p>Hi <strong>${name}</strong>,</p>

      <p>Thank you for joining the <strong>Matcha</strong> waitlist! You are now in line for early access to the platform where top talent meets breakthrough opportunities!</p>

      <p><strong>Early Matcha “Talent” users will get:</strong></p>
      <ul>
        <li>🔵 Free access to <strong>Matcha Pro</strong> for 6 months.</li>
        <li>🔵 A <strong>“Founding Talent”</strong> badge.</li>
        <li>🔵 First access to exclusive job opportunities.</li>
      </ul>

      <p>Please note, each application goes through manual review to ensure a high standard of both talent and opportunities on the platform. If you are selected, we will notify you as soon as your invite is ready!</p>

      <p>Thanks for being early,</p>
      <p><strong>Team Matcha</strong></p>

      <p>
        <a href="https://www.linkedin.com/company/quantum-leap-labs/" style="color: #0038FF; text-decoration: underline;">Connect on LinkedIn</a> &nbsp;|&nbsp;
        <a href="https://x.com/quantumleaplab" style="color: #0038FF; text-decoration: underline;">Follow us on X</a> &nbsp;|&nbsp;
        <a href="https://discord.gg/wBHEDr9Awh" style="color: #0038FF; text-decoration: underline;">Join our startup community</a>
      </p>
    </div>
  </body>
</html>
`
  }

  if(emailCache.has(idempotencyKey)){
    return res.status(200).json({ message: 'Email already sent recently' });
  }

  emailCache.set(idempotencyKey,true)

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
    subject: "Welcome to waitlist - Matcha",
    html: mail
  };

  await transporter.sendMail(mailOptions);
  res.status(201).json({ msg: "Added to waitlist" });
  } catch (error) {
    emailCache.del(idempotencyKey);
    res.status(500).json({ msg: "Server error", error });
    console.log(error)
  }

  
}