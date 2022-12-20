import express from 'express';
import { adminRegister, superRegister } from '../controller/adminCont';
import { getAllUsers, getUserById, login, Register, requestOTP, updateUserProfile, verifyUser } from '../controller/userController';
import { authorize, authorizeVendor } from '../middleware/authorize';
import {deleteFood, getVendorProfile, updateVendorProfile, vendorAddFood, vendorLogin} from '../controller/vendorCont'
import { upload } from '../utils/multer';



const router = express.Router();
router.post('/vendorlogin', vendorLogin)
router.post('/vendoraddfood', authorizeVendor, upload.single('image'), vendorAddFood)
router.get('/vendorprofile', authorizeVendor, getVendorProfile)
router.delete('/deletefood/:id', authorizeVendor, deleteFood)
router.patch('/update-profile', authorizeVendor, upload.single('coverImage'), updateVendorProfile)



export default router;