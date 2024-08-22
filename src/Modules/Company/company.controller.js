import { ErrorHandlerClass } from "../../Utils/error-class.util.js"
import $Set from "../../Utils/set-operator.util.js"
import compareObjectIDs from "../../Utils/compare-objectIDs.util.js"
import Company from "../../../DB/Models/company.model.js"
import Job from "../../../DB/Models/job.model.js"
import Application from "../../../DB/Models/application.model.js"
import User from "../../../DB/Models/user.model.js"




/**
 * Handles the addition of a new company.
 * 
 * @param {import('express').Request} req - The request object containing the company details in req.body.
 * @param {import('express').Response} res - The response object used to send a JSON response.
 * @param {import('express').NextFunction} next - The next middleware function.
 * @returns {Promise<void>} A promise that resolves once the company is added or rejects with an error.
*/
export const addCompany = async (req, res, next) => {
    const {companyName, description, industry, address, numberOfEmployees, companyEmail, companyHR} = req.body
    
    // Step 1: Validate if the requesting user is authorized (companyHR) to add a company
    const areEqual = compareObjectIDs(req.userData._id, companyHR)
    if(!areEqual){
        return next(new ErrorHandlerClass("The provided companyHR ID is not authorized", 403, "Add Company API error " +
            req.protocol +
            "://" +
            req.headers.host +
            req.originalUrl)
        )
    }


    // Step 2: Check if a company with the same name or email already exists
    const isCompanyExist = await Company.findOne({
        $or: [
            {companyName: companyName.toLowerCase()},
            {companyEmail}
        ]
    })

    if(isCompanyExist){
        return next(new ErrorHandlerClass("Company already exists", 409, "Add Company API error " +
            req.protocol +
            "://" +
            req.headers.host +
            req.originalUrl)
        )
    }


    // Step 3: Create a new company instance and save it to the database
    const company = new Company(
        {
            companyName,
            description,
            industry,
            address,
            numberOfEmployees,
            companyEmail,
            companyHR
        }
    )
    const newCompany = await company.save()


    return res.status(201).json({message: "Company added successfully", company_id: newCompany._id})
}






/**
 * Handles the update of an existing company.
 * 
 * @param {import('express').Request} req - The request object containing the updated company details in req.body and company ID in req.params.
 * @param {import('express').Response} res - The response object used to send a JSON response.
 * @param {import('express').NextFunction} next - The next middleware function.
 * @returns {Promise<void>} A promise that resolves once the company is updated or rejects with an error.
*/
export const updateCompany = async (req, res, next) => {
    const {companyName, description, industry, address, numberOfEmployees, companyEmail} = req.body
    const {_id} = req.params

    // Step 1: Check if companyName or companyEmail already exists for another company 
    if(companyName || companyEmail){
        const isCompanyExist = await Company.findOne({
            $or: [
                {companyName: companyName.toLowerCase()},
                {companyEmail}
            ]
        })
        if(isCompanyExist){
            return next(new ErrorHandlerClass("Company name or email already exists", 409, "Update Company API error " +
                req.protocol +
                "://" +
                req.headers.host +
                req.originalUrl)
            )
        }
    }



    // Step 2: Update the company in the database
    const updatedCompany = await Company.findOneAndUpdate(
        {_id, companyHR: req.userData._id}, 
        {
            $set: $Set({
                companyName, description, industry, address, numberOfEmployees, companyEmail 
            })
        },
        {new: true}
    ).select("-_id -updatedAt -createdAt -__v")


    // Step 3: Handle if the company was not found
    if(!updatedCompany){
        return next(new ErrorHandlerClass("Company not found", 400, "Update Company API error " +
            req.protocol +
            "://" +
            req.headers.host +
            req.originalUrl)
        )
    }


    
    return res.status(200).json({message: "Company updated successfully", updatedCompany})
   
    
}







