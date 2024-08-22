import { ErrorHandlerClass } from "../Utils/error-class.util.js"

/**
 * Creates an error handling middleware for asynchronous API routes.
 * @param {Function} API - Asynchronous function that handles API logic.
 * @returns {import('express').RequestHandler} Express middleware function (RequestHandler).
*/
export const errorHandler = (API)=>{
    return (req,res,next)=>{
        API(req,res,next).catch(
            (err)=>{
                next(new ErrorHandlerClass("Internal Server Error", 500,  "Error from errorHandler", err.stack))
            }
        )
    }
}


/**
 * Global error response middleware to handle errors and send appropriate JSON responses.
 * @param {ErrorHandlerClass} err - Instance of ErrorHandlerClass containing error details.
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next middleware function.
*/
export const globalResponse = (err,req,res,next)=>{
    if(err){
        return res.status(err['statusCode'] || 500).json({
            message: err.message,
            stack: err.stack,
            error_details: err.name,
            
        })
    }
}