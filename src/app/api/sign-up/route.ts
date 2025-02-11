import dbConnect from "@/lib/db.connect";
import UserModels from "@/models/User";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerifictionEmail";



export async function POST(request:Request){
    await dbConnect();
    try {

        const {email, username, password}= await request.json()
        const existingUserVerifyByUsername = await UserModels.findOne({username, isVerfiy:true})

        if(existingUserVerifyByUsername){
            return Response.json({
                success: false,
                message: "Username already exists",
            }, {status: 400});
        }

        const existingUserByEmail = await UserModels.findOne({email})
        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
        if(existingUserByEmail){
           if(existingUserByEmail.isVerfiy){
               return Response.json({
                   success: false,
                   message: "User already exists with this email",
               }, {status: 400});
            }else{
                const hashedPassword = await bcrypt.hash(password, 10);
                existingUserByEmail.password= hashedPassword;
                existingUserByEmail.verifyCode= verifyCode;
                existingUserByEmail.verifyCodeExpires= new Date(Date.now() + 3600000);
                await existingUserByEmail.save();
            }
        }else{
            const hashedPassword = await bcrypt.hash(password, 10);

            const expiryDate= new Date()
            expiryDate.setHours(expiryDate.getHours() + 1)

            const newUser = new UserModels({
                email,
                username,
                password:hashedPassword,
                verifyCode,
                verifyCodeExpires: expiryDate,
                isVerfiy: false,
                isAcceptingMessages: true,
                messages: [],
            });

            await newUser.save();
        }

        // Send verification email
        const emailResponse= await sendVerificationEmail(email, username, verifyCode);
        if(!emailResponse.success){
            return Response.json({
                success: false,
                message: emailResponse.message,
            }, {status: 500});
        }
        return Response.json({
            success: true,
            message: "User created successfully. Please verify your email",
        }, {status: 201})

    } catch (error) {
        console.error("Error sending verification email", error);
        return Response.json({
            success: false,
            message: "Error sending verification email",
        }, {status: 500});
    }
}