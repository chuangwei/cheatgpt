import { NextApiRequest, NextApiResponse } from "next";
import { Message } from "../../types";
import { OpenAIStream } from "../../utils/server";
const apiKey = process.env.OPENAI_API_KEY;
const PASSWORD = process.env.PASSWORD;

interface ChatBody {
  prompt: string;
  messages: Message[];
  password?: string;
}

export const config = {
  runtime: "edge",
};

export default async function handler(request, response) {
  const { prompt, messages, password } = (await request.json()) as ChatBody;

  if (PASSWORD) {
    if (PASSWORD !== password) {
      return new Response("密码错误、请回复密码 ...", {
        status: 200,
      });
    }
  }

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
