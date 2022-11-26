const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express();
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()
const port = process.env.PORT || 5000;


//  middleware
app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.2wczu4w.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {
        const productsCollection = client.db('resaleProducts').collection('products')
        const buyingsCollection = client.db('resaleProducts').collection('buyings')
        const buyersCollection = client.db('resaleProducts').collection('buyers')



        app.get('/categories/:brand', async (req, res) => {
            const brand = req.params.brand;
            const query = { brand: brand }
            const result = await productsCollection.find(query).toArray()
            res.send(result);
        });

        app.get('/buyings', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const result = await buyingsCollection.find(query).toArray()
            res.send(result)
        })

        app.post('/buyings', async (req, res) => {
            const bookings = req.body;
            console.log(bookings)
            const query = {
                brand: bookings.brand
            }
            const alreadyBuyed = await buyingsCollection.find(query).toArray()
            if (alreadyBuyed.length) {
                const message = `you already have a buying on ${bookings.brand}`
                return res.send({ accKnowledged: false, message })
            }
            const result = await buyingsCollection.insertOne(bookings);
            res.send(result)
        });
        app.post('/buyers', async (req, res) => {
            const buyer = req.body;
            const result = await buyersCollection.insertOne(buyer)
            res.send(result)

        })

    }
    finally {

    }
}
run().catch(e => console.log(e))



app.get('/', async (req, res) => {
    res.send('final project server is running ');
})

app.listen(port, () => console.log(`final project is running on port ${port}`));
