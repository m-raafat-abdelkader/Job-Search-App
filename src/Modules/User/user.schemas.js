import Joi from "joi";
import { generalRules } from "../../Utils/general-rules.util.js";

export const signupSchema = {
    body: Joi.object({
        firstName: generalRules.firstName.required(),

        lastName: generalRules.lastName.required(),

        email: generalRules.email.required(),

        password: generalRules.password.required(),

        recoveryEmail: generalRules.email.required(),

        DOB: Joi.date().iso().required(),

        mobileNumber: generalRules.mobileNumber.required(),

        role: Joi.string().valid('User', 'Company_HR').required(),
        
        status: Joi.string().valid('online', 'offline').optional()
    }
    
   )
    
}



export const loginSchema = {
    body: Joi.object({
        email: generalRules.email.optional(),

        password: generalRules.password.required(),

        mobileNumber: generalRules.mobileNumber.optional()
    }
   ).or('email', 'mobileNumber')
    
}




export const updateUserSchema = {
    body: Joi.object({
        firstName: generalRules.firstName.optional(),

        lastName: generalRules.lastName.optional(),

        email: generalRules.email.optional(),

        recoveryEmail: generalRules.email.optional(),

        DOB: Joi.date().iso().optional(),

        mobileNumber: Joi.string().optional().pattern(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/).messages({
            "string.pattern.base": "Please enter a valid phone number following the format: +1234567890 or (123) 456-7890"
        })

        
    }
    
   ).or(
       'firstName',
       'lastName',
       'email',
       'recoveryEmail',
       'DOB',
       'mobileNumber'
   )
    
}





export const getAnotherUserSchema = {
   query: Joi.object({
       _id: generalRules.objectId.required()
   })
    
}




export const updatePasswordSchema = {
    body: Joi.object({
        oldPassword: generalRules.password.required(),
        newPassword: generalRules.password.required()
    }), 

    
}




export const forgetPasswordSchema = {
    query: Joi.object({
        email: generalRules.email.required()
    }),

    body: Joi.object({
        newPassword: generalRules.password.required()
    })


}




export const verifyOTPSchema = {
    params: Joi.object({
        otp: Joi.string().length(6).pattern(/^\d+$/).required(),
        newPassword: generalRules.password.required()
    })

}




export const getAllAccountsAssociatedtoRecoveryEmailSchema = {
    params: Joi.object({
        recoveryEmail: generalRules.email.required()
    })


}
