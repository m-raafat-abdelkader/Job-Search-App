import {Router} from 'express'; 
import * as companyController from "./company.controller.js";
import { errorHandler } from "../../Middlewares/error-handling.middleware.js";
import authentication from "../../Middlewares/authentication.middleware.js";
import authorization from "../../Middlewares/authorization.middleware.js";
import { roles } from "../../Utils/system-roles.util.js";
import { addCompanySchema, updateCompanySchema, deleteCompanySchema, getCompanySchema, getCompanyByNameSchema, getAllApplicationsForSpecificJobSchema } from "./company.schmas.js";
import { validationMiddleware } from "../../Middlewares/validation.middleware.js";



const router = Router()

router.post('/add', errorHandler(authentication()), errorHandler(authorization(roles.COMPANY_HR)), validationMiddleware(addCompanySchema), errorHandler(companyController.addCompany))

router.put('/update/:_id', errorHandler(authentication()), errorHandler(authorization(roles.COMPANY_HR)), validationMiddleware(updateCompanySchema), errorHandler(companyController.updateCompany))

router.delete('/delete/:_id', errorHandler(authentication()), errorHandler(authorization(roles.COMPANY_HR)), validationMiddleware(deleteCompanySchema), errorHandler(companyController.deleteCompany))

router.get('/get/:_id', errorHandler(authentication()), errorHandler(authorization(roles.COMPANY_HR)), validationMiddleware(getCompanySchema), errorHandler(companyController.getCompany))

router.get('/getByName/:name', errorHandler(authentication()), errorHandler(authorization(roles.USERANDCOMPANY_HR)), validationMiddleware(getCompanyByNameSchema), errorHandler(companyController.getCompanyByName))

router.get('/getAllApplicationsForSpecificJob/:jobId', errorHandler(authentication()), errorHandler(authorization(roles.COMPANY_HR)), validationMiddleware(getAllApplicationsForSpecificJobSchema), errorHandler(companyController.getAllApplicationsForSpecificJob))




export default router;