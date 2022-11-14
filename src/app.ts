import express from "express";
import cookieParser from "cookie-parser";
import logger from "morgan"
import userRouter from "./routes/user"
import indexRouter from "./routes/index"

const app = express()

app.use(express.json())
app.use(logger("dev"))
app.use(cookieParser())

app.use('/',indexRouter )
app.use('/users', userRouter)

const port = 3700
app.listen(port, ()=>{
  console.log(`Server is running on port:${port}`)
})

export default app