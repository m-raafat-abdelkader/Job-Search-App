 import { ErrorHandlerClass } from "../Utils/error-class.util.js"

/**
 * Middleware function to authorize access based on user roles.
 * @param {string[]} roles - Array of roles allowed to access the route.
 * @returns {import("../Utils/error-class.util.js").ErrorHandlerClass} Returns an error handler instance if authorization fails.
*/
 const authorization = (roles)=>{
    return async (req,res,next)=>{
        const {role} = req.userData

        // Check if user role is included in allowed roles
        if(!roles.includes(role)){
            return next(new ErrorHandlerClass("Unauthorized access", 403, "Authorization error"))
        }

        // Proceed to the next middleware or route handler if authorized
        next()
    }
}

export default authorization