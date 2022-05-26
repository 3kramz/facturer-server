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

    const verifyAdmin = async (req, res, next) => {
      const adminEmail = req.params.email
      const admin = await userCollection.find({ email: adminEmail }).toArray()
      if (admin[0].role === "Admin") {
        next()
      }
      else {
        return res.status(403).send({ message: 'forbidden' });
      }
    }



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


    app.get("/users", async (req, res) => {
      const users= await userCollection.find().toArray();
      res.send(users)
    })
    
    
    app.put("/user/admin/:email", async (req, res) => {
      const email = req.params.email
      const filter = { email };
      const updateDoc = {
        $set: { role: "Admin" },
      };
      const result = await userCollection.updateOne(filter, updateDoc);
      res.send(result)
    })


    app.get("/admin/:email", verifyAdmin, async (req, res) => {

      res.send({ admin: true })
    })


    app.get('/parts', async (req, res) => {
      const parts = await partsCollection.find().toArray()
      res.send(parts)
    })

     app.post(`/part`, async (req, res) => {
      const orderInfo = req.body
      const result = await partsCollection.insertOne(orderInfo);
      res.send(result)
    })

     app.put(`/update/:id`, async (req, res) => {
       const id= req.params.id
      const info = req.body
      const options = { upsert: true };
      const updateDoc = { $set: info,};

      const result = await partsCollection.updateOne( {_id:ObjectId(id)}, updateDoc, options)

      res.send(result)
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



    app.get('/order', async (req, res) => {
      const orders = await orderCollection.find().toArray()
      res.send(orders)
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