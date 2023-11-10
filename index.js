const express = require("express");
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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
    const BookingServices = database.collection('BookingServices')

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
        console.log(result)
        res.send(result)
    })

    // Services route
    app.post("/addservice",  async (req, res) => {
        const result = await services.insertOne(req.body)
        res.send(result)
    })
    // Services findOne in _id
    app.get("/singelservice/:id",  async (req, res) => {
        const qurey = { _id : new ObjectId(req.params.id) }
        const result = await services.findOne(qurey)
        res.send(result)
    })
    app.get("/prividerallservices/:Email",  async (req, res) => {
        const qurey = { providerEmail : req.params.Email }
        const result = await services.find(qurey).toArray()
        res.send({prividerservice : result.length})
    })
    // booking api system
    app.post("/booking",  async (req, res) => {
      const bookingdata = req.body
      const result = await BookingServices.insertOne(bookingdata)
      res.send(result)
    })
    app.post("/booking",  async (req, res) => {
      const bookingdata = req.body
      const result = await BookingServices.insertOne(bookingdata)
      res.send(result)
    })
    app.get("/bookingexhaust",  async (req, res) => {
      const bookingdata = req.query

     const infind = await BookingServices.find({
        $and: [
          { customerEmail: bookingdata.customerEmail },
          { serviceID: bookingdata.serviceID }
        ]
      }).toArray()
      res.send(infind)
    })





    // app.delete("/delete",  async (req, res) => {
    //     const result = await movies.deleteMany();
    //     res.send(result)
    // })





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