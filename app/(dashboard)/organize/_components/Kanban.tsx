"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Bell, Calendar, Clock, FileText, Link, MapPin, Users, Video } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";


interface Props {
  trigger: React.ReactNode;
  date: Date;
  addTask: (task: Task) => void;
}

interface Task {
  id: string;
  text: string;
  description: string;
}

const Kanban: React.FC<Props> = ({ trigger, date, addTask }) => {
  const [open, setOpen] = useState(false);
  const [taskText, setTaskText] = useState("");
  const [taskDescription, setTaskDescription] = useState("");

  const [fontDrescription, setFontDrescription] = useState("");
  const [descriptionOpen, setDescriptionOpen] = useState(false);

  const [showMoreOptions, setShowMoreOptions] = useState(false)

  const dateFormatted = date.setHours(date.getHours() + 2)
  const handleAddTask = () => {
    if (taskText.trim() === "") return;
    console.log(date)
    const newTask = {
      id: new Date(dateFormatted).toString(),
      text: taskText,
      description: taskDescription
    };
    console.log(newTask)
    addTask(newTask);
    setTaskText("");
    setOpen(false);  // Fechar o kanban após adicionar a tarefa
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="w-2/4">
        <ScrollArea className="h-96 p-6 pt-10">
          <div className="space-y-6 ">
            <Input
              className="text-xl border-0 border-b rounded-none px-0 focus-visible:ring-0"
              placeholder="Adicionar título e horário"
              value={taskText}
              onChange={(e) => setTaskText(e.target.value)}
            />
            {/* <Tabs defaultValue="event" className="w-full">
              <TabsList className="grid w-[200px] grid-cols-2">
                <TabsTrigger value="event">Evento</TabsTrigger>
                <TabsTrigger value="task">Tarefa</TabsTrigger>
              </TabsList>
            </Tabs> */}

            <div className="flex items-center gap-4 py-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <p>{format(dateFormatted, "PPP", {
                  locale: ptBR
                })}</p>
                <p className="text-sm text-muted-foreground">Não se repete</p>
              </div>
              <Button disabled variant="outline" size="sm">
                Adicionar horário
              </Button>
            </div>

            <div className="flex flex-col gap-4">
              <div onClick={descriptionOpen ? () => setDescriptionOpen(false) : () => setDescriptionOpen(true)} className="flex items-center gap-4 py-2 hover:bg-accent cursor-pointer rounded-md">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <span className="text-muted-foreground">Adicionar uma descrição</span>
              </div>
              {descriptionOpen && (
                <div className="flex flex-col gap-1">
                  <div className="flex gap-3 w-full bg-muted pl-2">
                    <span onClick={fontDrescription === 'bold' ? () => setFontDrescription('') : () => setFontDrescription('bold')} className="font-bold cursor-pointer hover:text-muted-foreground">B</span>
                    <span onClick={fontDrescription === 'italic' ? () => setFontDrescription('') : () => setFontDrescription('italic')} className="italic font-serif cursor-pointer hover:text-muted-foreground">I</span>
                  </div>
                  <Textarea className={cn(
                    "max-h-9 rounded-none",
                    fontDrescription === "bold" && "font-bold",
                    fontDrescription === "italic" && "italic"
                  )}
                    value={taskDescription}
                    onChange={e => setTaskDescription(e.target.value)}
                    placeholder="Adicione uma descrição" />
                </div>
              )}

              {/* <div className="flex items-center gap-4 py-2 hover:bg-accent cursor-pointer rounded-md px-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                <span className="text-muted-foreground">Adicionar convidados</span>
              </div> */}

              {/* <Button disabled className="w-full justify-start gap-2" variant="outline">
                <Video className="h-5 w-5" />
                Adicionar videoconferência do Google Meet
              </Button>

              <div className="flex items-center gap-4 py-2 hover:bg-accent cursor-pointer rounded-md px-2">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <span className="text-muted-foreground">Adicionar local</span>
              </div> */}



              {/* <div className="flex items-center gap-4 py-2 hover:bg-accent cursor-pointer rounded-md px-2">
                <Link className="h-5 w-5 text-muted-foreground" />
                <span className="text-muted-foreground">Adicionar um anexo do Google Drive</span>
              </div> */}

              {/* <div className="flex items-center gap-4 py-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <Select defaultValue="william">
                  <SelectTrigger className="w-[180px] border-0 p-0 h-auto">
                    <SelectValue placeholder="Select calendar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="william">William Wunsch</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-4 py-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                <Select defaultValue="busy">
                  <SelectTrigger className="w-[180px] border-0 p-0 h-auto">
                    <SelectValue placeholder="Select availability" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="busy">Livre</SelectItem>
                    <SelectItem value="available">Ocupado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-4 py-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                <Select defaultValue="default">
                  <SelectTrigger className="w-[180px] border-0 p-0 h-auto">
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Visibilidade padrão</SelectItem>
                    <SelectItem value="public">Público</SelectItem>
                    <SelectItem value="private">Privado</SelectItem>
                  </SelectContent>
                </Select>
              </div> 

              <div className="flex items-center gap-4 py-2 hover:bg-accent cursor-pointer rounded-md px-2">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <span className="text-muted-foreground">Adicionar notificação</span>
              </div>*/}
            </div>
          </div>
        </ScrollArea>
        <div className="flex itemc-center justify-end gap-2 pt-4">
          <Button
            variant="ghost"
            onClick={() => setShowMoreOptions(!showMoreOptions)}
          >
            Mais opções
          </Button>
          <Button onClick={handleAddTask}>Salvar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Kanban;
