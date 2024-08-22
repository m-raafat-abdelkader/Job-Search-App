import mongoose from "mongoose";
import {systemRoles} from "../../src/Utils/system-roles.util.js";

const {Schema, model} = mongoose;


const userSchema = new Schema({
    firstName:{
        type:String,
        required:true,
        trim:true,
        lowercase:true,
        minLength:3,
        maxLength:15
    },
    lastName:{
        type:String,
        required:true,
        trim:true,
        lowercase:true,
        minLength:3,
        maxLength:15
    },
    userName:{
        type:String,
        unique:true,
        
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
        minLength: 8
    },
    recoveryEmail:{
        type:String,
        required:true
    },
    dateOfBirth:{
        type:Date,
        required:true
    },
    mobileNumber:{
        type:String,
        required:true,
        unique:true
    },
    role:{
        type:String,
        enum: Object.values(systemRoles),
        required:true
    },
    status:{
        type:String,
        enum: ["online", "offline"],
        default: "offline"
    },
    isConfirmed:{
        type:Boolean,
        default: false
    },
    passwordResetCode: String,
    passwordResetExpires: Date,
    passwordResetVerified: Boolean

},{timestamps:true})


userSchema.pre('save', async function(next) {
    const generatedUserName = this.firstName + this.lastName;

    // Check if the generated username already exists
    const existingUser = await this.constructor.findOne({ userName: generatedUserName });
    if (existingUser) {

        // If it exists, generate a unique username by appending a unique identifier
        let suffix = Math.floor(1000 + Math.random() * 9000);
        
        while (true) {
            const newUserName = `${generatedUserName}${suffix}`;
            const userWithNewUserName = await this.constructor.findOne({ userName: newUserName });
            if (!userWithNewUserName) {
                 this.userName = newUserName;
                 break;
            }
            suffix++;
         }

    } 
    else {
        // Use the generated username directly if it's unique
        this.userName = generatedUserName;
    }

    next(); // Call next to proceed with the save operation
});



export default mongoose.models.User || model("User", userSchema)