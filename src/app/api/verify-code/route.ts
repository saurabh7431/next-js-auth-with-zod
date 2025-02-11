import dbConnect from "@/lib/db.connect";
import UserModels from "@/models/User";

export async function POST(request:Request) {
    await dbConnect()
    
    try {

        const {username, code}= await request.json();
        const decodedusername= decodeURIComponent(username)
        const user= await UserModels.findOne({username:decodedusername})

        if(!user){
            return Response.json({success:false, message:"User not found"}, {status:400})
        }
        
        const isValidCode= user.verifyCode === code;
        const isCodeNotExpired= new Date(user.verifyCodeExpires ) > new Date ()

        if(isValidCode && isCodeNotExpired){
            user.isVerfiy=true
            await user.save()
            return Response.json({success:true, message:"User verified successfully"}, {status:200})
        } else if (!isCodeNotExpired){
            return Response.json({success: false, message: "Verification code has expired, please signup again to get a new code"}, {status:400})
        }else{
            return Response.json({success:false, message:"Incorrct verification code"}, {status:400})
        }

    } catch (error) {
        console.log("Error verifyinng user ", error)
        return Response.json({success: false, message:"Error verifying user"}, {status:500})
    }
}