import express from 'express'
import { config } from 'dotenv'

//Database connection
import connection_db from './DB/connection.js'

//Routes
import userRouter from './src/Modules/User/user.routes.js'
import companyRouter from './src/Modules/Company/company.routes.js'
import jobRouter from './src/Modules/Job/job.routes.js'

//Middlewares
import { globalResponse } from './src/Middlewares/error-handling.middleware.js'


//Load environment variables from .env file
config()

//Initialize Express App
const app = express() 
const PORT = process.env.PORT 



// Middleware to parse JSON bodies
app.use(express.json())


app.use('/user', userRouter)

app.use('/company', companyRouter)

app.use('/job', jobRouter)



// Global Error Handler Middleware
app.use(globalResponse)



// connect to database
connection_db()



app.get("/", (req,res)=>{
    res.json("Hello World!");
})



// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})
