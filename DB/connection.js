import mongoose from "mongoose";


/**
 * Establishes a connection to the MongoDB database.
 * @async
 * @function connection_db
 * @returns {Promise<void>} A Promise that resolves when the connection to the database is successfully established.
*/
const connection_db = async ()=>{
   
    await mongoose.connect(process.env.CONNECTION_DB_URI).then(()=>{
        console.log("Connected to database");
    }).catch((err)=>{
        console.log("Error connecting to database", err);
    })
}


export default connection_db;