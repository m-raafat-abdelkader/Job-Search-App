import User from "../../../DB/Models/user.model.js"
import { hashSync, compareSync } from "bcrypt"
import sendEmailService from "../../Services/send-email.service.js"
import jwt from "jsonwebtoken"
import { ErrorHandlerClass } from "../../Utils/error-class.util.js"
import $Set from "../../Utils/set-operator.util.js"
import Company from "../../../DB/Models/company.model.js"
import Job from "../../../DB/Models/job.model.js"
import Application from "../../../DB/Models/application.model.js"
import OTP from "../../../DB/Models/otp.model.js"
import otpGenerator from "otp-generator"
import crypto from "crypto"


/**
 * Handles user signup process, including validation, hashing password, sending confirmation email, and creating user in database.
 * 
 * @param {import('express').Request} req - The request object containing firstName, lastName, email, password, recoveryEmail, DOB, mobileNumber, role, and status in the body.
 * @param {import('express').Response} res - The response object used to send a JSON response.
 * @param {import('express').NextFunction} next - The next middleware function.
 * @returns {Promise<void>} A promise that resolves with a JSON response confirming the user creation, or rejects with an error.
*/
export const signup = async(req,res, next)=>{
    const {firstName, lastName, email, password, recoveryEmail, DOB, mobileNumber, role, status} = req.body

    // Step 1: Check if recovery email is same as email
    if(recoveryEmail === email){
        return next(new ErrorHandlerClass("Recovery email and email cannot be the same", 400,  "Signup API error " +
            req.protocol +
            "://" +
            req.headers.host +
        
            req.originalUrl))
    }


    // Step 2: Check if email or mobile number already exists
    const isEmailExist = await User.findOne({
        $or:[
            {email},
            {mobileNumber}
        ]
    })
    if(isEmailExist){
        return next(new ErrorHandlerClass("Email or mobile number already exists", 409,  "Signup API error " +
            req.protocol +
            "://" +
            req.headers.host +
            req.originalUrl))
    }
    

    // Step 3: Hash password
    const hash = hashSync(password, +process.env.SALT_ROUNDS)


    // Step 4: Create a new User instance
    const user = new User(
        {
            firstName,
            lastName,
            email,
            password: hash,
            recoveryEmail,
            dateOfBirth: DOB,
            mobileNumber,
            role,
            status
        }
    )



    // Step 5: Generate confirmation link
    const token = jwt.sign({userId: user._id}, process.env.EMAIL_VERIFICATION_SECRET, {expiresIn: process.env.EMAIL_VERIFICATION_EXPIRE})
    const confirmationLink = `${req.protocol}://${req.headers.host}/user/verify-email/${token}`
    const isEmailSent = await sendEmailService({
        to: email,
        subject: "Verify your email address",
        text: "Please verify your email",
        html: `<a href = ${confirmationLink}>Please verify your email</a>`
    })



    // Step 6: Handle case where email sending failed
    if(isEmailSent.rejected.length){
        return next(new ErrorHandlerClass("Email not sent", 500, "Signup API error " +
            req.protocol +
            "://" +
            req.headers.host +
            req.originalUrl))
    }



    // Step 7: Save the new User to the database
    const newUser = await user.save()
    

    return res.status(201).json({message: "User created successfully", userId: newUser._id})
        
} 








/**
 * Handles user email verification process.
 * 
 * @param {import('express').Request} req - The request object containing the verification token in the params.
 * @param {import('express').Response} res - The response object used to send a JSON response.
 * @param {import('express').NextFunction} next - The next middleware function.
 * @returns {Promise<void>} A promise that resolves with a JSON response confirming the user verification, or rejects with an error.
*/
export const verifyEmail = async(req,res, next)=>{
    const {token} = req.params

    // Step 1: Verify the token using the secret key
    const data = jwt.verify(token, process.env.EMAIL_VERIFICATION_SECRET)


    //Step 2: Update user's isConfirmed status if token is valid and user is not already confirmed
    const confirmedUser = await User.findOneAndUpdate(
        {_id: data?.userId, isConfirmed: false},
        {isConfirmed: true},
        {new: true}
    )


    // Step 3: Handle case where user is not found or already confirmed
    if(!confirmedUser){
        return next(new ErrorHandlerClass("User not found", 404, "Verify Email API error " +
            req.protocol +
            "://" +
            req.headers.host +
            req.originalUrl))
    }


    return res.status(200).json({message: 'User verified successfully', confirmedUser})
}








