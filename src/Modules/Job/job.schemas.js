import Joi from "joi";
import { generalRules } from "../../Utils/general-rules.util.js";


export const addJobSchema = {
    body: Joi.object({
        jobTitle: generalRules.jobTitle.required(),
        jobDescription: generalRules.jobDescription.required(),
        jobLocation: generalRules.jobLocation.required(),
        workingTime: generalRules.workingTime.required(),
        seniorityLevel: generalRules.seniorityLevel.required(),
        technicalSkills: generalRules.technicalSkills.required(),
        softSkills: generalRules.softSkills.required(),
        addedBy: generalRules.objectId.required()
    })
}




export const updateJobSchema = {
    body: Joi.object({
        jobTitle: generalRules.jobTitle.optional(),
        jobDescription: generalRules.jobDescription.optional(),
        jobLocation: generalRules.jobLocation.optional(),
        workingTime: generalRules.workingTime.optional(),
        seniorityLevel: generalRules.seniorityLevel.optional(),
        technicalSkills: generalRules.technicalSkills.optional(),
        softSkills: generalRules.softSkills.optional()
        
    }).or('jobTitle', 
        'jobDescription',
        'jobLocation', 
        'workingTime', 
        'seniorityLevel',
        'technicalSkills',
        'softSkills'
    ),

    params: Joi.object({
        id: generalRules.objectId.required()
    })
}




export const deleteJobSchema = {
    params: Joi.object({
        id: generalRules.objectId.required()
    })
}




export const getAllJobsForSpecificCompanySchema = {
    query: Joi.object({
        companyName: generalRules.companyName.required()
    })
}





export const getAllJobsBySpecificFiltersSchema = {
    body: Joi.object({
        jobTitle: generalRules.jobTitle.optional(),
        jobLocation: generalRules.jobLocation.optional(),
        workingTime: generalRules.workingTime.optional(),
        seniorityLevel: generalRules.seniorityLevel.optional(),
        technicalSkills: generalRules.technicalSkills.optional(),
        
    }).or('jobTitle', 
        'jobDescription',
        'jobLocation', 
        'workingTime', 
        'seniorityLevel',
        'technicalSkills',
        'softSkills'
    )
}





export const applyForJobSchema = {
    body: Joi.object({
        jobId: generalRules.objectId.required(),
        userId: generalRules.objectId.required(),
        userTechSkills: generalRules.technicalSkills.required(),
        userSoftSkills: generalRules.softSkills.required(),
        userResume: Joi.string().required().pattern(/^(https?:\/\/)?((([a-zA-Z0-9_-]+\.)+[a-zA-Z]{2,6})|localhost|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}|\[?[a-fA-F0-9:]+\]?)?(:\d+)?(\/[a-zA-Z0-9#?\/&=_.-]*)?$/)
    })
   
}



