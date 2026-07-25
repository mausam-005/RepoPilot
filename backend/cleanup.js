require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Bookmark = require('./src/models/Bookmark');
const Issue = require('./src/models/Issue');

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find the most recently created user
    const latestUser = await User.findOne().sort({ createdAt: -1 });

    if (!latestUser) {
      console.log('No users found in the database.');
      process.exit(0);
    }

    console.log('\n--- 🔍 LATEST ACCOUNT FOUND ---');
    console.log(`Email: ${latestUser.email}`);
    console.log(`Username: ${latestUser.username}`);
    console.log(`Created At: ${latestUser.createdAt}`);
    console.log(`ID: ${latestUser._id}`);
    console.log('--------------------------------\n');

    if (process.argv.includes('--confirm')) {
      console.log('⚠️ --confirm flag provided. Deleting other data...\n');
      
      const userDeleteResult = await User.deleteMany({ _id: { $ne: latestUser._id } });
      const bookmarkDeleteResult = await Bookmark.deleteMany({ userId: { $ne: latestUser._id } });
      const issueDeleteResult = await Issue.deleteMany({ userId: { $ne: latestUser._id } });

      console.log('✅ Cleanup Complete:');
      console.log(`- Deleted ${userDeleteResult.deletedCount} old users`);
      console.log(`- Deleted ${bookmarkDeleteResult.deletedCount} old bookmarks`);
      console.log(`- Deleted ${issueDeleteResult.deletedCount} old issues`);
      
    } else {
      console.log('ℹ️ Run this script with the --confirm flag to delete all OTHER accounts, bookmarks, and issues.');
      
      const userCount = await User.countDocuments({ _id: { $ne: latestUser._id } });
      const bookmarkCount = await Bookmark.countDocuments({ userId: { $ne: latestUser._id } });
      const issueCount = await Issue.countDocuments({ userId: { $ne: latestUser._id } });
      
      console.log(`\nIf you run with --confirm, the following will be DELETED:`);
      console.log(`- ${userCount} users`);
      console.log(`- ${bookmarkCount} bookmarks`);
      console.log(`- ${issueCount} issues`);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

run();
