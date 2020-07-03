const express = require('express')
const router = express.Router()
const fs = require('fs')


router.post('/', (req, res)=>{
    const H = req.body.height, e = req.body.e
    giveBounceAndGraphData(H, e)
    .then(data => {
        console.log(data)
        res.send(data)
    })
    .catch(err => {res.send(err)})
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
        
        // On invalid inputs
        if(e<0 || e>1 || H<0 ){
            reject("invalid inputs")
        }

        //coefficient of restitution = 1
        if(e === 1){
            arr = [...arr , ...heightTime(-9.81*T, T, 2*T, "+", H)]
            arr.push( HTdata(H, 2*T))
            bounces = "infinite"
        }

        // coefficient of restitution > 0 and < 1
        if(e>0 && e<1){                            
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
        }
        fs.writeFileSync( __dirname + '/data.json', `{"bounces" : ${bounces}, "height_time" : ${JSON.stringify(arr)}}`, (err)=>{console.log(err)})
        resolve( {bounces, arr} )
    })    
}

const HTdata = (H, T) => ({"height":H, "time":T})

//Calculates height and time in between the extremes
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

module.exports = router