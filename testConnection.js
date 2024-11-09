const uri = 'mongodb+srv://aniket:12345@cluster0.8sfpess.mongodb.net?retryWrites=true&w=majority';
const { MongoClient } = require("mongodb");

// Replace the uri string with your connection string.


const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();

    const database = client.db('patientManagement');
    const movies = database.collection('users');

    // Query for a movie that has the title 'Back to the Future'
    const query = { title: 'Back to the Future' };
    const movie = await movies.findOne(query);

    console.log(movie);
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);