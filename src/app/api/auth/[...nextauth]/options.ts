import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db.connect";
import UserModels from "@/models/User";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async authorize(credentials: any): Promise<any> {
        await dbConnect();
        try {
          const user = await UserModels.findOne({
            $or: [
              { email: credentials.identifier },
              { username: credentials.identifier }
            ]
          });
          if (!user) {
            throw new Error("No user found with this email");
          }
          if (!user.isVerfiy) {
            throw new Error("Please verify email first");
          }
          const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);
          if (isPasswordCorrect) {
            return user;
          } else {
            throw new Error("Incorrect Password");
          }
        } catch (error: any) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          throw new Error(error);
        }
      },
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user._id?.toString();
        token.isVerfiy = user.isVerfiy;
        token.isAcceptingMessages = user.isAcceptingMessages;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user._id = token.id as string; // Use type assertion
        session.user.isVerfiy = token.isVerfiy;
        session.user.isAcceptingMessages = token.isAcceptingMessages;
        session.user.username = token.username;
      }
      return session;
    },
  },
  pages: {
    signIn: '/sign-in'
  },
  session: {
    strategy: "jwt"
  },
  secret: process.env.NEXTAUTH_SCERET,
};
