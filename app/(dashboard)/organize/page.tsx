"use client";

import { useState, useEffect } from "react";
import { addMonths, subMonths, format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isToday, isSameMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Kanban from "./_components/Kanban";
import axios from "axios";

interface Task {
  id: string;
  text: string;
}

interface KanbanData {
  id: string;
  date: string; // Manter como string
  tasks: Task[];
}

function OrganizePage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [kanbans, setKanbans] = useState<KanbanData[]>([]);

  useEffect(() => {
    fetchKanbans();
  }, []);

  const fetchKanbans = async () => {
    try {
      const response = await axios.get('/api/kanban');
      const kanbansData = response.data.map((kanban: KanbanData) => ({
        ...kanban,
        date: format(new Date(kanban.date), "yyyy-MM-dd") // Garantir que a data seja uma string formatada
      }));
      setKanbans(kanbansData);
    } catch (error) {
      console.error("Failed to fetch kanbans:", error);
    }
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const addTaskToKanban = async (date: string, task: Task) => {
    try {
      let kanban = kanbans.find(k => k.date === date);
      if (!kanban) {
        const response = await axios.post('/api/kanban', { date });
        kanban = response.data;
        setKanbans(prev => {
          if (kanban && kanban.id && kanban.date) {
            return [...prev, { ...kanban, date: format(new Date(kanban.date), "yyyy-MM-dd"), tasks: [] }];
          }
          return prev;
        });
      }
      if (kanban && kanban.id) {
        await axios.post('/api/kanban/task', { text: task.text, kanbanId: kanban.id });
        setKanbans(prev =>
          prev.map(k => k.id === kanban!.id ? { ...k, tasks: [...k.tasks, task] } : k)
        );
      }
    } catch (error) {
      console.error("Failed to add task:", error);
    }
  };

  const renderHeader = () => {
    const dateFormat = "MMMM yyyy";
    return (
      <header className="flex items-center justify-between px-6 py-4 border-b bg-card">
        <div className="text-lg font-medium">
          <span className="mr-2">{format(currentMonth, "MMMM", { locale: ptBR })}</span>
          <span>{format(currentMonth, "yyyy")}</span>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handlePreviousMonth}>
            <ChevronLeft className="w-5 h-5" />
            <span className="sr-only">Mês anterior</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="w-5 h-5" />
            <span className="sr-only">Próximo mês</span>
          </Button>
        </div>
      </header>
    );
  };

  const renderDays = () => {
    const dateFormat = "EEEE";
    const days = [];
    const startDate = startOfWeek(new Date(), { weekStartsOn: 0 });

    for (let i = 0; i < 7; i++) {
      const day = format(addDays(startDate, i), dateFormat, { locale: ptBR });
      days.push(
        <div className="flex items-center px-4 py-2 bg-card text-muted-foreground font-medium" key={i}>
          {day}
        </div>
      );
    }
    return <div className="flex-1 grid grid-cols-7 gap-px bg-muted">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = "";

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, "d");
        const dateString = format(day, "yyyy-MM-dd");
        const kanban = kanbans.find(k => k.date === dateString);
        days.push(
          <Kanban
            key={day.toString()}
            trigger={
              <div
                className={`flex items-center px-4 py-8 bg-card text-muted-foreground border-[0.05rem] ${!isSameMonth(day, monthStart)
                  ? "text-muted"
                  : isToday(day)
                    ? "bg-transparent"
                    : ""
                  }`}
              >
                {isSameMonth(day, monthStart) ? (
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${!isSameMonth(day, monthStart)
                    ? "text-muted"
                    : isToday(day)
                      ? "text-current bg-card"
                      : ""
                    }`}>
                    {formattedDate}
                  </div>
                ) : (
                  <div className="text-center">{formattedDate}</div>
                )}
                {kanban && kanban.tasks && kanban.tasks.map(task => (
                  <div key={task.id} className="mt-2 text-sm bg-gray-200 p-1 rounded">{task.text}</div>
                ))}
              </div>
            }
            date={day}
            addTask={(task: Task) => addTaskToKanban(dateString, task)}
          />
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="flex-1 grid grid-cols-7 gap-px bg-muted" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }
    return <div>{rows}</div>;
  };

  return (
    <>
      <div className="flex flex-col h-screen bg-background">
        {renderHeader()}
        {renderDays()}
        {renderCells()}
      </div>
    </>
  );
}

export default OrganizePage;
