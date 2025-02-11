import dbConnect from "@/lib/db.connect";
import UserModels from "@/models/User";
import { Message } from "@/models/User";


export async function POST(request: Request) {
    await dbConnect();
    const { username, content } = await request.json();
  
    try {
      const user = await UserModels.findOne({ username });
  
      if (!user) {
        return Response.json(
          {success: false, message: 'User not found'  },
          { status: 404 }
        );
      }
  
      // Check if the user is accepting messages
      if (!user.isAcceptingMessages) {
        return Response.json(
          {success: false, message: 'User is not accepting messages' },
          { status: 403 } // 403 Forbidden status
        );
      }
  
      const newMessage = { content, createdAt: new Date() };
  
      // Push the new message to the user's messages array
      user.messages.push(newMessage as Message);
      await user.save();
  
      return Response.json(
        { message: 'Message sent successfully', success: true },
        { status: 201 }
      );
    } catch (error) {
      console.error('Error adding message:', error);
      return Response.json(
        { message: 'Internal server error', success: false },
        { status: 500 }
      );
    }
  }