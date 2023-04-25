import { NextApiRequest, NextApiResponse } from "next";
import { Message } from "../../types";
import { OpenAIStream } from "../../utils/server";
const apiKey = process.env.OPENAI_API_KEY;

interface ChatBody {
  prompt: string;
  messages: Message[];
}

export const config = {
  runtime: "edge",
};

export default async function handler(request, response) {
  const { prompt, messages } = (await request.json()) as ChatBody;

  try {
    const stream = await OpenAIStream(
      {
        id: "gpt-3.5-turbo",
        name: "",
      },
      prompt,
      apiKey,
      messages
    );

    // pipe the stream to the response
    return new Response(stream);
  } catch (error) {
    console.error(error);
    return new Response(error, {
      status: 500,
    });
  }
}
