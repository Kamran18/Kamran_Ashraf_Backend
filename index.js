const express = require('express')
const app = express()

const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=>{console.log("server started succesfully")})

app.use(express.json());

const indexRouter = require('./indexRouter')

app.use('/api', indexRouter)

app.use((req, res)=>{res})

// 404 
app.use((req, res) => {
    res.status(404).send('404! page not found');
  });