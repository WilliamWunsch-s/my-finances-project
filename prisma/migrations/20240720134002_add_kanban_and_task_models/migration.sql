-- CreateTable
CREATE TABLE "Kanban" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "text" TEXT NOT NULL,
    "kanbanId" TEXT NOT NULL,
    CONSTRAINT "Task_kanbanId_fkey" FOREIGN KEY ("kanbanId") REFERENCES "Kanban" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
