const express = require("express");
const cors = require('cors')
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config()
const app = express()
const port = process.env.PORT || 4500

// DB_USER="sharif12345"
// DB_PASS="flVhF97BY4hMuwe7"

app.use(express.json());
app.use(cors())

const uri = `mongodb+srv://${process.env.HOMESwap_USER}:${process.env.HOMESwap_PASS}@cluster0.odosugi.mongodb.net/?retryWrites=true&w=majority`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function run() {
  try {

    const database = client.db('Home_Exchange')
    const userinfo = database.collection('UserInfo')
    const services = database.collection('Services')

    // User info Data
    app.post("/registration",  async (req, res) => {
        console.log(req.body)
        const result = await userinfo.insertOne(req.body)
        res.send(result)
    })
    app.get("/userinfo",  async (req, res) => {
        const options = {
            projection: { _id: 0, password: 0, email: 0 },
          };
        const result = await userinfo.findOne(req.query, options)
        res.send(result)
    })

    // Services route
    app.post("/addservice",  async (req, res) => {
        console.log(req.body)
        // const result = await userinfo.insertOne(req.body)
        res.send({ name : "Sharif", age : 25 })
    })







    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch(erro){
    console.log(e)
  }
}
run().catch(console.dir);

//   http://localhost:4500/


app.get('/', (req, res) => {
    // res.redirect('http://localhost:5173/')
    // res.send('Hello World!')
})


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })