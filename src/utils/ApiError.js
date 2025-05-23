class ApiError extends Error {
    constructor(
        statusCode,
        message = "Something went wrong",
        errors = [],
        stack = ""
    ) {
        super(message)
        this.statusCode = statusCode
        this.success = false
        this.errors = errors
        this.message = message
        this.data = null

        if (stack) {
            this.stack = stack
        } else {
            Error.captureStackTrace(this, this.constructor)
        }
    }
    toJson() {
        return {
            success: this.success,
            status: this.statusCode,
            message: this.message,
            errors: this.errors,
        };
    }
}

export default ApiError