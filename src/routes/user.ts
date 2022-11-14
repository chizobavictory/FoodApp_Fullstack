import express from 'express'
import { Register, Login } from '../controller/userController'

const router = express.Router()
router.get("/signup", Register)
router.get("/login", Login)

export default router