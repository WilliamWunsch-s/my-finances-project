import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { subDays } from 'date-fns';

export async function GET() {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const sevenDaysAgo = subDays(new Date(), 7);

  const pastChats = await prisma.chat.findMany({
    where: {
      userId: user.id,
      createdAt: {
        gte: sevenDaysAgo,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      messages: true,
    },
  });

  return new Response(JSON.stringify(pastChats), {
    status: 200,
  });
}
