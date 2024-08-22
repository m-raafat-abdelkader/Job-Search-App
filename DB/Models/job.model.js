import mongoose from "mongoose";

const {Schema, model} = mongoose;

const jobSchema = new Schema({
    jobTitle:{
        type: String,
        required: true,
        minLength: 3,
        maxLength: 50,
        trim: true,
        lowercase: true
    },
    jobDescription:{
        type: String,
        required: true,
        trim: true
    },
    jobLocation:{
        type: String,
        enum: ['onsite', 'remotely', 'hybrid'],
        required: true
    },
    workingTime:{
        type: String,
        enum: ['full-time', 'part-time'],
        required: true
    },
    seniorityLevel:{
        type: String,
        enum: ['Junior', 'Mid-level', 'Senior', 'Team-Lead', 'CTO'],
        required: true
    },
    technicalSkills:{
        type: Array,
        required: true
    },
    softSkills:{
        type: Array,
        required: true
    },
    addedBy:{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
},{timestamps: true})




export default mongoose.models.Job || model('Job', jobSchema);