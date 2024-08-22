import { ErrorHandlerClass } from "../Utils/error-class.util.js";
import jwt from "jsonwebtoken";
import User from "../../DB/Models/user.model.js";

/**
 * Middleware function for authenticating user tokens.
 * Checks for the presence and validity of the token, verifies its payload,
 * and retrieves user data from the database.
 * @returns {import("../Utils/error-class.util.js").ErrorHandlerClass} Returns an error handler instance if authentication fails.
*/
const authentication = () => {
    /**
     * Express middleware function that verifies the JWT token in request headers,
     * validates its format, retrieves user details from the database, and sets `req.userData` if authentication succeeds.
     * @async
     * @param {import("express").Request} req Express request object.
     * @param {import("express").Response} res Express response object.
     * @param {import("express").NextFunction} next Express next middleware function.
    */
    return async (req, res, next)=>{
            const {token} = req.headers; 

            // Check if token exists
            if(!token){
                return next(new ErrorHandlerClass("Token is required", 401, "Authentication error"))
            }

            
            // Check token format
            if(!token.startsWith("jobapp")){
                 return next(new ErrorHandlerClass("Invalid token", 401, "Authentication error"))
            } 


            // Extract the token from the header
            const originalToken = token.split(" ")[1]


            // Verify the token and decode payload
            const payload = jwt.verify(originalToken, process.env.LOGIN_SECRET)


            // Check if userId exists in the payload
            if(!payload?.userId){
                return next(new ErrorHandlerClass("Invalid token payload", 401))
            }


            // Find user by userId from payload and exclude password field
            const user = await User.findById(payload.userId).select("-password")


            // If user not found, return authentication error
            if(!user){
                 return next(new ErrorHandlerClass("User not found", 401, "Authentication error"))
            }
            

            // Check user status
            if(user.status === "offline"){
                return next(new ErrorHandlerClass("Please login first", 400, "Authentication error"))
            }


            // Attach user data to the request object
            req.userData = user


            // Proceed to the next middleware or route handler
            next()

       
    }
           
}

export default authentication