import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const kanbanSchema = z.object({
  date: z.string(),
});

const taskSchema = z.object({
  text: z.string(),
  kanbanId: z.string(),
});

export async function POST(request: Request) {
  const body = await request.json();
  const result = kanbanSchema.safeParse(body);

  if (!result.success) {
    return new NextResponse(JSON.stringify(result.error), { status: 400 });
  }

  const { date } = result.data;

  // Verificar se já existe um kanban para a data
  const existingKanban = await prisma.kanban.findFirst({
    where: {
      date: new Date(date),
    },
  });

  if (existingKanban) {
    return new NextResponse(JSON.stringify(existingKanban), { status: 200 });
  }

  const kanban = await prisma.kanban.create({
    data: { date: new Date(date) },
  });

  return new NextResponse(JSON.stringify(kanban), { status: 200 });
}

export async function GET(request: Request) {
  const kanbans = await prisma.kanban.findMany({
    include: {
      tasks: true,
    },
  });

  return new NextResponse(JSON.stringify(kanbans), { status: 200 });
}
