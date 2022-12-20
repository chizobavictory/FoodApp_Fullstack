import express,{Request, Response} from 'express';
import { option, generateSalt, generateHashedPassword, generateOtp, generateSignature, adminSchema, loginSchema, validatePassword, vendorSchema, updateVendorSchema } from '../utils';
import {UserAttribute, UserInstance} from '../model/userModel';
import {v4 as uuidv4} from 'uuid'
import {adminMail, userSubject} from '../config'
import jwt,{ JwtPayload } from 'jsonwebtoken';
import { VendorAttribute, VendorInstance } from '../model/vendorModel';
import { FoodAttribute, FoodInstance } from '../model/foodModel';


export const vendorLogin=async(req: Request, res: Response)=>{
    try {
        const {email, password} = req.body;
        const validateUser = loginSchema.validate(req.body, option);
        if(validateUser.error){
            return res.status(400).json({
                Error: validateUser.error.details[0].message
            })
        }
        const Vendor = await VendorInstance.findOne({where:{email:email}}) as unknown as VendorAttribute
        if(Vendor){
            const validation = await validatePassword(password, Vendor.password, Vendor.salt)
            if(validation){
                let signature = await generateSignature({
                    id: Vendor.id,
                    email: Vendor.email,
                    serviceAvailability: Vendor.serviceAvailability,
                });
                return res.status(200).json({
                    message: "You have sucessfully logged in",
                    signature,
                    email: Vendor.email,
                    serviceAvailability: Vendor.serviceAvailability,
                    role: Vendor.role
                })
            }
        }
        return res.status(400).json({
            Error: "Wrong username or password"
        })
    } catch (error) {
        res.status(500).json({
            Error: "Internal server error",
            route: "/vendor/vendorlogin"
        });
    }
}

export const vendorAddFood=async(req: JwtPayload, res: Response)=>{
    try {
        const id = req.Vendor.id
        const{name, description, category, foodType, readyTime, price, image} = req.body
        const Vendor = await VendorInstance.findOne({where:{id}}) as unknown as VendorAttribute;
        const uuidfood = uuidv4();
        if(Vendor){
            const createdFood = await FoodInstance.create({
                id: uuidfood,
                name,
                description,
                category,
                foodType,
                readyTime,
                price,
                vendor_id: id,
                rating: 0,
                image: req.file.path
            })
            return res.status(201).json({
                message: "Food added sucessfully",
                createdFood
            })
        }
    
    } catch (error) {
        res.status(500).json({
            Error: "Internal server error",
            route: "/vendor/vendoraddfood"
        });
    }
}


export const getVendorProfile = async(req: JwtPayload, res: Response)=>{
    try {
        const id = req.Vendor.id
        console.log(id);
        const Vendor = await VendorInstance.findOne({
            where:{
                id: id,
            }, 
            // attributes: ["id", "email", "name", "companyName", "rating", "serviveAvailability"],
            include:[
                {
                    model: FoodInstance,
                    as: 'food',
                    attributes: ["id", "name", "description", "category", "foodType", "readyTime", "price", "rating"]
                }
            ]}) as unknown as VendorAttribute
        
            return res.status(200).json({
                Vendor
            })
    } catch (error) {
        res.status(500).json({
            Error: "Internal server error",
            route: "/vendor/vendorprofile"
        });
    }
}


export const deleteFood = async(req: JwtPayload, res: Response)=>{
    try {
        const id = req.Vendor.id;
        const foodid = req.params.id;
        const Vendor = await VendorInstance.findOne({where:{id}}) as unknown as VendorAttribute;
        if(Vendor){
            const deletedFood = await FoodInstance.destroy({where :{id: foodid}});

            return res.status(200).json({
                message: "Successfully deleted food",
                deletedFood
            })
        }
    } catch (error) {
        res.status(500).json({
            Error: "Internal server error",
            route: "/vendor/deletefood"
        });
    }
}

export const updateVendorProfile=async(req: JwtPayload, res: Response)=>{
    try {
        const id = req.Vendor.id
        const {coverImage, name, phone, address} = req.body
        const joiValidateVendor = updateVendorSchema.validate(req.body, option)
        if(joiValidateVendor.error){
            return res.status(400).json({
                Error: joiValidateVendor.error.details[0].message
            })
        }
        const Vendor = await VendorInstance.findOne({where:{id:id}}) as unknown as VendorAttribute;
        if(!Vendor){
            return res.status(400).json({
                Error: "You are not authorized to update your profile"
            })
        }
        
        const updateVendor = await VendorInstance.update({
            coverImage: req.file.path, name, phone, address
        }, {where: {id}}) as unknown as VendorAttribute;

        if(updateVendor){
            const Vendor = await VendorInstance.findOne({where:{id}}) as unknown as VendorAttribute;
            return res.status(200).json({
                message: "You have successfully updated your account",
                Vendor
            })
        }

        return res.status(400).json({
            Error: "There's an error"
        })
    } catch (error) {
        return res.status(500).json({
            Error: "Internal server error",
            route: "/vendor/update-profile"
        })
    }
}