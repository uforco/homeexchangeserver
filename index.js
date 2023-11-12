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
    app.get("/allservice",  async (req, res) => {
      const result = await services.find(req.body).toArray()
      res.send(result)
    })
    
    // Services findOne in _id
    app.get("/singelservice/:id",  async (req, res) => {
        const qurey = { _id : new ObjectId(req.params.id) }
        const result = await services.findOne(qurey)
        res.send(result)
    })
    app.get("/singelservice/:id",  async (req, res) => {
        const qurey = { _id : new ObjectId(req.params.id) }
        const result = await services.findOne(qurey)
        res.send(result)
    })
    app.get("/prividerallservices/:Email",  async (req, res) => {
        const qurey = { providerEmail : req.params.Email }
        const result = await services.find(qurey).toArray()
        res.send({prividerservice : result.length })
    })
    // booking api system
    app.post("/booking",  async (req, res) => {
      const bookingdata = req.body
      const result = await BookingServices.insertOne(bookingdata)
      res.send(result)
    })
    // bookingexhaust
    app.get("/bookingexhaust",  async (req, res) => {
      const bookingdata = req.query
     const infind = await BookingServices.find({
        $and: [
          { customerEmail: bookingdata.customerEmail },
          { serviceID: bookingdata.serviceID }
        ]
      }).toArray()
      console.log(infind, infind.length, bookingdata)
      if(infind.length){
        res.send({exhaust: false})
      }else{
        res.send({exhaust: true})
      }
    })
 // customar booking list
    app.get("/customerbookinglist", async(req, res)=>{
        const result = await BookingServices.find({customerEmail: req.query.email}).toArray()
        console.log(result.length)
        res.send(result)
    })
  // customer service delete in booking
    app.delete("/deletebooking/:id", async(req, res)=>{
        const deletebook = {_id: new ObjectId(req.params.id)}
        const result = await BookingServices.deleteOne(deletebook)
        res.send(result)
    })

    // dashbord My schedule api
    // Services route
    app.post("/addservice",  async (req, res) => {
      const result = await services.insertOne(req.body)
      res.send(result)
    })
    app.get("/myschedule", async(req, res)=>{
      const query = { providerEmail: req.query.providerEmail };
      const result = await BookingServices.find(query).toArray()
      res.send(result)
    })
    app.get("/myschedule", async(req, res)=>{
      const query = { providerEmail: req.query.providerEmail };
      const result = await BookingServices.find(query).toArray()
      res.send(result)
    })
    app.put("/schedulestatus", async(req, res)=>{
        const query = { _id : new ObjectId(req.body.bookingid)} 
        const updateDoc = {
          $set: {
            bookingStatus: req.body.bookingStatus
          },
        };
        const result = await BookingServices.updateOne(query, updateDoc)
      res.send(result)
    })
    // manage service route
    app.get("/manageservice/:Email",  async (req, res) => {
      const qurey = { providerEmail : req.params.Email }
      const options = {
        projection: { _id: 1, UploadTime: 1, serviceName: 1, servicePhoro: 1, servicePrice: 1},
      };
      const result = await services.find(qurey, options).toArray()
      res.send(result)
    })
    app.delete("/manageservice/:id",  async (req, res) => {
      const Sdelete = { _id : new ObjectId(req.params.id) }
      const Bdekete = { serviceID : req.params.id }
      const mySdelete = await services.deleteOne(Sdelete)
      const customarBdekete = await BookingServices.deleteOne(Bdekete)
      res.send({mySdelete, customarBdekete})
    })
    // update data 
    app.patch("/updateservice/:id", async(req, res)=>{
      const options = { upsert: true };
      const whatdata = req.body
      const serviceId = req.params.id
      const whodata = { _id: new ObjectId(serviceId)};
      const updateB = {
        $set: { 
          serviceAria: whatdata.serviceAria,
          serviceName: whatdata.serviceName,
          servicePhoto: whatdata.servicePhoto,
          servicePrice: whatdata.servicePrice,
          providerEmail: whatdata.providerEmail,

         },
      };
      const updateDoc = {
         $set: {...whatdata },
      };
      const results = await services.updateOne(whodata, updateDoc, options);
      const resultb = await BookingServices.updateOne({serviceID: serviceId}, updateB, options);
      res.send({resultb, results})
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