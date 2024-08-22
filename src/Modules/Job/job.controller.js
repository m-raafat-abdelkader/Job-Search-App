import $Set from "../../Utils/set-operator.util.js"
import { ErrorHandlerClass } from "../../Utils/error-class.util.js"
import compareObjectIDs from "../../Utils/compare-objectIDs.util.js"
import Job from "../../../DB/Models/job.model.js"
import Company from "../../../DB/Models/company.model.js"
import Application from "../../../DB/Models/application.model.js"



/**
 * Adds a new job.
 * 
 * @param {import('express').Request} req - The request object containing job details in req.body.
 * @param {import('express').Response} res - The response object used to send a JSON response.
 * @param {import('express').NextFunction} next - The next middleware function.
 * @returns {Promise<void>} A promise that resolves once the job is added or rejects with an error.
*/
export const addJob = async (req, res, next) => {
    const {jobTitle, jobDescription, jobLocation, workingTime, seniorityLevel, technicalSkills, softSkills, addedBy} = req.body

    // Step 1: Check if addedBy ID matches the requesting user's ID
    const areEqual = compareObjectIDs(req.userData._id, addedBy)
    if(!areEqual){
        return next(new ErrorHandlerClass("The provided addedBy ID is not authorized", 403, "Add Job API error " +
            req.protocol +
            "://" +
            req.headers.host +
            req.originalUrl)
        )
    }


    // Step 2: Verify if there is a company associated with the addedBy ID
    const isCompanyExist = await Company.findOne({companyHR: addedBy})
    if(!isCompanyExist){
        return next(new ErrorHandlerClass(" No company found related to this HR ID", 400, "Add Job API error " +
            req.protocol +
            "://" +
            req.headers.host +
            req.originalUrl)
        )
    }


    // Step 3: Create a new job instance and save it to the database
    const job = new Job({
        jobTitle,
        jobDescription,
        jobLocation,
        workingTime, 
        seniorityLevel,
        technicalSkills,
        softSkills,
        addedBy
    })
    const newJob = await job.save()

    
    return res.status(201).json({message: "Job added successfully", job_id: newJob._id})

}






/**
 * Updates an existing job.
 * 
 * @param {import('express').Request} req - The request object containing job details in req.body and jobID in req.params.
 * @param {import('express').Response} res - The response object used to send a JSON response.
 * @param {import('express').NextFunction} next - The next middleware function.
 * @returns {Promise<void>} A promise that resolves once the job is updated or rejects with an error.
*/
export const updateJob = async (req, res, next) => {
    const {jobTitle, jobDescription, jobLocation, workingTime, seniorityLevel, technicalSkills, softSkills} = req.body
    const {id} = req.params

    // Step 1: Update the job using findOneAndUpdate
    const updatedJob = await Job.findOneAndUpdate(
        {_id: id, addedBy: req.userData._id},
        {
            $set: $Set({
                jobTitle, jobDescription, jobLocation, workingTime, seniorityLevel, technicalSkills, softSkills
            })
        },
        {new: true}
    ).select("-_id -updatedAt -createdAt -__v")


    // Step 2: Check if the job was updated successfully
    if(!updatedJob){
        return next(new ErrorHandlerClass("Job not found", 404, "Update Job API error " +
            req.protocol +
            "://" +
            req.headers.host +
            req.originalUrl)
        )
    }


    return res.status(200).json({message: "Job updated successfully", updatedJob})

}







/**
 * Deletes a job.
 * 
 * @param {import('express').Request} req - The request object containing job ID in req.params.
 * @param {import('express').Response} res - The response object used to send a JSON response.
 * @param {import('express').NextFunction} next - The next middleware function.
 * @returns {Promise<void>} A promise that resolves once the job is deleted or rejects with an error.
*/
export const deleteJob = async (req, res, next) => {
    const {id} = req.params

    // Step 1: Delete the job using findOneAndDelete
    const deletedJob = await Job.findOneAndDelete(
        {_id: id, addedBy: req.userData._id}
    )


    // Step 2: Check if the job was deleted successfully
    if(!deletedJob){
        return next(new ErrorHandlerClass("Job not found", 404, "Delete Job API error " +
            req.protocol +
            "://" +
            req.headers.host +
            req.originalUrl)
        )
    }


    // Step 3: Delete all applications related to the deleted job
    await Application.deleteMany({jobId: id})

    return res.status(200).json({message: "Job deleted successfully"})

}







/**
 * Retrieves all jobs with their associated company details.
 * 
 * @param {import('express').Request} req - The request object (not used in this function).
 * @param {import('express').Response} res - The response object used to send a JSON response.
 * @param {import('express').NextFunction} next - The next middleware function.
 * @returns {Promise<void>} A promise that resolves with a JSON response containing jobs and associated company details, or rejects with an error.
*/
export const getAllJobsWithTheirCompany = async (req, res, next) => {

    // Step 1: Retrieve all jobs while excluding certain fields
    const jobs = await Job.find().select(
        "-updatedAt -createdAt -__v"
    )


    // Step 2: Iterate through each job to fetch its associated company details
    for(const job of jobs){
        const company = await Company.findOne({companyHR:job.addedBy}).select("-updatedAt -createdAt -__v")
        job._doc.company = company
    }
    

    // Step 3: Handle case where no jobs are found
    if(jobs.length === 0){
        return next(new ErrorHandlerClass("Jobs not found", 404, "Get All Jobs With Their Company's Information API error " +
            req.protocol +
            "://" +
            req.headers.host +
            req.originalUrl)
        )
    }


    return res.status(200).json({message: "Jobs fetched successfully", jobs})

}







