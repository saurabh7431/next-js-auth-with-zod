import { resend } from "@/lib/resend";
import VerificationEmail from "../../Emails/VerificationEmail";
import { APIResponse } from "@/types/ApiResponse";


export async function sendVerificationEmail(
    email: string, 
    username:string, 
    verifyCode:string): Promise<APIResponse> {
        try {
        //    const sendEmail= 
           await resend.emails.send({
                from:'auth.blogforyou.in',
                to: email,
                subject: 'Verification Code',
                react: VerificationEmail({username, otp: verifyCode})
            })
            
              return {success: true, message: "Verification email sent"};
        } catch (emailError) {
            console.error("Error sending verification email", emailError);
            return {
                success: false,
                message: "Error sending verification email",};
            
        }
    }
    
