import { ErrorHandlerClass } from "../Utils/error-class.util.js"

const reqKeys = ['body', 'params', 'query', 'headers']

/**
 * Creates a validation middleware to validate request body, params, query, or headers against a schema.
 * @param {Object} schema - Joi schema object to validate the request body.
 * @returns {import('express').RequestHandler} Express middleware function (RequestHandler).
*/
export const validationMiddleware = (schema)=>{
    return (req,res,next)=>{
        const validationErrors = []
        for (const key of reqKeys) {
            const validationResult = schema[key]?.validate(req[key], {abortEarly: false})
            if(validationResult?.error){
                validationErrors.push(...validationResult.error.details)
            }
        }
        validationErrors.length 
        ? next(new ErrorHandlerClass("Validation error", 400,validationErrors)) 
        : next()
    }
}