/**
 * Handles user login process and generates a token upon successful authentication.
 * 
 * @param {import('express').Request} req - The request object containing user credentials in the body.
 * @param {import('express').Response} res - The response object used to send a JSON response with the access token.
 * @param {import('express').NextFunction} next - The next middleware function.
 * @returns {Promise<void>} A promise that resolves with a JSON response containing the access token, or rejects with an error.
*/
export const login = async(req,res, next)=>{
    const {email, mobileNumber, password} = req.body

    // Step 1: Find user by email, recoveryEmail, or mobileNumber
    const user = await User.findOne({
        $or:[
            {email},
            {recoveryEmail: email},
            {mobileNumber}
        ]
    })

   
    // Step 2: Handle case where user is not found
    if(!user){
        return next(new ErrorHandlerClass("Invalid credentials", 401, "Sign in API error " +
            req.protocol +
            "://" +
            req.headers.host +
            req.originalUrl))
    }

    // Step 3: Compare password with user's stored password
    const isPasswordMatched = compareSync(password, user.password)
    if(!isPasswordMatched){
        return next(new ErrorHandlerClass("Invalid credentials", 401, "Signin API error " +
            req.protocol +
            "://" +
            req.headers.host +
            req.originalUrl))
    }


    // Step 4: Handle case where user is already logged in
    if(user.status === "online"){
        return next(new ErrorHandlerClass("User already logged in", 400, "Sign in API error " +
            req.protocol +
            "://" +
            req.headers.host +
            req.originalUrl))
    }


    // Step 5: Generate token with user information
    const token = jwt.sign({userId: user._id, email: user.email, recoveryEmail: user.recoveryEmail, mobileNumber: user.mobileNumber, role: user.role}, process.env.LOGIN_SECRET, {expiresIn: process.env.LOGIN_SECRET_EXPIRE})


    // Step 6: Update user's status to "online"
    await User.findByIdAndUpdate(
        user._id,
        {status: "online"},
        {new: true}
    )



    // Step 7: Send the token in response
    return res.status(200).json({message: "User logged in successfully", token})
}







/**
 * Updates user information such as email, mobile number, recovery email, date of birth, last name, and first name.
 * Sends an email verification link if the email is updated.
 * 
 * @param {import('express').Request} req - The request object containing the user's updated information in the body.
 * @param {import('express').Response} res - The response object used to send a JSON response with the updated user data.
 * @param {import('express').NextFunction} next - The next middleware function.
 * @returns {Promise<void>} A promise that resolves with a JSON response containing the updated user data, or rejects with an error.
*/
export const updateUser = async(req, res, next)=>{
    const {email , mobileNumber , recoveryEmail , DOB , lastName , firstName} = req.body
    const {_id} = req.userData
    

    // Step 1: Check if the new email or mobile number already exists in the database
    if(email || mobileNumber){
        const data = await User.findOne({
            $or:[
                {email},
                {mobileNumber}
            ]
        })
        if(data){
           return next(new ErrorHandlerClass("Email or mobile number already exists", 409, "Update User API error " +
            req.protocol +
            "://" +
            req.headers.host +
            req.originalUrl))
        }

    }


    // Step 2: Update user information in the database
    const updatedUser = await User.findByIdAndUpdate(
        _id,
        {
            $set: $Set(
                {
                email,
                mobileNumber,
                recoveryEmail,
                dateOfBirth: DOB,
                lastName,
                firstName
            })
        },
        {new: true}
    ).select("-password -isConfirmed -updatedAt -createdAt -__v")



    // Step 3: Send an email verification link if the email is updated
    if(email){
        const token = jwt.sign({userId:_id}, process.env.EMAIL_VERIFICATION_SECRET, {expiresIn: process.env.EMAIL_VERIFICATION_EXPIRE})
        const confirmationLink = `${req.protocol}://${req.headers.host}/user/verify-email/${token}`
        const isEmailSent = await sendEmailService({
            to: email,
            subject: "Verify your email address",
            text: "Please verify your email",
            html: `<a href = ${confirmationLink}>Please verify your email</a>`
        })
        if(isEmailSent.rejected.length){
            return next(new ErrorHandlerClass("Email not sent", 500, "Update User API error " +
            req.protocol +
            "://" +
            req.headers.host +
            req.originalUrl))
        }

    }
    

    return res.status(200).json({message: "User updated successfully", updatedUser})
}








