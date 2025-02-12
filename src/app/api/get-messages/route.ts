import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/db.connect";
import UserModels from "@/models/User";
import { User } from "next-auth";
import mongoose from "mongoose";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function GET(request: Request) {
    await dbConnect();
    const session = await getServerSession(authOptions);
    // console.log("🚀 ~ GET ~ session:", session)
    const user: User = session?.user as User;
    // console.log("🚀 ~ GET ~ user:", user)
    
  
    if (!session || !user) {
      return Response.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }
    const userId = new mongoose.Types.ObjectId(user._id);
    try {
      const user = await UserModels.aggregate([
        { $match: { _id: userId } },
        { $unwind: '$messages' },
        { $sort: { 'messages.createdAt': -1 } },
        { $group: { _id: '$_id', messages: { $push: '$messages' } } },
      ])
  
      if (!user || user.length === 0) {
        return Response.json(
          { message: 'noMessages', success: true },
          { status: 200 }
        );
      }
  
      return Response.json(
        { messages: user[0].messages },
        {
          status: 200,
        }
      );
    } catch (error) {
      console.error('An unexpected error occurred:', error);
      return Response.json(
        { message: 'Internal server error', success: false },
        { status: 500 }
      );
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any