/**
 * Retrieves all jobs for a specific company based on the company name provided in the query parameters.
 * 
 * @param {import('express').Request} req - The request object containing query parameters.
 * @param {import('express').Response} res - The response object used to send a JSON response.
 * @param {import('express').NextFunction} next - The next middleware function.
 * @returns {Promise<void>} A promise that resolves with a JSON response containing jobs for the specified company, or rejects with an error.
*/
export const getAllJobsForSpecificCompany = async (req, res, next) => {
    const {companyName} = req.query

    // Step 1: Find the company by its name, converting to lowercase to ensure case insensitivity
    const company = await Company.findOne({companyName: companyName.toLowerCase()}).select("-updatedAt -createdAt -__v")


    // Step 2: Handle case where company is not found
    if(!company){
        return next(new ErrorHandlerClass("Company not found", 404, "Get All Jobs For a Specific Company API error " +
            req.protocol +
            "://" +
            req.headers.host +
            req.originalUrl)
        )
    }



    // Step 3: Find all jobs added by the company's HR and exclude certain fields from the response
    const jobs = await Job.find({addedBy: company.companyHR}).select(
        "-updatedAt -createdAt -__v"
    )



    // Step 4: Handle case where no jobs are found for the company
    if(jobs.length === 0){
        return next(new ErrorHandlerClass("Jobs not found", 404, "Get All Jobs For a Specific Company API error " +
            req.protocol +
            "://" +
            req.headers.host +
            req.originalUrl)
        )
    }


    // Step 5: Insert company name at the beginning of the jobs array for better clarity
    jobs.splice(0, 0, (`company_name: ${company.companyName}`))


    return res.status(200).json({message: "Jobs fetched successfully", jobs})

}









/**
 * Retrieves all jobs that match specific filters provided in the request body.
 * 
 * @param {import('express').Request} req - The request object containing filter parameters in the body.
 * @param {import('express').Response} res - The response object used to send a JSON response.
 * @param {import('express').NextFunction} next - The next middleware function.
 * @returns {Promise<void>} A promise that resolves with a JSON response containing jobs matching the filters, or rejects with an error.
*/
export const getAllJobsBySpecificFilters = async (req, res, next) => {
   
    const{jobTitle, jobLocation, workingTime, seniorityLevel, technicalSkills} = req.body

    // Step 1: Find all jobs that match the specified filters and exclude certain fields from the response
    const jobs = await Job.find({
        $or: [
            {jobTitle: jobTitle.toLowerCase()},
            {jobLocation: jobLocation},
            {workingTime: workingTime},
            {seniorityLevel: seniorityLevel},
            {technicalSkills: technicalSkills}
        ]
    }).select(
        "-updatedAt -createdAt -__v"
    )

    // Step 2: Handle case where no jobs are found for the specified filters
    if(jobs.length === 0){
        return next(new ErrorHandlerClass("Jobs not found", 404, "Get All Jobs By Specific Filters API error " +
            req.protocol +
            "://" +
            req.headers.host +
            req.originalUrl)
        )
    }


    return res.status(200).json({message: "Jobs fetched successfully", jobs})

}








/**
 * Submits a job application for a specified job by a user.
 * 
 * @param {import('express').Request} req - The request object containing jobId, userId, userTechSkills, userSoftSkills, and userResume in the body.
 * @param {import('express').Response} res - The response object used to send a JSON response.
 * @param {import('express').NextFunction} next - The next middleware function.
 * @returns {Promise<void>} A promise that resolves with a JSON response confirming the application submission, or rejects with an error.
*/
export const applyForJob = async (req, res, next) => {
    const {jobId, userId, userTechSkills, userSoftSkills, userResume} = req.body

    // Step 1: Validate if the provided userId matches the authenticated user's id
    const areEqual = compareObjectIDs(req.userData._id, userId)
    if(!areEqual){
        return next(new ErrorHandlerClass("The provided userID is not authorized", 403, "Apply for Job API error " +
            req.protocol +
            "://" +
            req.headers.host +
            req.originalUrl)
        )
    }

    // Step 2: Check if the job with the provided jobId exists
    const isJobExist = await Job.findById(jobId)
    if(!isJobExist){
        return next(new ErrorHandlerClass("Job not found", 400, "Apply for Job API error " +
            req.protocol +
            "://" +
            req.headers.host +
            req.originalUrl)
        ) 
    }
    

    // Step 3: Check if the user has already applied for the job
    const isUserAlreadyApplied = await Application.findOne({
        $and: [
            {jobId},
            {userId}
        ]
    })
    if(isUserAlreadyApplied){
        return next(new ErrorHandlerClass("User already applied for this job", 400, "Apply for Job API error " +
            req.protocol +
            "://" +
            req.headers.host +
            req.originalUrl)
        ) 
    }


    // Step 4: Create a new application instance and save it to the database
    const application = new Application({
        jobId,
        userId,
        userTechSkills,
        userSoftSkills,
        userResume
    })
    const newApplication = await application.save()

    return res.status(201).json({message: "Application submitted successfully", application_id: newApplication._id})

}






