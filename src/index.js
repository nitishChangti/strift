import dotenv from 'dotenv';
import { DB_NAME } from './constants.js';
import connectionDB from './db/index.js';
import { app } from './app.js';
import serverless from 'serverless-http';

export const handler = serverless(app);

dotenv.config({
    path: '../.env'
})

connectionDB()
    .then(() => {
        app.on('error', (error) => {
            console.log("err", error)
            throw error
        })
        console.log(`server is running on port ${process.env.PORT}`)
        // app.listen(process.env.PORT || 8080, () => {
        //     consocle.log(`server is running on port ${process.env.PORT}`)
        // })
    })
    .catch((error) => {
        console.log('MONGODB db connection failed !!!', error)
    })
