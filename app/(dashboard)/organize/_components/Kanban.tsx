"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

interface Props {
  trigger: React.ReactNode;
  date: Date;
  addTask: (task: Task) => void;
}

interface Task {
  id: string;
  text: string;
}

const Kanban: React.FC<Props> = ({ trigger, date, addTask }) => {
  const [open, setOpen] = useState(false);
  const [taskText, setTaskText] = useState("");

  const handleAddTask = () => {
    if (taskText.trim() === "") return;
    const newTask = {
      id: Date.now().toString(),
      text: taskText,
    };
    addTask(newTask);
    setTaskText("");
    setOpen(false);  // Fechar o kanban após adicionar a tarefa
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <h2>Kanban - {date.toLocaleDateString()}</h2>
        <div className="mt-4">
          <input
            type="text"
            value={taskText}
            onChange={(e) => setTaskText(e.target.value)}
            placeholder="Adicione uma tarefa"
            className="w-full px-2 py-1 border rounded"
          />
          <button
            onClick={handleAddTask}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Adicionar Tarefa
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Kanban;
