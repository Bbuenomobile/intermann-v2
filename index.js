const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const config = require("./config")
const path = require("path");
const port = process.env.PORT || 8080;
const MONGODB_URI = config.mongoUrl;
const app = express();

var http = require('http').Server(app);

const router = require('./routes/router');

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/static", express.static(path.join(__dirname, '/build/static')));

app.use(express.static("uploads"))

// app.use((req, res, next) => {
//     res.setHeader("Content-Type", "image/png")
//     next()
// })

app.use('/', router.init());

app.get("/*", (req, res) => {
    res.sendFile(path.join(__dirname, '/build/index.html'))
})

mongoose
    .connect(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(result => {
        http.listen(port, () => {
            console.log('App is Running on ' + port);

        });
    })
    .catch(err => {
        console.log(err);
    });



