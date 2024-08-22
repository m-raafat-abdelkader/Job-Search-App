import mongoose from 'mongoose'

const {Schema, model} = mongoose;

const OTPSchema = new Schema({
    email: {
		type: String,
		required: true,
	},
	otp: {
		type: String,
		required: true,
	},
	addedAt:{
		type: Date,
		default: Date.now,
		expires: 1800,
		index: true
	}
}, {versionKey: false})



export default mongoose.models.OTP || model("OTP", OTPSchema)