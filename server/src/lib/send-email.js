import nodemailer from 'nodemailer';
import ejs from 'ejs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sendVerificationEmail = async (to, name, verificationUrl) => {
    const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: process.env.EMAIL_USER,  // Your Gmail address
          pass: process.env.EMAIL_PASS,  // Your Gmail app password
        },
      });
  const templatePath = path.join(__dirname, '..', 'views', 'email.ejs');

  // Compile EJS template with data
  const html = await ejs.renderFile(templatePath, { name, verificationUrl });

  // Email options
  const mailOptions = {
    from: 'Friends',
    to,
    subject: 'Please verify your email',
    html,
  };

  // Send email
  await transporter.sendMail(mailOptions);
  console.log(`Verification email sent to ${to}`);
};

export default sendVerificationEmail;