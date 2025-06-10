const User = require('../models/user');
const ActionLogger = require("../models/actionLogger");
const { json } = require('body-parser');

exports.getUsers = async (req, res, next) => {
    try {
        let users = await User.find({}).exec()
        if (!users) {
            res.status(400).json({
                status: false,
                data: []
            })
        } else {
            res.status(200).json({
                status: true,
                data: users
            })
        }
    } catch (err) {
        res.status(500).json({
            status: false,
            data: []
        });
    }

}

exports.deleteUser = async (req, res, next) => {

    const { userid } = req.body
    ////console.log(userid)
    try {
        await User.deleteOne({
            _id: userid,
        })
            .then(data => {
                ////console.log("User Deleted!", data);
                return res.status(200).json({
                    status: true,
                    message: "User Removed Successfully!"
                })
            })
            .catch(err => {
                ////console.log(err);
                return res.status(400).json({
                    status: false,
                    message: "Cannot Delete User!"
                })
            })

    } catch (err) {
        ////console.log(err);
        res.status(500).send("Error in Deleting...");
    }

}

exports.updateUser = async (req, res, next) => {
    const { userId, userName, email } = req.body;
    await User.findByIdAndUpdate(userId, {
        $set: {
            username: userName,
            emailAddress: email,
        }
    }).then(success => {
        return res.status(200).json({
            status: true,
            message: 'User Updated Successfully!'
        })
    }).catch(err => {
        //console.log(err);
        return res.status(400).json({
            status: false,
            message: 'User Update Failed! Please Try Again.'
        })
    })
}

exports.getStatsForAllUsers = async (req, res, next) => {
    let now = new Date();
    let today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let results = await ActionLogger.find({ date: {$gte: today}}).populate({path: "user", model: User}).exec()
    if (results.length > 0) {
        return res.status(200).json({
            status: true,
            total: results.length,
            data: results
        })
    } else {
        return res.status(400).json({
            status: false,
            total: results.length,
            data: results,
        })
    }
}

exports.getUserStats = async (req, res, next) => {
    const { userId, duration } = req.query;
    let today = new Date();
    let lastDate = new Date();
    if ( duration == 'weekly' ) {
        lastDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7)
    } else if (duration == 'monthly') {
        lastDate = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate())
    } else {
        let now = new Date();
        lastDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }
    let results = await ActionLogger.find({ user: userId, date: {$gte: lastDate} })
    if (results.length > 0) {
        return res.status(200).json({
            status: true,
            total: results.length,
            data: results,
        })
    } else {
        return res.status(400).json({
            status: false,
            total: results.length,
            data: results,
        })
    }
}