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

  console.log(prompt, messages);
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
    return new Response("发生未知错误，管理员在紧急修复中，请稍后", {
      status: 500,
    });
  }
}
