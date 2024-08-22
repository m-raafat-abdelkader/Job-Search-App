import mongoose from "mongoose";

const {Schema, model} = mongoose;

const applicationSchema = new Schema({
    jobId: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    userTechSkills:{
        type: Array,
        required: true
    },
    userSoftSkills:{
        type: Array,
        required: true
    },
    userResume:{
        type: String,
        required: true
    }
    
},{timestamps: true})



export default mongoose.models.Application || model("Application", applicationSchema);