/**
 * Deletes the user and all related data including companies, jobs, and applications.
 * 
 * @param {import('express').Request} req - The request object containing the user data in req.userData.
 * @param {import('express').Response} res - The response object used to send a JSON response with the deletion confirmation.
 * @param {import('express').NextFunction} next - The next middleware function.
 * @returns {Promise<void>} A promise that resolves with a JSON response indicating successful deletion, or rejects with an error.
*/
export const deleteUser = async(req, res, next)=>{
    const {_id} = req.userData
    
    // Step 1: Delete the user from the database
    await User.findByIdAndDelete(_id)

    // Step 2: Delete all companies where the user is the HR
    await Company.deleteMany({companyHR: _id})

    // Step 3: Delete all jobs where the user is the the HR
    await Job.deleteMany({addedBy: _id})

    // Step 4: Delete all applications where the user is an applicant
    await Application.deleteMany({userId: _id})

    return res.status(200).json({message: "User deleted successfully"})
    
}









/**
 * Fetches the user data excluding sensitive information.
 * 
 * @param {import('express').Request} req - The request object containing the user data in req.userData.
 * @param {import('express').Response} res - The response object used to send a JSON response with the user data.
 * @param {import('express').NextFunction} next - The next middleware function.
 * @returns {Promise<void>} A promise that resolves with a JSON response containing the user data.
*/
export const getUser = async(req, res, next)=>{
    const {_id} = req.userData

    // Step 1: Fetch the user data from the database excluding sensitive fields
    const user = await User.findById(_id).select("-password -isConfirmed -updatedAt -createdAt -__v")


    // Step 2: Respond with the user data
    return res.status(200).json({message: "User fetched successfully", userData: user})
    
}








/**
 * Fetches the data of another user based on the provided user ID.
 * 
 * @param {import('express').Request} req - The request object containing the user ID in req.query.
 * @param {import('express').Response} res - The response object used to send a JSON response with the user data.
 * @param {import('express').NextFunction} next - The next middleware function.
 * @returns {Promise<void>} A promise that resolves with a JSON response containing the user data or an error message.
*/
export const getAnotherUser = async(req, res, next)=>{
    const {_id} = req.query

    // Step 1: Fetch the user data from the database excluding sensitive fields
    const user = await User.findById(_id).select("-password -isConfirmed -updatedAt -createdAt -__v")


    // Step 2: Handle case where user is not found
    if(!user){
        return next(new ErrorHandlerClass("User not found", 404, "Get Data of Another User API error " +
            req.protocol +
            "://" +
            req.headers.host +
            req.originalUrl))
    }

    return res.status(200).json({message: "User fetched successfully", userData: user})
    
}







/**
 * Updates the password for the logged-in user.
 * 
 * @param {import('express').Request} req - The request object containing the user ID in req.userData and the new password in req.body.
 * @param {import('express').Response} res - The response object used to send a JSON response indicating the result of the password update.
 * @param {import('express').NextFunction} next - The next middleware function.
 * @returns {Promise<void>} A promise that resolves with a JSON response indicating the password update status.
*/
export const updatePassword = async(req, res, next)=>{
    const {_id} = req.userData
    const {oldPassword, newPassword} = req.body

    // Step 1: Hash the new password
    const hash = hashSync(newPassword, +process.env.SALT_ROUNDS)

    // Step 2: Update the user's password in the database
    await User.findOneAndUpdate(
        {
          _id: _id,
          password: oldPassword
        },
        {
          password: hash
        }
    );


    return res.status(200).json({message: "Password updated successfully"})
}








