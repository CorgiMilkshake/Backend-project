const { MONGODB_URI } = process.env;
const { MongoClient } = require('mongodb');

const usersCollection = 'users';
const client = new MongoClient(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// async function connect() {
//   if (!client.isConnected()) await client.connect();
//   return client.db().collection(customerInfo);
// }

async function getUserByEmail(login_email) {
  const usersCollection = await connect();
  return usersCollection.findOne({ login_email });
}

module.exports = {
  getUserByEmail,
};