class ResponseHandler{
    constructor(res, statusCode, success, message, data){
        this.res = res
        this.statusCode = statusCode
        this.success = success
        this.message = message
        this.data = data

        return res.status(statusCode).json({
            success:success,
            message:message,
            data:data
        })
    }
}

module.exports = ResponseHandler