/**
 * Handles the forget password process by generating an OTP and sending it to the user's email.
 * 
 * @param {import('express').Request} req - The request object containing the email in req.query and the new password in req.body.
 * @param {import('express').Response} res - The response object used to send a JSON response indicating the result of the forget password process.
 * @param {import('express').NextFunction} next - The next middleware function.
 * @returns {Promise<void>} A promise that resolves with a JSON response indicating the OTP send status.
*/
export const forgetPassword = async(req, res, next)=>{
    const {email} = req.query
    const {newPassword} = req.body

    // Step 1: Check if user exists with the given email
    const isUserExist = await User.findOne({email})
    if(!isUserExist){
        return next(new ErrorHandlerClass("User not found", 404, "Forget Password API error " +
            req.protocol +
            "://" +
            req.headers.host +
            req.originalUrl
        ))
    }


    // Step 2: Generate OTP 
    const otp = otpGenerator.generate(process.env.OTP_LENGTH, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
    });

    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");
    // Step 3: Create a new OTP instance and save it in database
    const otpDoc = new OTP({
        email,
        otp: hashedOtp
    })
    await otpDoc.save()


    // Step 4: Send OTP to the user's email
    const verifyOTP = `${req.protocol}://${req.headers.host}/user/verify-otp/${otp}/${newPassword}`
    const isEmailSent = await sendEmailService({
            to: email,
            subject: "Reset your password",
            text: `Your OTP is: ${otp}`,
            html: `<a href = ${verifyOTP}> click here to reset your password </a>`
    })


    // Step 5: Handle case where OTP sending failed
    if(isEmailSent.rejected.length){
        return next(new ErrorHandlerClass("Error sending OTP", 500, "Forget Password API error " +
        req.protocol +
        "://" +
        req.headers.host +
        req.originalUrl))
    }

    return res.status(200).json({message: "OTP is sent to your email"})

}



/**
 * Verifies the OTP and updates the user's password.
 * 
 * @param {import('express').Request} req - The request object containing the OTP and new password in req.params.
 * @param {import('express').Response} res - The response object used to send a JSON response indicating the result of the OTP verification process.
 * @param {import('express').NextFunction} next - The next middleware function.
 * @returns {Promise<void>} A promise that resolves with a JSON response indicating the password update status.
*/
export const verifyOTP = async(req, res, next)=>{
    const {otp, newPassword} = req.params
    
    // Step 1: Check if OTP exists in the database
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");
    const isOTPExist = await OTP.findOne({otp: hashedOtp})
    if(!isOTPExist){
        return next(new ErrorHandlerClass("OTP is expired or invalid", 400, "Verify OTP API error " +
            req.protocol +
            "://" +
            req.headers.host +
            req.originalUrl))
    }


    // Step 2: Update the user's password
    await User.findOneAndUpdate(
        {email: isOTPExist.email},
        {password: hashSync(newPassword, +process.env.SALT_ROUNDS)},
        {new: true}
    )


    // Step 3: Delete the OTP from the database
    await OTP.findByIdAndDelete(isOTPExist._id)


    return res.status(200).json({message: "new password created successfully"})
}




/**
 * 
 * @desc Handles the forget password process 
 * @route post /user/advancedForgetPassword
 * @access public
 */
