import {Router} from 'express'; 
import * as jobController from "./job.controller.js";
import { errorHandler } from "../../Middlewares/error-handling.middleware.js";
import authentication from "../../Middlewares/authentication.middleware.js";
import authorization from "../../Middlewares/authorization.middleware.js";
import { addJobSchema, updateJobSchema, deleteJobSchema, getAllJobsForSpecificCompanySchema, getAllJobsBySpecificFiltersSchema, applyForJobSchema } from "./job.schemas.js";
import { roles } from "../../Utils/system-roles.util.js";
import { validationMiddleware } from "../../Middlewares/validation.middleware.js";



const router = Router()

router.post('/add', errorHandler(authentication()), errorHandler(authorization(roles.COMPANY_HR)), validationMiddleware(addJobSchema), errorHandler(jobController.addJob))

router.put('/update/:id', errorHandler(authentication()), errorHandler(authorization(roles.COMPANY_HR)), validationMiddleware(updateJobSchema), errorHandler(jobController.updateJob))

router.delete('/delete/:id', errorHandler(authentication()), errorHandler(authorization(roles.COMPANY_HR)), validationMiddleware(deleteJobSchema), errorHandler(jobController.deleteJob))

router.get('/getAllJobsWithTheirCompany', errorHandler(authentication()), errorHandler(authorization(roles.USERANDCOMPANY_HR)), errorHandler(jobController.getAllJobsWithTheirCompany))

router.get('/getAllJobsForSpecificCompany', errorHandler(authentication()), errorHandler(authorization(roles.USERANDCOMPANY_HR)), validationMiddleware(getAllJobsForSpecificCompanySchema), errorHandler(jobController.getAllJobsForSpecificCompany))

router.get('/getAllJobsBySpecificFilters', errorHandler(authentication()), errorHandler(authorization(roles.USERANDCOMPANY_HR)), validationMiddleware(getAllJobsBySpecificFiltersSchema), errorHandler(jobController.getAllJobsBySpecificFilters))

router.post('/applyForJob', errorHandler(authentication()), errorHandler(authorization(roles.USER)), validationMiddleware(applyForJobSchema), errorHandler(jobController.applyForJob) )



export default router;