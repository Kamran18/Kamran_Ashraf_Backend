const express = require('express')
const router = express.Router()
const fs = require('fs')


router.post('/', (req, res)=>{
    const H = req.body.height, e = req.body.e
    giveBounceAndGraphData(H, e)
    .then(data => {res.send(data)})
})

router.get('/', (req, res)=>{
    res.json(require('./data.json'))
})

const giveBounceAndGraphData = (H, e) => {
    return new Promise((resolve, reject)=>{
        let  T = Math.sqrt(2*H/9.81),          
        //no of bounces
        bounces = 0,                           
        temp1 = 0 , temp2 = T, tempi,  h = H,
        //final and initial velocity in a single up/down motion
        u = 0 ,v = u+(9.81*T)  
        //height and time
        arr = [ HTdata(H, 0)] 
        arr = [...arr , ...heightTime(0, 0, T, "-", H)]
        arr.push( HTdata(0, T) )
        while(h > 0.5){
            bounces++ 
            h = h*e**2
            temp1 = temp2 + T*e**bounces
            arr = [...arr , ...heightTime(-9.81*(temp1-temp2) ,temp2, temp1, "+", h)]
            arr.push( HTdata(h, temp1))
            tempi = temp1
            temp1 = temp1 + T*e**bounces
            arr = [...arr , ...heightTime(0, tempi, temp1, "-", h)]
            arr.push( HTdata(0, temp1) )  
            temp2 = temp1
        }
        fs.writeFileSync( __dirname + '/data.json', `{"bounces" : ${bounces}, "height_time" : ${JSON.stringify(arr)}}`, (err)=>{console.log(err)})
        resolve( {bounces, arr} )
    })    
}

const HTdata = (H, T) => ({"height":H, "time":T})

const heightTime= (initialVelocity, initialTime, finalTime, sign, H)=>{
        arr = []
        let temp1Time = initialTime + 1, tempTime = 1
        while(temp1Time < finalTime){
            if(sign === "+") 
                arr.push(HTdata(-(initialVelocity*tempTime + (.5*9.81*tempTime**2)) ,temp1Time))
            else
                arr.push(HTdata(H-(initialVelocity*tempTime + (.5*9.81*tempTime**2)) ,temp1Time))
            temp1Time++
            tempTime++
    }
    return arr
}

const velocity = (u, t)=>{
    return  u+(9.81*t)
}

module.exports = router