import express,{Request, Response} from 'express';
import { registerSchema, option, generateSalt, generateHashedPassword, generateOtp, onOtpReq, sendEmail, eHtml, generateSignature, verifyJwtoken, loginSchema, validatePassword, updateSchema } from '../utils';
import {UserAttribute, UserInstance} from '../model/userModel';
import {v4 as uuidv4} from 'uuid'
import {adminMail, userSubject} from '../config'
import jwt,{ JwtPayload } from 'jsonwebtoken';

export const Register = async (req: Request, res: Response)=>{
try {
    const {email, phone, password, confirm_password} = req.body;
    const id = uuidv4()
    const validateUser = registerSchema.validate(req.body, option);
    if(validateUser.error){
        return res.status(400).json({
            Error: validateUser.error.details[0].message
        })
    }
    const salt = await generateSalt();
    const userPassword = await generateHashedPassword(password, salt);
    const {otp, expiryTime} = generateOtp();

    //check if user exists
    const User = await UserInstance.findOne({where:{email:email}})
    if(!User){
        let user = await UserInstance.create({
            id,
            email,
            password: userPassword,
            firstName: '',
            lastName: '',
            salt,
            address: '',
            phone,
            otp,
            otp_expiry: expiryTime,
            lng: 0,
            lat: 0,
            verified: false ,
            role: "user"
        })
        //send otp to user
        // await onOtpReq(otp, phone);
        let html = eHtml(otp)
        await sendEmail(adminMail, email, userSubject, html)
        // check if user exists in db, if yes give him jwt signature
        const User = await UserInstance.findOne({where:{email:email}}) as unknown as UserAttribute;
        let signature = await generateSignature({
            id: User.id,
            email: User.email,
            verified: User.verified
        })
        return res.status(201).json({
            message: "User created sucessfully",
            signature,
            verified: User.verified
        })
    }
    return res.status(400).json({
        Error: "User already exists"
    })
    
} catch (error) {
    res.status(500).json({
        Error: "Internal server error",
        route: "/user/signup"
    });
}
}

//verify users

export const verifyUser=async(req: Request, res: Response)=>{
    try {
        const token = req.params.signature;
        const decode = await verifyJwtoken(token) as JwtPayload
        const User = await UserInstance.findOne({where:{email:decode.email}}) as unknown as UserAttribute;
        if(User){
            const {otp} = req.body;
            
            
            if(User.otp === parseInt(otp) && User.otp_expiry >= new Date()){
                
                const updateUser = await UserInstance.update({
                    verified: true
                }, {where: {email: decode.email}}) as unknown as UserAttribute
                //generate a new signature for the user
                let signature = await generateSignature({
                    id: updateUser.id,
                    email: updateUser.email,
                    verified: updateUser.verified,
                })

                if(updateUser){
                    const User = await UserInstance.findOne({where:{email:decode.email}}) as unknown as UserAttribute;
                    return res.status(200).json({
                        message: "You have successfully verfied your account",
                        signature,
                        verified: User.verified
                    })
                }
                
            }
            return res.status(400).json({
               Error: "Invalid credential or OTP expired"
            })
        }
    } catch (error) {
        res.status(500).json({
            Error: "Internal server error",
            route: "/user/verify"

        })
    }
}


//log in users

export const login=async(req: Request, res:Response)=>{
    try {
    const {email, password} = req.body;
    const validateUser = loginSchema.validate(req.body, option);
    if(validateUser.error){
        return res.status(400).json({
            Error: validateUser.error.details[0].message
        })
    }
        const User = await UserInstance.findOne({where:{email:email}}) as unknown as UserAttribute
        if(User.verified){
            const validation = await validatePassword(password, User.password, User.salt)
            if(validation){
                let signature = await generateSignature({
                    id: User.id,
                    email: User.email,
                    verified: User.verified,
                });
                return res.status(200).json({
                    message: "You have sucessfully logged in",
                    signature,
                    email: User.email,
                    verified: User.verified,
                    role: User.role
                })
            }
        }
        return res.status(400).json({
            Error: "Validate your account credentials, check your email for OTP"
        })
    
   
    } catch (error) {
        res.status(500).json({
            Error: "Internal server error",
            route: "/user/login"
        })
    }
}

//request otp
export const requestOTP=async(req: Request, res: Response)=>{
    try {
        const token = req.params.signature;
        const decode = await verifyJwtoken(token) as JwtPayload;
        const User = await UserInstance.findOne({where:{email:decode.email}}) as unknown as UserAttribute;
        if(User){
            const {otp, expiryTime} = generateOtp();
            const updateUser = await UserInstance.update({
                otp, otp_expiry: expiryTime
            }, {where: {email: decode.email}}) as unknown as UserAttribute

            if(updateUser){
                const User = await UserInstance.findOne({where:{email:decode.email}}) as unknown as UserAttribute;
                await onOtpReq(otp, User.phone);
                const html = eHtml(otp);
                await sendEmail(adminMail, User.email, userSubject, html)
                return res.status(200).json({
                    message: 'OTP resent successfully'
                })
            }
        }
        return res.status(400).json({
            Error: "Error resending OTP"
        })
       
    } catch (error) {
        res.status(500).json({
            Error: "Internal server error",
            route: "/user/resendotp/:signature"

        })
    }
}
//Profile
export const getAllUsers=async(req: Request, res: Response)=>{
    try {
        const limit = req.query.limit as number | undefined;
    //     const users = await UserInstance.findAll({})
    // return res.status(200).json({
    //     message: "You have successfully retrieved all users",
    //     users
    // })
    //instead of the findAll above, the findAndcountAll below may be 
    //used to also return the count key in the json response
    const Users = await UserInstance.findAndCountAll({limit: limit});
    return res.status(200).json({
        message: "You have successfully retrieved all users",
        count: Users.count,
        users: Users.rows,
    })
    } catch (error) {
        return res.status(500).json({
            Error: "Internal server error",
            route: "/user/get-all-users"

        })
    }
    
}

export const getUserById=async(req: JwtPayload, res: Response)=>{
    try {
        const {id} = req.User
        console.log(id);
        const User = await UserInstance.findOne({where:{id}}) as unknown as UserAttribute
        if(User){
            return res.status(200).json({
                User
            })
        }
        return res.status(400).json({
            message: "User not found"
        })
        

    } catch (error) {
        return res.status(500).json({
            Error: "Internal server error",
            route: "/user/myprofile"

        })
    }
}


export const updateUserProfile=async(req: JwtPayload, res: Response)=>{
    try {
        const id = req.User.id
        const {firstName, lastName, phone, address} = req.body
        const joiValidateUser = updateSchema.validate(req.body, option)
        if(joiValidateUser.error){
            return res.status(400).json({
                Error: joiValidateUser.error.details[0].message
            })
        }
        const User = await UserInstance.findOne({where:{id}}) as unknown as UserAttribute;
        if(!User){
            return res.status(400).json({
                Error: "You are not authorized to update your profile"
            })
        }

        const updateUser = await UserInstance.update({
            firstName, lastName, phone, address
        }, {where: {id}}) as unknown as UserAttribute;

        if(updateUser){
            const User = await UserInstance.findOne({where:{id}}) as unknown as UserAttribute;
            return res.status(200).json({
                message: "You have successfully updated your account",
                User
            })
        }

        return res.status(400).json({
            Error: "There's an error"
        })
    } catch (error) {
        return res.status(500).json({
            Error: "Internal server error",
            route: "/user/updateprofile"
        })
    }
}


//


