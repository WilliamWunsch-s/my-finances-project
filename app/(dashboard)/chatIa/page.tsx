"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axios from "axios";
import { useUser } from "@clerk/nextjs";

function ChatPage() {
  const { user } = useUser();
  const [messages, setMessages] = useState<{ role: string, content: string }[]>([]);
  const [input, setInput] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [chatHistories, setChatHistories] = useState<any[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  useEffect(() => {
    fetchChatHistory();
  }, []);

  const createNewChat = async () => {
    try {
      const response = await axios.post('/api/chatIa', { message: "" });
      setCurrentChatId(response.data.chatId);
      setMessages([]);
    } catch (error) {
      console.error("Failed to create new chat:", error);
      toast.error("Erro ao criar novo chat.");
    }
  };

  const fetchChatHistory = async () => {
    try {
      const response = await axios.get('/api/chatIa');
      setChatHistories(response.data);
      if (response.data.length > 0) {
        setCurrentChatId(response.data[0].id);
        setMessages(response.data[0].messages);
      }
    } catch (error) {
      console.error("Failed to fetch chat history:", error);
      toast.error("Erro em resgatar mensagens anteriores.");
    }
  };

  const handleSendMessage = async () => {
    if (input.trim() === '') return;

    setIsPending(true);
    const userMessage = { role: 'user', content: input };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput('');

    try {
      if (!currentChatId) {
        await createNewChat();
      }

      const response = await axios.post(`/api/chatIa`, {
        message: input,
        chatId: currentChatId,
      });

      const botMessage = { role: 'bot', content: response.data.choices[0].message.content };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
      setCurrentChatId(response.data.chatId);
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message.");
    } finally {
      setIsPending(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleChatSelect = (chat: any) => {
    setCurrentChatId(chat.id);
    setMessages(chat.messages);
  };

  return (
    <div className="h-full w-full bg-background">
      <div className="border-b bg-card mb-4">
        <div className="container flex flex-col flex-wrap justify-between gap-2 py-8">
          <p className="text-3xl font-bold">IA</p>
          <span className="text-[12px]">Um assistente de IA especializado em finanças pessoais, ajudando a gerenciar seu dinheiro de forma inteligente e eficiente.</span>
        </div>
      </div>
      <div className="flex flex-col h-full">
        <div className="flex justify-between p-4">
          <div className="flex flex-col w-1/4">
            {chatHistories.map((chat, index) => (
              <button
                key={chat.id}
                onClick={() => handleChatSelect(chat)}
                className={`p-2 ${currentChatId === chat.id ? 'bg-primary text-white' : 'bg-white text-black'} mb-2 rounded`}
              >
                Chat {index + 1}
              </button>
            ))}
          </div>
          <div className="flex-grow p-4 overflow-y-auto max-h-96 custom-scrollbar flex flex-col justify-between gap-2">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`mb-2 p-2 rounded flex flex-col gap-2 ${msg.role === 'user' ? 'bg-card text-primary text-right w-1/2 self-end' : 'text-primary self-start'
                  }`}
              >
                <span className={`text-sm ${msg.role === 'user' ? 'italic' : 'text-primary italic'
                  }`}>{msg.role === 'user' ? user?.firstName : 'IA'}</span>
                {msg.content}
              </div>
            ))}
          </div>
        </div>
        <div className="flex py-4 border-t gap-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escreva sua mensagem"
            className="flex-grow p-2 border rounded"
          />
          <Button onClick={handleSendMessage} disabled={isPending} variant={"outline"} className="gap-1 border-gray-400 bg-gray-900 text-gray-400 hover:bg-gray-700 hover:text-gray-400">
            {isPending ? "Enviando..." : "Enviar"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ChatPage;
