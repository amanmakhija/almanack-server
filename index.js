const express = require('express');
const bodyParser = require("body-parser");
const { MongoClient, ServerApiVersion } = require('mongodb');

const PORT = 8000;
const app = express();

const uri = "mongodb+srv://admin-aman:<admin-aman2003>@almanackdb.daxch4x.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

client.connect(err => {
    app.use(bodyParser.urlencoded({ extended: true }));

    const User = client.db("almanackDB").collection("users");
    const Event = client.db("almanackDB").collection("events");
    // perform actions on the collection object

    //Middleware
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.get('/', (req, res) => {
        res.send('Server is Running Properly');
    });


    //User Routes
    app.post('/register', async (req, res) => {
        const { name, email, password } = req.body;

        const savedUser = await User.findOne({ email });

        if (savedUser) {
            res.status(400).json({
                success: false,
                message: 'User already existed with the given Email ID'
            });
        } else {
            const user = await User.create({
                name,
                email,
                password
            });

            res.status(200).json({
                success: true,
                user
            });
        }
    });

    app.post('/login', async (req, res) => {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            res.status(400).json({
                success: false,
                message: 'Email ID or Password Incorrect'
            });
        } else {
            if (user.password === password) {
                res.status(200).json({
                    success: true,
                    user
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: 'Email ID or Password Incorrect'
                });
            }
        }
    });

    app.get('/profile', async (req, res) => {
        const { userID } = req.body;

        const user = await User.findOne({ userID });

        if (!user) {
            res.status(400).json({
                success: false,
                message: 'No Users Found'
            });
        } else {
            const events = await Event.find({ user: userID });

            res.status(200).json({
                success: true,
                user,
                events
            });
        }
    });


    //Event Routes
    app.post('/event/new', async (req, res) => {
        const { name, date, timeFrom, timeTo, image } = req.body;

        const event = await Event.create({
            name,
            date,
            timeFrom,
            timeTo,
            user: req.body.currentUser,
            image
        });

        res.status(200).json({
            success: true,
            event
        });
    });

    app.get("/events", async (req, res) => {
        const events = await Event.find({});

        res.status(200).json({
            success: true,
            events
        });
    });

    app.get('/event/:eventID', async (req, res) => {
        const eventID = req.params.eventID;

        const event = await Event.findById(eventID);

        res.status(200).json({
            success: true,
            event
        });
    });

    client.close();
});

//Listening On PORT
app.listen(PORT, (err) => {
    if (err) console.log(err);
    console.log('Server started on PORT', PORT);
});