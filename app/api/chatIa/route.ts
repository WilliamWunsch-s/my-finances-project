import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { z } from "zod";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const chatSchema = z.object({
  message: z.string().nonempty("Message is required"),
  chatId: z.string().optional(),
});

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  let body;
  try {
    body = await request.json();
  } catch (error) {
    return new Response("Invalid JSON input", { status: 400 });
  }

  const result = chatSchema.safeParse(body);

  if (!result.success) {
    return new Response(JSON.stringify(result.error), {
      status: 400,
    });
  }

  const { message, chatId } = result.data;

  const userId = user.id;

  let chat;
  if (chatId) {
    chat = await prisma.chat.findUnique({ where: { id: chatId } });
  }

  if (!chat) {
    chat = await prisma.chat.create({
      data: { userId },
    });
  }

  try {
    const response = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'Você é uma assistente virtual, para auxiliar na organização financeira, investimentos, auxilio com contas para quitação, amortização e etc ...' },
        { role: 'user', content: message }
      ],
      model: 'llama3-8b-8192',
    });

    await prisma.message.create({
      data: {
        chatId: chat.id,
        role: 'user',
        content: message,
      },
    });

    await prisma.message.create({
      data: {
        chatId: chat.id,
        role: 'bot',
        content: response.choices[0]?.message?.content || '',
      },
    });

    return new Response(JSON.stringify({ choices: response.choices, chatId: chat.id }), {
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return new Response("Failed to communicate with Groq API", {
      status: 500,
    });
  }
}

export async function GET(request: Request) {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const userId = user.id;
  const chats = await prisma.chat.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: {
      messages: true,
    },
  });

  return new Response(JSON.stringify(chats), {
    status: 200,
  });
}

export async function DELETE(request: Request) {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const userId = user.id;

  const chats = await prisma.chat.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  if (chats.length > 5) {
    const oldestChat = chats[chats.length - 1];

    await prisma.message.deleteMany({
      where: { chatId: oldestChat.id },
    });

    await prisma.chat.delete({
      where: { id: oldestChat.id },
    });
  }

  return new Response('Oldest chat deleted if there were more than 5 chats.', { status: 200 });
}
