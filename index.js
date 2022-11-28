const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const port = process.env.PORT || 5000;


//  middleware
app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.2wczu4w.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });




function verifyJWT(req, res, next) {
    const authHeaders = req.headers.authorization;
    if (!authHeaders) {
        return res.status(401).send('UnAuthorized is a very vbif  access')
    }
    const token = authHeaders.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'forbidden access' });
        }
        req.decoded = decoded;
        next()
    })
}


async function run() {
    try {
        const productsCollection = client.db('resaleProducts').collection('products')
        const buyingsCollection = client.db('resaleProducts').collection('buyings')
        const buyersCollection = client.db('resaleProducts').collection('buyers')



        // get the total products
        app.get('/categories/:brand', async (req, res) => {
            const brand = req.params.brand;
            const query = { brand: brand }
            const result = await productsCollection.find(query).toArray()
            res.send(result);
        });

        // postable products delete
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id)
            const filter = { _id: ObjectId(id) }
            const result = await productsCollection.deleteOne(filter)
            res.send(result)
        })

        //post products
        app.post('/products', async (req, res) => {
            const product = req.body;
            const result = await productsCollection.insertOne(product);
            res.send(result)
        })

        
        app.get('/products', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const result = await productsCollection.find(query).toArray()
            res.send(result)
        })

        app.delete('/buyings/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id)
            const filter = { _id: ObjectId(id) }
            const result = await buyingsCollection.deleteOne(filter)
            res.send(result)
        })

        

        app.get('/buyings', verifyJWT, async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const decodedEmail = req.decoded.email;
            if (email !== decodedEmail) {
                return res.status(403).send({ message: 'forbidden access' })
            }
            const result = await buyingsCollection.find(query).toArray()
            res.send(result)
        })


        app.post('/buyings', async (req, res) => {
            const bookings = req.body;
            const query = {
                brand: bookings.email
            }
            const alreadyBuyed = await buyingsCollection.find(query).toArray()
            if (alreadyBuyed.length) {
                const message = `Already bought a Product on ${bookings.brand}`
                return res.send({ accKnowledged: false, message })
            }
            const result = await buyingsCollection.insertOne(bookings);
            res.send(result)
        });


        app.put('/buyers/verify/:id',verifyJWT, async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    verify: 'verified'
                }
            }
            const result = await buyersCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        });


        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const buyer = await buyersCollection.findOne(query);
            if (buyer) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '1d' });
                return res.send({ accessToken: token })
            }
            res.status(403).send({ accessToken: '' })
        })


        app.get('/buyers/:select', async (req, res) => {
            const buyer = req.params.select;
            const query = { select: buyer }
            const result = await buyersCollection.find(query).toArray()
            console.log(result)
            res.send(result);
        })

        app.get('/buyerss', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const result = await buyersCollection.findOne(query);
            res.send(result)
        })


        app.delete('/buyers/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await buyersCollection.deleteOne(query)
            res.send(result)
        })


        app.get('/buyers', async (req, res) => {
            const query = {}
            const buyers = await buyersCollection.find(query).toArray()
            res.send(buyers)
        })


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
