"use client";

import { useState, useCallback, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";
import axios from "axios";

interface ChatResponse {
  choices: { message: { content: string } }[];
  chatId: string;
}

function ChatPage() {
  const { user } = useUser();
  const [messages, setMessages] = useState<{ role: string, content: string }[]>([]);
  const [input, setInput] = useState('');
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Função para buscar os logs de chat ao iniciar o chat ou quando o chatId muda
  const fetchChatLogs = useCallback(async () => {
    if (!currentChatId) return; // Só busca se houver um chatId

    try {
      setIsLoading(true);
      const response = await axios.get(`/api/chatIa?chatId=${currentChatId}`);
      const chatLogs = response.data.messages; // Verifica se existe 'messages' no response

      // Verificação se 'chatLogs' existe e é um array antes de usar o map
      if (Array.isArray(chatLogs)) {
        setMessages((prevMessages) => [
          ...prevMessages,
          ...chatLogs.map((log: { role: string; content: string }) => ({
            role: log.role,
            content: log.content,
          })),
        ]);
      } else {
        console.error("chatLogs não está definido ou não é um array:", chatLogs);
      }
    } catch (error) {
      console.error("Erro ao buscar logs:", error);
      toast.error("Erro ao buscar logs.");
    } finally {
      setIsLoading(false);
    }
  }, [currentChatId]);

  useEffect(() => {
    fetchChatLogs();
  }, [fetchChatLogs]);

  const handleSendMessage = useCallback(async () => {
    if (input.trim() === '') return;

    const userMessage = { role: 'user', content: input };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput('');

    toast.loading("Aguardando resposta da IA");

    try {
      const response = await axios.post(`/api/chatIa`, {
        message: input,
        chatId: currentChatId,
      });

      const botMessage = { role: 'bot', content: response.data.choices[0].message.content };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
      setCurrentChatId(response.data.chatId);

      toast.success("Mensagem enviada com sucesso!");
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      toast.error("Falha ao enviar mensagem.");
    } finally {
      toast.dismiss(); // Remove o loader da mensagem
    }
  }, [input, currentChatId]);

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="h-full w-full bg-background">
      <div className="border-b bg-card mb-4">
        <div className="container flex flex-col flex-wrap justify-between gap-2 py-8">
          <p className="text-3xl font-bold">IA</p>
          <span className="text-[12px]">
            Um assistente de IA especializado em finanças pessoais, ajudando a gerenciar seu dinheiro de forma inteligente e eficiente.
          </span>
        </div>
      </div>

      <div className="flex flex-col h-full">
        <div className="flex justify-between p-4">
          <div className="flex-grow p-4 overflow-y-auto max-h-96 custom-scrollbar flex flex-col justify-between gap-2">
            {isLoading ? (
              <p>Carregando...</p>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`mb-2 p-2 rounded flex flex-col gap-2 ${
                    msg.role === 'user' ? 'bg-card text-primary text-right w-1/2 self-end' : 'text-primary self-start'
                  }`}
                >
                  <span className={`text-sm ${msg.role === 'user' ? 'italic' : 'text-primary italic'}`}>
                    {msg.role === 'user' ? user?.firstName : 'IA'}
                  </span>
                  {msg.content}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex py-4 border-t gap-3 p-4">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escreva sua mensagem"
            className="flex-grow p-2 border rounded"
          />
          <Button onClick={handleSendMessage} disabled={isLoading} variant={"outline"} className="gap-1 border-gray-400 bg-gray-900 text-gray-400 hover:bg-gray-700 hover:text-gray-400">
            {isLoading ? "Carregando..." : "Enviar"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ChatPage;
