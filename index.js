const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
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


        app.get('/categories/:brand', async (req, res) => {
            const brand = req.params.brand;
            const query = {brand: brand}
            const result = await productsCollection.findOne(query)
            res.send(result);
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
