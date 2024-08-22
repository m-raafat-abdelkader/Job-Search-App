import Joi from "joi";
import { Types } from "mongoose";


/**
 * Custom validation rule to check if a value is a valid MongoDB ObjectId.
 *
 * @param {string} value - The value to validate.
 * @param {Object} helper - Joi's validation helper.
 * @returns {string} Returns the value if it is valid.
 * @throws {Error} Throws an error if the value is not a valid ObjectId.
*/
const ObjectIdRule = (value, helper)=>{
    const isValidObjectId = Types.ObjectId.isValid(value)
    if(!isValidObjectId){
        return helper.message("Invalid ObjectId")
    }
    return value
}



/**
 * General Joi validation rules for various fields.
*/
export const generalRules = {
    objectId: Joi.string().custom(ObjectIdRule),

    headers: {
        "content-type": Joi.string().valid("application/json").optional(),
        "user-agent": Joi.string().optional(),
        host: Joi.string().optional(),
        "accept-encoding": Joi.string().optional(),
        "content-length": Joi.number().optional(),
        accept: Joi.string().optional(),
        connection: Joi.string().optional(),
        "postman-token": Joi.string().optional(),
        "cache-control": Joi.string().optional()
    }, 

    email: Joi.string().email({
        minDomainSegments: 2,
        maxDomainSegments: 3
    }),

    password: Joi.string().pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*])[A-Za-z\d@$!%*]{8,}$/).messages({
        "string.pattern.base": "Password must contain at least one lowercase letter, one uppercase letter, one digit, and one special character"
    }),

    mobileNumber: Joi.string().pattern(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/).messages({
        "string.pattern.base": "Please enter a valid phone number following the format: +1234567890 or (123) 456-7890"
    }),
    firstName: Joi.string().trim().pattern(/^[a-zA-Z]{3,15}( [a-zA-Z]{3,15})?$/).messages({
        "string.pattern.base": "First name must contain only alphabets 3 to 15 characters"
    }),

    lastName: Joi.string().trim().pattern(/^[a-zA-Z]{3,15}( [a-zA-Z]{3,15})?$/).messages({
        "string.pattern.base": "Last name must contain only alphabets 3 to 15 characters"
    }),

    companyName: Joi.string().trim().pattern(/^[a-zA-Z]{3,15}( [a-zA-Z]{3,15})?$/).messages({
        "string.pattern.base": "Company name must contain only alphabets 3 to 15 characters"
    }),

    description: Joi.string().trim().pattern(/^(?=(?:[^A-Za-z]*[A-Za-z]){5}).*$/).min(10).max(100).messages({
        "string.pattern.base": "Description must contain at least 5 alphabetic characters"
    }),

    industry: Joi.string().trim().pattern(/^[A-Za-z\s\-&/'\.]+(?:\s*[^(]\w+)*$/).messages({
        "string.pattern.base": "Industry  "
    }),

    address: Joi.string().trim().pattern(/^\d+-\w+( \w+)*$|^[A-Za-z]+(, [A-Za-z]+)+$/),

    numberOfEmployees: Joi.string().pattern(/^(?!0)([1-9]\d*)-(0|[1-9]\d*)$/).messages({
        "string.pattern.base": "The number of employees must be specified in the format 'start-end', such as '1-100', where the end number must be greater than the start number"
    }),

    companyEmail: Joi.string().email({
        minDomainSegments: 2,
        maxDomainSegments: 3
    }), 

    jobTitle: Joi.string().trim().pattern(/^[A-Za-z\s\-&,.'()]{3,50}$/).messages({
        "string.pattern.base": "Job title must contain at least 3 characters and no more than 50 characters"
    }),

    jobLocation: Joi.string().valid("onsite", "remotely", "hybrid"),

    workingTime: Joi.string().valid("full-time", "part-time"),

    seniorityLevel: Joi.string().valid("Junior", "Mid-level", "Senior", "Team-Lead", "CTO"),

    jobDescription: Joi.string().trim().pattern(/^[A-Za-z0-9\s\-&,.'()!@#%$^*?_+={}[\]":;/\\|<>~`]{10,1000}$/).messages({
        "string.pattern.base": "Job description must contain at least 10 characters"
    }),

    technicalSkills: Joi.array().items(Joi.string().trim().pattern(/^[A-Za-z\s\-&.'()]{2,50}$/)).messages({
        "string.pattern.base": "Technical skills must be an array of strings"
    }),

    softSkills: Joi.array().items(Joi.string().trim().pattern(/^[A-Za-z\s\-&.'()]{3,50}$/)).messages({
        "string.pattern.base": "Soft skills must be an array of strings"
    })

}

