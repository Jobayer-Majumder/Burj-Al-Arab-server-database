const express = require('express');
var cors = require('cors');
const admin = require('firebase-admin');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

const user = process.env.DB_USER;
const pass = process.env.DB_PASS;
const dbName = process.env.DB_NAME;
const dbCollection = process.env.DB_COLLECTION;


const serviceAccount = require("./config/burj-al-arab-resident-firebase-adminsdk-ljs8g-b096fd4e8c.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});



const uri = `mongodb+srv://${user}:${pass}@jobayer.eggfq.mongodb.net/${dbName}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


client.connect(err => {
    const collection = client.db(`${dbName}`).collection(`${dbCollection}`);
    app.post('/addBooking', (req, res) => {
        const bookingInfo = req.body;
        collection.insertOne(bookingInfo)
            .then(result => {
                res.send(result.insertedCount > 0);
            })
        console.log(bookingInfo)
    })

    app.get('/bookings', (req, res) => {
        // console.log(req.headers.authorization);
        const bearer = req.headers.authorization;
        if (bearer && bearer.startsWith('bearer')) {
            const idToken = bearer.split(' ')[1];
            admin.auth()
                .verifyIdToken(idToken)
                .then((decodedToken) => {
                    const tokenEmail = decodedToken.email;
                    // const userEmail = req.query.email;
                    if (tokenEmail == req.query.email) {
                        collection.find({ email: req.query.email })
                            .toArray((err, document) => {
                                res.send(document)
                            });
                    };
                })
                .catch((error) => {
                    res.status(401).send('Request unAuthorized');
                });
        }
        else{
            res.status(401).send('Request unAuthorized');
        }
    })

    console.log('database connected successfully')
});




app.get('/', (req, res) => {
    res.send('hello world')
});




app.listen(5000, () => console.log('listening 5000'));