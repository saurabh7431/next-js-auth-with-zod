import { GoogleGenerativeAI } from '@google/generative-ai'; // Or the appropriate Gemini library

const gemini = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

export const runtime = 'edge';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function POST(req: Request) {
  try {
    const prompts = `Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. For example, your output should be structured like this: 'What’s a hobby you’ve recently started?||If you could have dinner with any historical figure, who would it be?||What’s a simple thing that makes you happy?'. Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment.`;

    const model= gemini.getGenerativeModel({model:"gemini-pro"})

    const result= await model.generateContent(prompts)
    const response= await result.response;
    const prompt= await response.text();
      return Response.json({success:true, prompt}, {status:200})

  } catch (error) {
    console.error('An unexpected error occurred:', error);
    return new Response(JSON.stringify({ error: "An unexpected error occurred" }), { status: 500 });
  }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any