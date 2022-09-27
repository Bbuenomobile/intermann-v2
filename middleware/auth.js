const jwt = require('jsonwebtoken')
const User = require("../models/user")
const config = require("../config")

module.exports.auth = async (req, res, next) => {
    const token = req.header("Authorization");
    let array = token.split(" ");
    const newToken = array[1];

    if (newToken == null) {
        //console.log("*****")
        //console.log(newToken)
        return res.status(401).send({ message: "Access Denied", status: 401 });
    }

    try {
        //console.log(config.jwt_secret_key, newToken);
        const decoded = jwt.verify(newToken, config.jwt_secret_key);
        let user = await User.findOne({ emailAddress: decoded.data.emailAddress });
        req.user = user
        next()


    } catch (error) {
        //console.log(error)
        return res.status(401).send({ message: "Access Denied", status: 401 });

    }

}