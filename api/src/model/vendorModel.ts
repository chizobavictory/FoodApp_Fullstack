import { DataTypes, Model } from "sequelize";
import {db} from '../config'
import { FoodInstance } from "./foodModel";
export interface VendorAttribute {
    id: string,
    email: string,
    password: string,
    name: string,
    pin: string,
    salt: string,
    serviceAvailability: boolean,
    rating: number,
    address: string,
    role: string,
    phone: string,
    coverImage: string,
    restaurantName: string
}

export class VendorInstance extends Model<VendorAttribute>{}

VendorInstance.init({
    id: {
        type: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            notNull: {
                msg: "Email Address is required"
            },
            isEmail: {
                msg: "Please provide a valid email"
            }
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: {
                msg: "password is required"
            },
            notEmpty: {
                msg: "provide a password"
            }
        }
    },
    name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    salt: {
        type: DataTypes.STRING,
        allowNull: false,
    }, 
    address: {
        type: DataTypes.STRING,
        allowNull: true
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: {
                msg: "Phone number is required"
            },
            notEmpty: {
                msg: "Please provide a phone number"
            }
        }
    },
    
    rating: {
        type: DataTypes.NUMBER,
        allowNull: true
    },
    serviceAvailability: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },
    role: {
        type: DataTypes.STRING,
        allowNull: true
    },
    pin: {
        type: DataTypes.STRING,
        allowNull: true
    },
    coverImage: {
        type: DataTypes.STRING,
        allowNull: true
    },
    restaurantName: {
        type: DataTypes.STRING,
        allowNull: true
    },
},
{
    sequelize: db,
    tableName: 'vendor'
}
)

VendorInstance.hasMany(FoodInstance, {foreignKey:'vendor_id', as: 'food'})
FoodInstance.belongsTo(VendorInstance, {foreignKey:'vendor_id', as: 'vendor'})