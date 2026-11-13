const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const testUri = async (name, uri) => {
  console.log(`\n========================================`);
  console.log(`Testing [${name}]...`);
  console.log(`URI: ${uri.replace(/:([^:@]+)@/, ':****@')}`);
  try {
    const conn = await mongoose.connect(uri, { family: 4, serverSelectionTimeoutMS: 15000 });
    console.log(`🎉 SUCCESS: Connected to MongoDB Atlas with [${name}]!`);
    await mongoose.disconnect();
    return true;
  } catch (err) {
    console.error(`❌ Failed with [${name}]:`, err.message);
    if (err.reason && err.reason.servers) {
      for (const [server, desc] of err.reason.servers) {
        if (desc.error) {
          console.error(`   -> ${server}: ${desc.error.message || desc.error}`);
        }
      }
    }
    return false;
  }
};

const runDiagnostics = async () => {
  const pw = 'CldiLxHZCtOPnMZJ';
  const cluster = 'cluster0.nxzs9y7.mongodb.net';

  // Option 1: archanasrvscas_db_user
  const uri1 = `mongodb+srv://archanasrvscas_db_user:${pw}@${cluster}/tms_db?retryWrites=true&w=majority`;
  const ok1 = await testUri('Username: archanasrvscas_db_user', uri1);
  if (ok1) {
    console.log('\n✅ Use this in your .env: MONGO_URI=' + uri1);
    process.exit(0);
  }

  // Option 2: archanasrvscas_db_userarchanasrvscas_db_user (if pasted twice)
  const uri2 = `mongodb+srv://archanasrvscas_db_userarchanasrvscas_db_user:${pw}@${cluster}/tms_db?retryWrites=true&w=majority`;
  const ok2 = await testUri('Username: archanasrvscas_db_userarchanasrvscas_db_user', uri2);
  if (ok2) {
    console.log('\n✅ Use this in your .env: MONGO_URI=' + uri2);
    process.exit(0);
  }

  // Option 3: With authSource=admin
  const uri3 = `mongodb+srv://archanasrvscas_db_user:${pw}@${cluster}/tms_db?authSource=admin&retryWrites=true&w=majority`;
  const ok3 = await testUri('With authSource=admin', uri3);
  if (ok3) {
    console.log('\n✅ Use this in your .env: MONGO_URI=' + uri3);
    process.exit(0);
  }

  console.log('\n========================================');
  console.log('DIAGNOSIS:');
  console.log('If all servers timed out, MongoDB Atlas has blocked your IP.');
  console.log('Go to cloud.mongodb.com -> Security -> Network Access -> Add 0.0.0.0/0');
  console.log('========================================\n');
  process.exit(1);
};

runDiagnostics();
