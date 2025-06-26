// const express = require('express')
const mongoose= require('mongoose')

function connectToDB(){
    mongoose.connect(process.env.MONGO_URI).then(()=>{
        console.log('Connected to DB')
    }).catch((error)=>console.log("Error Not connected to DB", error ))
}

module.exports= connectToDB