/**
 * Deletes a company and associated jobs and applications.
 * 
 * @param {import('express').Request} req - The request object containing the company ID in req.params and user data in req.userData.
 * @param {import('express').Response} res - The response object used to send a JSON response.
 * @param {import('express').NextFunction} next - The next middleware function.
 * @returns {Promise<void>} A promise that resolves once the company and associated data are deleted or rejects with an error.
*/
export const deleteCompany = async (req, res, next) => {
    const {_id} = req.params

    // Step 1: Delete the company if found and user is authorized
    const deletedCompany = await Company.findOneAndDelete(
        {_id, companyHR: req.userData._id}
    )



    // Step 2: Handle if company was not found
    if(!deletedCompany){
        return next(new ErrorHandlerClass("Company not found", 400, "Delete Company API error " +
            req.protocol +
            "://" +
            req.headers.host +
            req.originalUrl)
        )
    }



    // Step 3: Find jobs added by the company HR (user) and delete them
    const jobs = await Job.find({addedBy: req.userData._id})
    await Job.deleteMany({addedBy: req.userData._id})


    // Step 4: Delete applications associated with each job
    for(const job of jobs){
        await Application.deleteMany({jobId: job._id})
    }


    return res.status(200).json({message: "Company deleted successfully"})
   
    
}







/**
 * Fetches a company and its associated jobs by company ID.
 * 
 * @param {import('express').Request} req - The request object containing the company ID in req.params.
 * @param {import('express').Response} res - The response object used to send a JSON response.
 * @param {import('express').NextFunction} next - The next middleware function.
 * @returns {Promise<void>} A promise that resolves once the company and associated jobs are fetched or rejects with an error.
*/
export const getCompany = async (req, res, next) => {
    const {_id:company_id} = req.params

    // Step 1: Fetch the company by its ID
    const company = await Company.findById(
        company_id
    ).select("-updatedAt -createdAt -__v")


    // Step 2: Handle if company is not found
    if(!company){
        return next(new ErrorHandlerClass("Company not found", 400, "GET Company API error " +
            req.protocol +
            "://" +
            req.headers.host +
            req.originalUrl)
        )
    }


    // Step 3: Fetch jobs associated with the company HR 
    const jobs = await Job.find({addedBy: company.companyHR}).select("-updatedAt -createdAt -__v")
    

    return res.status(200).json({message: "Company fetched successfully", company_data: company, Jobs: jobs})
   
    
}










/**
 * Fetches a company by its name.
 * 
 * @param {import('express').Request} req - The request object containing the company name in req.params.
 * @param {import('express').Response} res - The response object used to send a JSON response.
 * @param {import('express').NextFunction} next - The next middleware function.
 * @returns {Promise<void>} A promise that resolves once the company is fetched by name or rejects with an error.
*/
export const getCompanyByName = async (req, res, next) => {
    const {name} = req.params

    // Step 1: Find the company by companyName (case insensitive)
    const company = await Company.findOne(
        {companyName: name.toLowerCase()}
    ).select("-updatedAt -createdAt -__v")


    // Step 2: Handle if company is not found
    if(!company){
        return next(new ErrorHandlerClass("Company not found", 400, "GET Company API error " +
            req.protocol +
            "://" +
            req.headers.host +
            req.originalUrl)
        )
    }


    return res.status(200).json({message: "Company fetched successfully", company_data: company})
   
    
}









/**
 * Fetches all applications for a specific job.
 * 
 * @param {import('express').Request} req - The request object containing the jobId in req.params.
 * @param {import('express').Response} res - The response object used to send a JSON response.
 * @param {import('express').NextFunction} next - The next middleware function.
 * @returns {Promise<void>} A promise that resolves once applications are fetched or rejects with an error.
*/
export const getAllApplicationsForSpecificJob = async (req, res, next) => {
    const {jobId} = req.params

    // Step 1: Check if the job exists and is added by the requesting HR manager
    const isJobExist = await Job.findOne(
        {_id: jobId, addedBy: req.userData._id}
    )


    // Step 2: Handle if job is not found
    if(!isJobExist){
        return next(new ErrorHandlerClass("Job not found", 404, "GET All Applications for Specific Job API error " +
            req.protocol +
            "://" +
            req.headers.host +
            req.originalUrl)
        )
    }


    // Step 3: Fetch all applications for the job
    const applications = await Application.find({jobId}).select("-updatedAt -createdAt -__v")


    // Step 4: Populate each application with user data
    for(let i = 0; i < applications.length; i++){

        const userData = await User.findById(applications[i].userId).select("-updatedAt -createdAt -__v")

        // Remove userId from application and add userData
        delete applications[i].userId;
        
        applications[i] = {
            userData: userData, 
            ...applications[i]._doc 
        };
    }


    return res.status(200).json({message: "Applications fetched successfully", applications})
}
       
 
    
    

   






