import UserModels from '@/models/User';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/db.connect';
import { authOptions } from '../../auth/[...nextauth]/options';
import { NextResponse } from 'next/server';

export async function DELETE(request, context) {
  const { messageid } = await context.params;  // Access messageid from context.params
  const messageId = Array.isArray(messageid) ? messageid[0] : messageid; // Handle case where messageid could be an array

  await dbConnect();
  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (!session || !user) {
    return NextResponse.json(
      { success: false, message: 'Not authenticated' },
      { status: 401 }
    );
  }

  try {
    const updateResult = await UserModels.updateOne(
      { _id: user._id },
      { $pull: { messages: { _id: messageId } } }
    );

    if (updateResult.modifiedCount === 0) {
      return NextResponse.json(
        { message: 'Message not found or already deleted', success: false },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Message deleted', success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting message:', error);
    return NextResponse.json(
      { message: 'Error deleting message', success: false },
      { status: 500 }
    );
  }
}
