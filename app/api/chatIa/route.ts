import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { z } from "zod";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const chatSchema = z.object({
  message: z.string().nonempty("Message is required"),
  chatId: z.string().nullable().optional(),
});

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) {
    console.log("Usuário não autenticado");
    return new Response("Usuário não autenticado", { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch (error) {
    console.log("Erro ao analisar JSON", error);
    return new Response("Entrada JSON inválida", { status: 400 });
  }

  const result = chatSchema.safeParse(body);
  if (!result.success) {
    console.log("Erro na validação do esquema", result.error);
    return new Response(JSON.stringify(result.error), {
      status: 400,
    });
  }

  const { message, chatId } = result.data;
  console.log("Mensagem recebida:", message, "Chat ID:", chatId);

  const userId = user.id;

  let chat;
  if (chatId) {
    chat = await prisma.chat.findUnique({
      where: { id: chatId, userId },
      include: { messages: true }, // Incluir as mensagens do chat existente
    });
    if (!chat) {
      return new Response("Chat não encontrado", { status: 404 });
    }
  }

  if (!chat) {
    chat = await prisma.chat.create({
      data: { userId },
      include: { messages: true }, // Criar o novo chat e incluir as mensagens (mesmo que inicialmente vazio)
    });
    console.log("Novo chat criado com ID:", chat.id);
  }

  // Buscar informações adicionais do usuário
  const categories = await prisma.category.findMany({
    where: { userId },
  });

  const transactions = await prisma.transaction.findMany({
    where: { userId },
  });

  const monthHistory = await prisma.monthHistory.findMany({
    where: { userId },
  });

  const yearHistory = await prisma.yearHistory.findMany({
    where: { userId },
  });

  // Montar o prompt com as informações do usuário e histórico
  const systemPrompt = `
    Você é uma assistente virtual para auxiliar na organização financeira.
    Informações do usuário:
    - Categorias: ${categories.map(c => `${c.name} (${c.type})`).join(', ')}
    - Transações: ${transactions.map(t => `${t.description} de ${t.amount} em ${t.date}`).join(', ')}
    - Histórico Mensal: ${monthHistory.map(m => `Mês ${m.month}/${m.year}: ${m.income} de receita, ${m.expense} de despesa`).join(', ')}
    - Histórico Anual: ${yearHistory.map(y => `Ano ${y.year}: ${y.income} de receita, ${y.expense} de despesa`).join(', ')}
  `;

  // Adicionar todas as mensagens anteriores do chat ao prompt, e converter "bot" para "assistant"
  const previousMessages = chat.messages.map((m) => ({
    role: m.role === 'bot' ? 'assistant' : m.role, // Converter "bot" para "assistant"
    content: m.content,
  }));

  try {
    const response = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'system', content: `Previous messages: ${previousMessages}`}, // Incluindo todas as mensagens anteriores
        { role: 'user', content: message }, // Nova mensagem do usuário
      ],
      model: 'llama3-8b-8192',
    });

    console.log("Resposta da IA:", response);

    // Armazenar a nova mensagem do usuário e a resposta da IA
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
        role: 'assistant', // Armazenar a resposta da IA com a role 'assistant'
        content: response.choices[0]?.message?.content || '',
      },
    });

    return new Response(JSON.stringify({ choices: response.choices, chatId: chat.id }), {
      status: 200,
    });
  } catch (error) {
    console.error("Erro na comunicação com a API Groq", error);
    return new Response("Falha ao comunicar com a API Groq", {
      status: 500,
    });
  }
}


export async function GET(request: Request) {
  const user = await currentUser();
  if (!user) {
    return new Response("Usuário não autenticado", { status: 401 });
  }

  const userId = user.id;
  try {
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
  } catch (error) {
    console.error("Erro ao buscar chats", error);
    return new Response("Erro ao buscar chats", { status: 500 });
  }
}


export async function DELETE(request: Request) {
  const user = await currentUser();
  if (!user) {
    return new Response("Usuário não autenticado", { status: 401 });
  }

  const userId = user.id;

  try {
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

      return new Response("Chat mais antigo deletado", { status: 200 });
    }

    return new Response("Nenhum chat foi deletado", { status: 200 });
  } catch (error) {
    console.error("Erro ao deletar chat", error);
    return new Response("Erro ao deletar chat", { status: 500 });
  }
}

