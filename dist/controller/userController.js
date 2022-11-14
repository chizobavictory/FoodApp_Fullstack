"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Login = exports.Register = void 0;
const Register = (req, res) => {
    try {
        return res.status(200).json({
            message: "Successful Registration",
        });
    }
    catch (err) {
        console.log(err);
    }
};
exports.Register = Register;
const Login = (req, res) => {
    try {
        return res.status(200).json({
            message: "Login was successful",
        });
    }
    catch (err) {
        console.log(err);
    }
};
exports.Login = Login;
