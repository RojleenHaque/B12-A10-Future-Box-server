const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.i5ldpfc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true }
});

async function run() {
  try {
    const db = client.db("AI_Inventory_DB");
    const modelsCollection = db.collection("models");

    // 1. Add Model (POST)
    app.post('/models', async (req, res) => {
      const model = req.body;
      const result = await modelsCollection.insertOne(model);
      res.send(result);
    });

    // 2. Get All Models (With Search and Filter)
    app.get('/models', async (req, res) => {
      const { search, framework } = req.query;
      let query = {};
      
      // Case-insensitive search using $regex
      if (search) {
        query.name = { $regex: search, $options: 'i' };
      }
      // Filter by framework
      if (framework && framework !== 'All') {
        query.framework = framework;
      }

      const result = await modelsCollection.find(query).toArray();
      res.send(result);
    });

    // 3. Get Single Model Details
    app.get('/models/:id', async (req, res) => {
      const id = req.params.id;
      const result = await modelsCollection.findOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    // 4. Update Model (PATCH)
    app.patch('/update-model/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedModel = req.body;
      const updateDoc = { $set: updatedModel };
      const result = await modelsCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // 5. Delete Model
    app.delete('/models/:id', async (req, res) => {
      const id = req.params.id;
      const result = await modelsCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    // 6. Purchase Model (Increment using $inc)
    app.patch('/purchase/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = { $inc: { purchased: 1 } };
      const result = await modelsCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // 7. Get models by specific user email
    app.get('/my-models/:email', async (req, res) => {
      const email = req.params.email;
      const result = await modelsCollection.find({ createdBy: email }).toArray();
      res.send(result);
    });

    console.log("Pinged MongoDB! Connected successfully.");
  } finally {}
}
run().catch(console.dir);

app.get('/', (req, res) => res.send('AI Server Running'));
app.listen(port, () => console.log(`Server on ${port}`));