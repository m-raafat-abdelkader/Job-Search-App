import Joi from "joi";
import { generalRules } from "../../Utils/general-rules.util.js";


export const addCompanySchema = {
    body: Joi.object({
        companyName: generalRules.companyName.required(),

        companyHR: generalRules.objectId.required(),

        description: generalRules.description.required(),

        industry: generalRules.industry.required(),

        address: generalRules.address.required(),

        numberOfEmployees: generalRules.numberOfEmployees.required(),

        companyEmail: generalRules.companyEmail.required()
    })

}



export const updateCompanySchema = {
    body: Joi.object({
        companyName: generalRules.companyName.optional(),

        description: generalRules.description.optional(),

        industry: generalRules.industry.optional(),

        address: generalRules.address.optional(),

        numberOfEmployees: generalRules.numberOfEmployees.optional(),

        companyEmail: generalRules.companyEmail.optional()
    }).or(
        "companyName",
        "description",
        "industry",
        "address",
        "numberOfEmployees",
        "companyEmail"
    ), 
    
    params: Joi.object({
        _id: generalRules.objectId.required()
    })
}



export const deleteCompanySchema = {
    params: Joi.object({
        _id: generalRules.objectId.required()
    })
}



export const getCompanySchema = {
    params: Joi.object({
        _id: generalRules.objectId.required()
    })
}



export const getCompanyByNameSchema = {
    params: Joi.object({
       name: generalRules.companyName.required()
    })
}



export const getAllApplicationsForSpecificJobSchema = {
    params: Joi.object({
        jobId: generalRules.objectId.required()
    })
}





