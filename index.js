const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const jwt = require('jsonwebtoken');

const app = express()
const port = process.env.PORT || 5000


//midaleware
app.use(express.json())
app.use(cors())


const uri = `mongodb+srv://dbuser:${process.env.DBPASS}@cluster0.wjk4h.mongodb.net/?retryWrites=true&w=majority`

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
  try {
    await client.connect();

    const userCollection = client.db('facturer').collection('users');
    const partsCollection = client.db('facturer').collection('parts');



    app.put("/user/:email", async (req, res) => {
      const email = req.params.email
      const user = req.body
      const filter = { email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      const token = jwt.sign({ email }, process.env.SECRET_ACCESS_TOKEN);

      res.send({ result, token })
    })

    app.get('/parts', async (req, res) => {
      const parts = await partsCollection.find().toArray()
      console.log(parts)
      res.send(parts)
    })




  } finally {

  }
}

run().catch(console.dir);




app.get('/', (req, res) => {
  res.send("Facturer Server is Running")
})

app.listen(port, () => console.log("Listening port ", port))