export const advancedForgetPassword = async(req, res, next)=>{
    const {email} = req.query

    // Step 1: Check if user exists with the given email
    const user = await User.findOne({email})
    if(!user){
        return next(new ErrorHandlerClass("User not found", 404, "Advanced Forget Password API error " +
            req.protocol +
            "://" +
            req.headers.host +
            req.originalUrl
        ))
    }

    // Step 2: Generate random hashed reset code of 6 digits and save it in database
    const resetCode = Math.floor(100000 + Math.random()*900000).toString()
    const hashedResetCode = crypto.createHash('sha256').update(resetCode).digest('hex')

    user.passwordResetCode = hashedResetCode

    //15 minutes from now
    user.passwordResetExpires = Date.now() + 15*60*1000

    user.passwordResetVerified = false

    await user.save()

    // Step 3: Send reset code to the user's email
    const message = `
    Hi ${user.firstName} ${user.lastName},\n
    Your reset code is: ${resetCode} and it will expire in 15 minutes.\n 
    If you didn't request this, please ignore this email.
    `; 

    try {
        await sendEmailService({
            to: user.email,
            subject: "Reset your password",
            text: message
        })
    } catch (error) {
        user.passwordResetCode = undefined;
        user.passwordResetExpires = undefined;
        user.passwordResetVerified = undefined;
        await user.save();

        return next(new ErrorHandlerClass('Error sending reset code', 500, "Advanced Forget Password API error " +
            req.protocol +
            "://" +
            req.headers.host +
            req.originalUrl
        ))
    }


    return res.status(200).json({
        status: "success",
        message: "Reset code sent to your email"
    })
}


/**
 * 
 * @desc Verifies the reset code
 * @route post /user/verifyForgetPassword
 * @access public
 */
export const verifyForgetPassword = async(req, res, next)=>{
    
    // Step 1: Check if reset code is valid
    const hashedResetCode = crypto.createHash('sha256').update(req.body.resetCode).digest('hex')
    const user = await User.findOne(
        {
            passwordResetCode: hashedResetCode,
            passwordResetExpires: {$gt: Date.now()}
        })

    // Step 2: Handle case where reset code is invalid
    if(!user){
        return next(new ErrorHandlerClass("Invalid reset code or expired", 400, "Verify Forget Password API error " +
            req.protocol +
            "://" +
            req.headers.host +
            req.originalUrl
        ))
    }

    // Step 3: Verify reset code
    user.passwordResetVerified = true

    await user.save()

    return res.status(200).json({
        status: "success"
    })
}



/**
 * 
 * @desc Reset password
 * @route put /user/resetPassword
 * @access public
 */
export const resetPassword = async(req, res, next)=>{
    // Step 1: Check if user exists
    const user = await User.findOne({email: req.body.email})

    if(!user){
        return next(new ErrorHandlerClass("User not found", 404, "Reset Password API error " +
            req.protocol +
            "://" +
            req.headers.host +
            req.originalUrl
        ))
    }

    // Step 2: Check if reset code is verified
    if(!user.passwordResetVerified){
        return next(new ErrorHandlerClass("Reset code not verified", 400, "Reset Password API error " +
            req.protocol +
            "://" +
            req.headers.host +
            req.originalUrl
        ))
    }


    // Step 3: Update password in database
    user.password = hashSync(req.body.password, +process.env.SALT_ROUNDS) 

    // Step 4: Remove reset code from database
    user.passwordResetCode = undefined
    user.passwordResetExpires = undefined
    user.passwordResetVerified = undefined

    await user.save()


    return res.status(200).json({
        status: "success",
        message: "Password reset successfully"
    })
}







/**
 * Fetches all user accounts associated with a given recovery email.
 *
 * @param {import('express').Request} req - The request object containing the recovery email in req.params.
 * @param {import('express').Response} res - The response object used to send a JSON response with user data.
 * @param {import('express').NextFunction} next - The next middleware function.
 * @returns {Promise<void>} A promise that resolves with a JSON response containing user data or an error message.
*/
export const getAllAccountsAssociatedtoRecoveryEmail = async(req, res, next)=>{
    const{recoveryEmail} = req.params

    // Step 1: Find users associated with the recovery email
    const users = await User.find({recoveryEmail})

    // Step 2: Handle case where no users are found
    if(users.length === 0){
        return next(new ErrorHandlerClass("No users associated to this recovery email", 404, "Get All Accounts Associated to Recovery Email API error" +
            req.protocol +
            "://" +
            req.headers.host +
            req.originalUrl))
    }

    return res.status(200).json({message: "Users associated to this recovery email", users})
}






