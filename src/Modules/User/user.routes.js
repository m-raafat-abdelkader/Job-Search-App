import { Router } from "express"; 
import * as userController from "./user.controller.js";
import { errorHandler } from "../../Middlewares/error-handling.middleware.js";
import authentication from "../../Middlewares/authentication.middleware.js";
import authorization from "../../Middlewares/authorization.middleware.js";
import { validationMiddleware } from "../../Middlewares/validation.middleware.js";
import { signupSchema, loginSchema, updateUserSchema, getAnotherUserSchema, updatePasswordSchema, forgetPasswordSchema, verifyOTPSchema, getAllAccountsAssociatedtoRecoveryEmailSchema } from "./user.schemas.js";
import { roles } from "../../Utils/system-roles.util.js";



const router = Router()


router.post('/signup', validationMiddleware(signupSchema), errorHandler(userController.signup))

router.get('/verify-email/:token', errorHandler(userController.verifyEmail))

router.post('/login', validationMiddleware(loginSchema), errorHandler(userController.login))

router.put('/update', errorHandler(authentication()), errorHandler(authorization(roles.USERANDCOMPANY_HR)),  validationMiddleware(updateUserSchema), errorHandler(userController.updateUser))

router.delete('/delete', errorHandler(authentication()), errorHandler(authorization(roles.USERANDCOMPANY_HR)),  errorHandler(userController.deleteUser))

router.get('/get',  errorHandler(authentication()), errorHandler(authorization(roles.USERANDCOMPANY_HR)),  errorHandler(userController.getUser))

router.get('/getAnotherUser', errorHandler(authentication()), errorHandler(authorization(roles.USERANDCOMPANY_HR)),  validationMiddleware(getAnotherUserSchema), errorHandler(userController.getAnotherUser))

router.patch('/updatePassword', errorHandler(authentication()), errorHandler(authorization(roles.USERANDCOMPANY_HR)),  validationMiddleware(updatePasswordSchema), errorHandler(userController.updatePassword))

router.patch('/forgetPassword', validationMiddleware(forgetPasswordSchema), errorHandler(userController.forgetPassword))

router.get('/verify-otp/:otp/:newPassword', validationMiddleware(verifyOTPSchema), errorHandler(userController.verifyOTP))


router.post('/advancedForgetPassword', errorHandler(userController.advancedForgetPassword))
router.post('/verifyForgetPassword', errorHandler(userController.verifyForgetPassword))
router.put('/resetPassword', errorHandler(userController.resetPassword))



router.get('/getAllAccountsAssociatedtoRecoveryEmail/:recoveryEmail', validationMiddleware(getAllAccountsAssociatedtoRecoveryEmailSchema), errorHandler(userController.getAllAccountsAssociatedtoRecoveryEmail))




export default router