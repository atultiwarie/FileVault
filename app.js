const express = require('express')

const app = express()

const PORT = process.env.PORT || 3000

const cookieParser=require('cookie-parser')


const dotenv = require('dotenv')
dotenv.config();

const connectToDB = require('./config/db')
connectToDB();

const cors = require("cors");

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true, 
  })
);



const userRouter= require('./routes/user.routes')
const indexRouter= require('./routes/index.routes')

app.set('view engine' ,'ejs')

app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.use(cookieParser())


app.use('/',indexRouter)
app.use('/user',userRouter)

app.listen(PORT ,()=>{
    console.log(`Server is running on http://localhost:${PORT}/user`)
})