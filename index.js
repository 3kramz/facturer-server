const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
    const orderCollection = client.db('facturer').collection('order');



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
      res.send(parts)
    })

    app.get('/home/parts', async (req, res) => {
      const parts = await partsCollection.find().limit(3).toArray() 
      res.send(parts)
    })
    
    
    app.get(`/part/:id`, async (req, res) => {
      const id=req.params.id
      const query={_id:ObjectId(id)}
      const parts = await partsCollection.findOne(query)
      res.send(parts)
    })
    

    app.post(`/order`, async (req, res) => {
      const order=req.body
      const placeOrder= await orderCollection.insertOne(order)
      res.send(placeOrder)
    })


  } finally {

  }
}

run().catch(console.dir);




app.get('/', (req, res) => {
  res.send("Facturer Server is Running")
})

app.listen(port, () => console.log("Listening port ", port))