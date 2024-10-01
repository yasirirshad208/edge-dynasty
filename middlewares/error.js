const ErrorHandler = require('../utils/errorHandler')

module.exports = (err,req,res,next)=>{
    
    err.statusCode = err.statusCode || 500
    err.message = err.message || "Iternal Server Error"

    // Mongoose duplicate key error
    if (err.code === 11000) {
        const message = `Duplicate ${err.keyValue} Entered`;
        err = new ErrorHandler(message, 400);
    }
    

    res.status(err.statusCode).json({
        success:false,
        message: err.message
    })
}