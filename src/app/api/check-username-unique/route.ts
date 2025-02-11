import dbConnect from "@/lib/db.connect";
import UserModels from "@/models/User";
import {z} from 'zod'
import { uservalidation } from "@/schemas/signUpSchema";

const UsernameSchemaQuerySchema= z.object({
    username:uservalidation
})


export async function GET(request:Request) {

    await dbConnect();
    try {
        const {searchParams} = new URL(request.url)
        const queryParam={username:searchParams.get("username")}
        
        //Validate with zod
        const result= UsernameSchemaQuerySchema.safeParse(queryParam)
        console.log(result)
        if(!result.success){
            const usernameErrors= result.error.format().username?._errors || []
            return Response.json({
                success:false,
                message: usernameErrors.length >0 ?usernameErrors.join(',') :"Invalid query parameters"
            },{status:400})
        }
        const {username}=result.data
        const existingVerifyUser= await UserModels.findOne({username, isVerfiy:true})

        if(existingVerifyUser){
            return Response.json({success: false, message:"Uername is already taken"}, {status:400})
        }

        return Response.json({success: true, message:"Uername is available"}, {status:200})

    } catch (error) {
        console.error("Error checking username", error)
        return Response.json({
            success:"false",
            message:"Error checking username"
        },
        {
            status:500
        }
    )
    }
    
}