import mongoose,{Schema, Document} from "mongoose";


export interface Message extends Document {
    content: string;
    createdAt: Date;
}

const MessageSchema: Schema <Message> = new Schema({
    content: {type: String, required: true},
    createdAt: {type: Date, required: true, default: Date.now}
});

export interface User extends Document {
    username: string;
    email: string;
    password: string;
    verifyCode: string;
    verifyCodeExpires: Date;
    isVerfiy: boolean;
    isAcceptingMessages: boolean;
    messages: Message[];
}

const UserSchema: Schema<User> = new Schema({
    username: {type: String, required: [true, "Username is required"], unique: true, trim: true},
    email: {type: String, required: [true, "Email is required"], unique: true, match: [/\S+@\S+\.\S+/, "Please enter a valid email"]},
    password: {type: String, required: [true, "Password is required"], minlength: 6},
    verifyCode: {type: String, required: [true, "Verify code is required"]},
    verifyCodeExpires: {type: Date, required: [true, "Verify code expires is required"]},
    isVerfiy: {type: Boolean, default: false},
    isAcceptingMessages: {type: Boolean, required: true, default: true},
    messages: [MessageSchema]
});


const UserModels= (mongoose.models.User as mongoose.Model<User>) || mongoose.model<User>("User", UserSchema);
export default UserModels;
