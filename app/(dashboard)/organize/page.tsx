"use client";

import { useState, useEffect } from "react";
import { addMonths, subMonths, format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isToday, isSameMonth, subDays, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Kanban from "./_components/Kanban";
import axios from "axios";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { GetTransactionHistoryResponseType } from "@/app/api/transactions-history/route";
import { DateToUTCDate } from "@/lib/helpers";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  text: string;
  description: string;
}

interface KanbanData {
  id: string;
  date: string; // Manter como string
  tasks: Task[];
}

function OrganizePage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [kanbans, setKanbans] = useState<KanbanData[]>([]);
  console.log(currentMonth)

  useEffect(() => {
    fetchKanbans();
  }, []);

  const correctDate = (date: Date) => {
    let dateFormatted = new Date(date)
    dateFormatted.setHours(dateFormatted.getHours() + 3)
    return dateFormatted;
  }

  const fetchKanbans = async () => {
    try {
      const response = await axios.get('/api/kanban');
      console.log(response.data);
      response.data.forEach((el: KanbanData) => {
        const toCorrectDate = new Date(el.date);
        const correctedDate = toCorrectDate.setHours(toCorrectDate.getHours() + 3);
        el.date = format(new Date(correctedDate), "yyyy-MM-dd")
      })
      const kanbansData = response.data.map((kanban: KanbanData) => ({
        ...kanban,
        date: kanban.date // Garantir que a data seja uma string formatada
      }));
      console.log(kanbansData);
      setKanbans(kanbansData);
    } catch (error) {
      console.error("Failed to fetch kanbans:", error);
    }
  };
  const from = subDays(currentMonth, 30);
  const to = addDays(currentMonth, 60);
  console.log(from, to)
  const history = useQuery<GetTransactionHistoryResponseType>({
    queryKey: ["transactions", "history", from, to],
    queryFn: () =>
      fetch(
        `/api/transactions-history?from=${DateToUTCDate(
          from
        )}&to=${DateToUTCDate(to)}`
      ).then((res) => res.json()),
  });

  console.log(history.data)

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
        await axios.post('/api/kanban/task', { description: task.description, text: task.text, kanbanId: kanban.id });
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
      <header className="flex items-center justify-start gap-2 px-6 py-4 border-b bg-card">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={handlePreviousMonth}>
            <ChevronLeft className="w-5 h-5" />
            <span className="sr-only">Mês anterior</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="w-5 h-5" />
            <span className="sr-only">Próximo mês</span>
          </Button>
        </div>
        <div className="text-lg font-medium">
          <span className="mr-2 capitalize">{format(currentMonth, "MMMM", { locale: ptBR })} <span className="lowercase"> de</span></span>
          <span>{format(currentMonth, "yyyy")}</span>
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
        <div className="h-4 flex items-center px-6 py-4 bg-card text-muted-foreground font-medium border" key={i}>
          {day}
        </div>
      );
    }
    return <div className="grid grid-cols-7 gap-px bg-muted">{days}</div>;
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
                className={`p-1 h-32 flex gap-2 bg-card text-muted-foreground border-[0.05rem] ${!isSameMonth(day, monthStart)
                  ? "text-primary bg-card dark:bg-muted"
                  : isToday(day)
                    ? "bg-muted-foreground dark:bg-primary-foreground"
                    : "bg-muted dark:bg-card"
                  }`}
              >
                <div>
                  {isSameMonth(day, monthStart) ? (
                    <div className={`flex text-xs items-center justify-center w-6 h-6 rounded-full ${!isSameMonth(day, monthStart)
                      ? "text-muted"
                      : isToday(day)
                        ? "text-current bg-card"
                        : ""
                      }`}>
                      {formattedDate}
                    </div>

                  ) : (

                    <div className="flex text-xs items-center justify-center w-8 h-8 rounded-full">{formattedDate}</div>

                  )}
                </div>
                <ScrollArea className="w-full">
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-col gap-2">
                      {kanban && kanban.tasks && kanban.tasks.slice(0, 3).map(task => (
                        <div key={task.id} className="text-sm bg-sky-700/80 text-white pl-1 rounded">
                          {task.text}
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-col gap-2">
                      {history.data?.map((history, index) => (
                        <>
                          {isSameDay(new Date(correctDate(history.date)), day) && (
                            <div className={cn(
                              "w-full rounded pl-1 text-white text-sm",
                              history.type === "income" ? "bg-emerald-500" : "bg-red-500"
                            )}>
                              {history.description}
                            </div>
                          )}
                        </>
                      ))}
                    </div>
                  </div>
                </ScrollArea>

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
      <div className="flex flex-col min-h-screen bg-background">
        {renderHeader()}
        {renderDays()}
        {renderCells()}
      </div>
    </>
  );
}

export default OrganizePage;
