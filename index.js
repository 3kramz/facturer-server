const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express()
const port = process.env.PORT || 5000

//midaleware
app.use(express.json())
app.use(cors())

app.get('/',(req,res)=>{
    res.send("Facturer Server is Running")
})

app.listen(port,()=>console.log("Listening port ", port))