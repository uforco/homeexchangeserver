const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 4500;

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);

const uri = `mongodb+srv://${process.env.HOMESwap_USER}:${process.env.HOMESwap_PASS}@cluster0.odosugi.mongodb.net/?retryWrites=true&w=majority`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const verifyuser = (req, res, next) => {
  // res.send("ZGdx")
  if (!req?.cookies?.usertoken) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  jwt.verify(
    req?.cookies?.usertoken,
    process.env.USER_ACCESS_TOKEN,
    (err, decoded) => {
      if (err) {
        return res.status(401).send({ message: "unauthorized access" });
      }
      req.user = decoded;
      next();
    }
  );
};

async function run() {
  try {
    const database = client.db("Home_Exchange");
    const userinfo = database.collection("UserInfo");
    const services = database.collection("Services");
    const BookingServices = database.collection("BookingServices");

    app.post("/v1/loginuser", async (req, res) => {
      const token = jwt.sign(req.body, process.env.USER_ACCESS_TOKEN, {
        expiresIn: "1h",
      });
      res
        .cookie("usertoken", token, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
        })
        .send({ Verify: true });
    });
    app.post("/v1/logoutuser", async (req, res) => {
      res.clearCookie("usertoken", { maxAge: 0 }).send({ success: true });
    });

    // User info Data
    app.post("/v1/registration", async (req, res) => {
      const result = await userinfo.insertOne(req.body);
      res.send(result);
    });
    app.get("/v1/userinfo", verifyuser, async (req, res) => {
      const options = {
        projection: { _id: 0, password: 0, email: 0 },
      };
      const result = await userinfo.findOne(req.query, options);
      res.send(result);
    });
    app.get("/v1/allservice", verifyuser, async (req, res) => {
      const result = await services.find(req.body).toArray();
      res.send(result);
    });

    // Services findOne in _id
    app.get("/v1/singelservice/:id", verifyuser, async (req, res) => {
      const qurey = { _id: new ObjectId(req.params.id) };
      const result = await services.findOne(qurey);
      res.send(result);
    });
    app.get("/v1/prividerallservices/:Email", verifyuser, async (req, res) => {
      const qurey = { providerEmail: req.params.Email };
      const result = await services.find(qurey).toArray();
      res.send({ prividerservice: result.length });
    });
    app.get("/v1/homesevice", async (req, res) => {
      const options = {
        projection: {
          _id: 1,
          providerPhoto: 1,
          servicePrice: 1,
          serviceDescription: 1,
          serviceName: 1,
          servicePhoro: 1,
          serviceName: 1,
        },
      };
      const result = await services.find({}, options).limit(4).toArray();
      res.send(result);
    });
    // booking api system
    app.post("/v1/booking", verifyuser, async (req, res) => {
      const bookingdata = req.body;
      const result = await BookingServices.insertOne(bookingdata);
      res.send(result);
    });
    // bookingexhaust
    app.get("/v1/bookingexhaust", verifyuser, async (req, res) => {
      const bookingdata = req.query;
      const infind = await BookingServices.find({
        $and: [
          { customerEmail: bookingdata.customerEmail },
          { serviceID: bookingdata.serviceID },
        ],
      }).toArray();
      if (infind.length) {
        res.send({ exhaust: false });
      } else {
        res.send({ exhaust: true });
      }
    });
    // customar booking list
    app.get("/v1/customerbookinglist", verifyuser, async (req, res) => {
      const result = await BookingServices.find({
        customerEmail: req.query.email,
      }).toArray();
      res.send(result);
    });
    // customer service delete in booking
    app.delete("/v1/deletebooking/:id", verifyuser, async (req, res) => {
      const deletebook = { _id: new ObjectId(req.params.id) };
      const result = await BookingServices.deleteOne(deletebook);
      res.send(result);
    });

    // dashbord My schedule api
    // Services route
    app.post("/v1/addservice", verifyuser, async (req, res) => {
      const result = await services.insertOne(req.body);
      res.send(result);
    });
    app.get("/v1/myschedule", verifyuser, async (req, res) => {
      const query = { providerEmail: req.query.providerEmail };
      const result = await BookingServices.find(query).toArray();
      res.send(result);
    });
    app.put("/v1/schedulestatus", verifyuser, async (req, res) => {
      const query = { _id: new ObjectId(req.body.bookingid) };
      const updateDoc = {
        $set: {
          bookingStatus: req.body.bookingStatus,
        },
      };
      const result = await BookingServices.updateOne(query, updateDoc);
      res.send(result);
    });
    // manage service route
    app.get("/v1/manageservice/:Email", verifyuser, async (req, res) => {
      const qurey = { providerEmail: req.params.Email };
      const options = {
        projection: {
          _id: 1,
          UploadTime: 1,
          update: 1,
          serviceName: 1,
          servicePhoro: 1,
          servicePrice: 1,
        },
      };
      const result = await services.find(qurey, options).toArray();
      res.send(result);
    });
    app.delete("/v1/manageservice/:id", verifyuser, async (req, res) => {
      const Sdelete = { _id: new ObjectId(req.params.id) };
      const Bdekete = { serviceID: req.params.id };
      const mySdelete = await services.deleteOne(Sdelete);
      const customarBdekete = await BookingServices.deleteOne(Bdekete);
      res.send({ mySdelete, customarBdekete });
    });
    // update data
    app.patch("/v1/updateservice/:id", verifyuser, async (req, res) => {
      const options = { upsert: true };
      const whatdata = req.body;
      const serviceId = req.params.id;
      const whodata = { _id: new ObjectId(serviceId) };
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
        $set: { ...whatdata },
      };
      const results = await services.updateOne(whodata, updateDoc, options);
      const resultb = await BookingServices.updateOne(
        { serviceID: serviceId },
        updateB,
        options
      );
      res.send({ resultb, results });
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } catch (erro) {
    console.log(e);
  }
}
run().catch(console.dir);

//   http://localhost:4500/

app.get("/", (req, res) => {
  // res.redirect('http://localhost:5173/')
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
