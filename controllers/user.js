const User = require('../models/user');

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
    //console.log(userid)
    try {
        await User.deleteOne({
            _id: userid,
        })
            .then(data => {
                //console.log("User Deleted!", data);
                return res.status(200).json({
                    status: true,
                    message: "User Removed Successfully!"
                })
            })
            .catch(err => {
                //console.log(err);
                return res.status(400).json({
                    status: false,
                    message: "Cannot Delete User!"
                })
            })

    } catch (err) {
        //console.log(err);
        res.status(500).send("Error in Deleting...");
    }

}

