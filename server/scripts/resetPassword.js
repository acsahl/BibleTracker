const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const resetPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const email = 'lukoseacsah@gmail.com';
    const newPassword = 'Bible123!'; // This will be the new password

    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found');
      process.exit(1);
    }

    user.password = newPassword;
    await user.save(); // This will trigger the password hashing middleware

    console.log('Password has been reset successfully!');
    console.log('You can now log in with:');
    console.log(`Email: ${email}`);
    console.log(`Password: ${newPassword}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

resetPassword(); 