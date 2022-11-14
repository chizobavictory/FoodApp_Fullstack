import express from "express";

const app = express()

const port = 3700
app.listen(port, ()=>{
  console.log(`Server is running on port:${port}`)
})

export default app