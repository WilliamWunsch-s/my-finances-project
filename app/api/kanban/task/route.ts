import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const taskSchema = z.object({
  text: z.string(),
  kanbanId: z.string(),
  description: z.string()
});

export async function POST(request: Request) {
  const body = await request.json();
  const result = taskSchema.safeParse(body);

  if (!result.success) {
    return new NextResponse(JSON.stringify(result.error), { status: 400 });
  }

  const { text, kanbanId, description } = result.data;

  try {
    const task = await prisma.task.create({
      data: {
        text,
        kanbanId,
        description
      },
    });
    return new NextResponse(JSON.stringify(task), { status: 200 });
  } catch (error) {
    console.error(error);
    return new NextResponse("Failed to create task", { status: 500 });
  }
}
