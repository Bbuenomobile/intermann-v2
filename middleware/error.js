module.exports.error = (err, req, res, next) => {
    //console.log(err.stack);
    res.status(500).json({message: "Something Went Wrong! Please Refresh Your Page and Try Again."});
}