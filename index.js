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
   
    app.get("/user/:email", async (req, res) => {
      const email = req.params.email
      const profile= await userCollection.findOne({email});
      res.send(profile)
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
      const id = req.params.id
      const query = { _id: ObjectId(id) }
      const part = await partsCollection.findOne(query)
     
      res.send(part)
    })

    app.post(`/order/:id`, async (req, res) => {
      const id = req.params.id
      const orderInfo = req.body
      const placeOrder = await orderCollection.insertOne(orderInfo)
     
      const query = { _id: ObjectId(id) }
      const part = await partsCollection.findOne(query)

      const options = { upsert: true };
     
      const updateDoc = {
        $set: {
          stock: `${part.stock - orderInfo.quantity}`
        },
      };
      const result = await partsCollection.updateOne( { _id: ObjectId(id) }, updateDoc, options);
      res.send(placeOrder)
    })


    app.put(`/review/:id`, async (req, res) => {
      const id = req.params.id
      const review = req.body
      const options = { upsert: true };
      const updateDoc = { $set: review,};

      const result = await orderCollection.updateOne( {productId:id}, updateDoc, options)
   
      res.send(result)
    })


    app.get("/order/:email", async (req, res) => {
      const email = req.params.email
      const order= await orderCollection.find({email}).toArray();
      res.send(order)
    })


  } finally {

  }
}

run().catch(console.dir);




app.get('/', (req, res) => {
  res.send("Facturer Server is Running")
})

app.listen(port, () => console.log("Listening port ", port))