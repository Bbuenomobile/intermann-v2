const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const config = require("./config")
const path = require("path");
const port = process.env.PORT || 8080;
const MONGODB_URI = config.mongoUrl;
const app = express();
const {error} = require("./middleware/error");
const axios = require('axios');
var http = require('http').Server(app);
const ProdReleaseLogger = require("./models/productionReleaseLogger");
const router = require('./routes/router');

const HEROKU_ACCESS_TOKEN = "cb39e3b1-86a9-47c5-9810-3316baa95eb4";

// app.use(cors({
//     origin: 'https://intermann.herokuapp.com'
// }));

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



app.use("/static", express.static(path.join(__dirname, '/build/static')));

app.use("/uploads" , express.static("uploads"));

async function getProductionReleaseVersion() {
    const response = await axios.get(`https://api.heroku.com/apps/db1acca5-bcf1-4138-bef9-f6a17cbe3934/config-vars`, {
      headers: {
        Authorization: `Bearer ${HEROKU_ACCESS_TOKEN}`,
        Accept: 'application/vnd.heroku+json; version=3',
      },
    });
    const releases = response.data;
    const latestRelease = releases.HEROKU_RELEASE_VERSION
    return latestRelease;
  }

// app.use((req, res, next) => {
//     res.setHeader("Content-Type", "image/png")
//     next()
// })
app.use(error);

app.get("/check-heroku-updates", (req, res, next) => {
    getProductionReleaseVersion().then(async (version) => {
        let result = await ProdReleaseLogger.find({ lastVersion: version });

        if (result.length > 0) {
            return res.json({ currentVersion: version.slice(1,version.length), logout_and_refresh: false })
        } else {
            const entry = new ProdReleaseLogger({
                lastVersion: version
            });
            entry.save().then(success => {
                return res.json({ currentVersion: version.slice(1,version.length), logout_and_refresh: true });
            }).catch(err => {
                return res.json({ currentVersion: version.slice(1,version.length), logout_and_refresh: false });
            })
        }
      });
})



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
        ////console.log(err);
    });



