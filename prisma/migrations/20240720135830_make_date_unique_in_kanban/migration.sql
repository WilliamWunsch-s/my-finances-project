/*
  Warnings:

  - A unique constraint covering the columns `[date]` on the table `Kanban` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Kanban_date_key" ON "Kanban"("date");
