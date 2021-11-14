const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors');
require('dotenv').config()

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nlfvc.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run(){

    try{
       await client.connect();
       const database = client.db('rideoCycle');
       const productsCollection = database.collection('products');
       const usersCollection = database.collection('users');



    // GET API

      app.get('/products', async(req, res) =>{
          const cursor = productsCollection.find({});
          const products = await cursor.toArray();
          res.send(products)
      });

    // GET SINGLE PRODUCT
    app.get('/products/:id', async(req, res) => {
        const id = req.params.id;
        console.log('getting specific product id', id)
        const query = {_id:ObjectId(id)};
        const product = await productsCollection.findOne(query);
        res.json(product);
    })

    // Post API
    app.post('/products', async(req, res) =>{
        const product = req.body;
         
        // console.log('hit the post API', product)

        const result = await productsCollection.insertOne(product);
        // console.log(result)
        res.json(result)
    })
    // Delete Product
    app.delete('/products/:id', async(req, res) =>{
        const id = req.params.id;
       
        const query = {_id:ObjectId(id)};
        const result = await productsCollection.deleteOne(query);
        res.json(result);
    });

    app.get('/users/:email', async(req, res) =>{
        const email = req.params.email;
        const query = {email: email};
        const user = await usersCollection.findOne(query);
        let isAdmin = false;
        if(user?.role === 'admin'){
             isAdmin = true;
        }
        res.json({admin: isAdmin});
    })

    app.post('/users', async(req, res) => {
        const user = req.body;
        const result = await usersCollection.insertOne(user);
        // console.log(result)
        res.json(result);
    });

    app.put('/users', async(req, res) =>{
        const user = req.body;
        const filter = {email: user.email};
        const options = {upsert: true};
        const updateDoc = {$set: user};
        const result = await usersCollection.updateOne(filter, updateDoc, options);
        res.json(result);
    });

    app.put('/users/admin', async(req, res) =>{
        const user = req.body;
        console.log('put', user);
        const filter = {email: user.email};
        const updateDoc = {$set: {role: 'admin'}};
        const result = await usersCollection.updateOne(filter, updateDoc)
        res.json(result)
    })

    }
    finally{
        // await client .close();
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Running Rideo server')
});

app.listen(port, () =>{
    console.log('Running Rideo Server on Port', port);
})