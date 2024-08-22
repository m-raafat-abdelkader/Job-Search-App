import mongoose from "mongoose";

const {Schema,model} = mongoose;

const companySchema = new Schema({
    companyName:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true,
        minLength:3,
        maxLength:15
    },
    companyEmail:{
        type:String,
        required:true,
        unique:true
    },
    description:{
        type:String,
        required:true
    },
    industry:{
        type:String,
        required:true
    },
    address:{
        type:String,
        required:true
    },
    companyHR:{
        type: Schema.Types.ObjectId,
        ref: "User",
        required:true
    },
    numberOfEmployees:{
        type:String,
        required:true
    }
},{timestamps:true})


export default mongoose.models.Company || model("Company", companySchema)