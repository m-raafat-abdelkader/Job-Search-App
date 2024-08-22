# Job Search App

The Job Search App allows users to find jobs relevant to their area of interest.

📘 Postman Documentation: https://documenter.getpostman.com/view/32279973/2sA3e49od7

## Features

- Filter options to find the desired job.
- Manages user data, company data, and job applications.

## Collections

### User Collection
- firstName
- lastName
- username (combination of firstName and lastName)
- email (unique)
- password
- recoveryEmail (not unique)
- DOB (date of birth in format YYYY-MM-DD)
- mobileNumber (unique)
- role (User, Company_HR)
- status (online, offline)

### Company Collection
- companyName (unique)
- description (company's activities and services)
- industry (e.g., Mental Health care)
- address
- numberOfEmployees (e.g., 11-20 employees)
- companyEmail (unique)
- companyHR (userId)

### Job Collection
- jobTitle (e.g., NodeJs back-end developer)
- jobLocation (onsite, remotely, hybrid)
- workingTime (part-time, full-time)
- seniorityLevel (Junior, Mid-Level, Senior, Team-Lead, CTO)
- jobDescription (details of the job and responsibilities)
- technicalSkills (array of skills, e.g., nodejs, typescript)
- softSkills (array of skills, e.g., time management, team worker)
- addedBy (ID of the companyHR who added this job)

### Application Collection
- jobId (the Job ID)
- userId (the applicant's ID)
- userTechSkills (array of the applicant's technical skills)
- userSoftSkills (array of the applicant's soft skills)
- userResume (link to resume)

## User APIs

- Sign Up
- Sign In
  - Sign in using email, recoveryEmail, or mobileNumber and password.
  - Update status to online after sign-in.
- Update Account
  - Update email, mobile number, recovery email, DOB, last name, or first name.
  - Ensure new data doesn't conflict.
  - User must be logged in; only the account owner can update their data.
- Delete Account
  - User must be logged in; only the account owner can delete their data.
- Get User Account Data
  - User must be logged in; only the account owner can retrieve their data.
- Get Profile Data for Another User
  - Send the userId in params or query.
- Update Password
- Forget Password
  - Ensure data security, especially OTP and new password.
- Get All Accounts Associated to a Specific Recovery Email

## Company APIs

- Add Company
  - Apply authorization with role (Company_HR).
- Update Company Data
  - Only the company owner can update the data.
  - Apply authorization with role (Company_HR).
- Delete Company Data
  - Only the company owner can delete the data.
  - Apply authorization with role (Company_HR).
- Get Company Data
  - Send the companyId in params to get the desired company data.
  - Return all jobs related to this company.
  - Apply authorization with role (Company_HR).
- Search for a Company by Name
  - Apply authorization with role (Company_HR and User).
- Get All Applications for a Specific Job
  - Each company owner can view applications for their jobs only.
  - Return each application with user data, not userId.
  - Apply authorization with role (Company_HR).

## Jobs APIs

- Add Job
  - Apply authorization with role (Company_HR).
- Update Job
  - Apply authorization with role (Company_HR).
- Delete Job
  - Apply authorization with role (Company_HR).
- Get All Jobs with Their Company's Information
  - Apply authorization with role (User and Company_HR).
- Get All Jobs for a Specific Company
  - Apply authorization with role (User and Company_HR).
  - Send the company name in the query to get this company's jobs.
- Get All Jobs that Match Specific Filters
  - Filter by workingTime, jobLocation, seniorityLevel, jobTitle, technicalSkills.
  - Apply authorization with role (User and Company_HR).
- Apply to Job
  - Add a new document in the application collection with the new data.
  - Apply authorization with role (User).
