"use client";

import { useState } from "react";
import { useEffect } from "react";
import { chatAPI } from "@/lib/api";
import { socketService } from "@/lib/socket";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MessageCircle,
  Search,
  MoreHorizontal,
  Smile,
  Send,
  Paperclip,
  Download,
} from "lucide-react";

export function ChatContent() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedChat, setSelectedChat] = useState(2);
  const [messageInput, setMessageInput] = useState("");
  const [chats, setChats] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  useEffect(() => {
    fetchChats();
    
    // Socket event listeners
    const handleNewMessage = (event: any) => {
      const { message, chat } = event.detail;
      if (chat.id === selectedChat) {
        setMessages(prev => [...prev, message]);
      }
      // Update chat list with new message
      setChats(prev => prev.map(c => 
        c._id === chat.id 
          ? { ...c, lastMessage: message, lastActivity: new Date() }
          : c
      ));
    };

    const handleUserTyping = (event: any) => {
      const { userId, user: typingUser } = event.detail;
      setTypingUsers(prev => [...prev.filter(id => id !== userId), userId]);
      
      // Remove typing indicator after 3 seconds
      setTimeout(() => {
        setTypingUsers(prev => prev.filter(id => id !== userId));
      }, 3000);
    };

    const handleUserStoppedTyping = (event: any) => {
      const { userId } = event.detail;
      setTypingUsers(prev => prev.filter(id => id !== userId));
    };

    window.addEventListener('new_message', handleNewMessage);
    window.addEventListener('user_typing', handleUserTyping);
    window.addEventListener('user_stopped_typing', handleUserStoppedTyping);

    return () => {
      window.removeEventListener('new_message', handleNewMessage);
      window.removeEventListener('user_typing', handleUserTyping);
      window.removeEventListener('user_stopped_typing', handleUserStoppedTyping);
    };
  }, [selectedChat]);

  const fetchChats = async () => {
    try {
      const response = await chatAPI.getUserChats();
      setChats(response.data.data.chats);
      
      if (response.data.data.chats.length > 0) {
        const firstChat = response.data.data.chats[0];
        setSelectedChat(firstChat._id);
        fetchMessages(firstChat._id);
      }
    } catch (error) {
      console.error('Failed to fetch chats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (chatId: string) => {
    try {
      const response = await chatAPI.getChatMessages(chatId);
      setMessages(response.data.data.messages);
      
      // Join chat room for real-time updates
      socketService.joinChat(chatId);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const handleChatSelect = (chatId: string) => {
    setSelectedChat(chatId);
    fetchMessages(chatId);
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedChat) return;

    try {
      await chatAPI.sendMessage(selectedChat, {
        messageType: 'text',
        content: { text: messageInput }
      });
      
      setMessageInput("");
      
      // Also emit via socket for real-time
      socketService.sendMessage(selectedChat, 'text', { text: messageInput });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const handleTyping = () => {
    if (selectedChat) {
      socketService.startTyping(selectedChat);
    }
  };

  const handleStopTyping = () => {
    if (selectedChat) {
      socketService.stopTyping(selectedChat);
    }
  };

  return (
    <div className="flex h-[calc(100vh-120px)] bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-gray-50 overflow-hidden">
      {/* Left Sidebar - Chat List */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-pink-500">Chats</h2>
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : chats.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No chats found
            </div>
          ) : (
            chats.map((chat) => (
            <div
              key={chat._id}
              onClick={() => handleChatSelect(chat._id)}
              className={`flex items-center p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 ${
                selectedChat === chat._id
                  ? "bg-blue-50 border-l-4 border-l-blue-500"
                  : ""
              }`}
            >
              <Avatar className="w-12 h-12 mr-3">
                <AvatarImage src={chat.participants?.[0]?.user?.avatar} />
                <AvatarFallback>
                  {chat.participants?.[0]?.user?.firstName?.[0]}{chat.participants?.[0]?.user?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900 truncate text-sm">
                    {chat.title || `${chat.participants?.[0]?.user?.firstName} ${chat.participants?.[0]?.user?.lastName}`}
                  </h3>
                  <div className="flex items-center space-x-2">
                    {chat.lastActivity && (
                      <span className="text-xs text-gray-500">
                        {new Date(chat.lastActivity).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    )}
                    {chat.unreadCount > 0 && (
                      <Badge className="bg-pink-500 hover:bg-pink-500 text-white w-5 h-5 rounded-full text-xs flex items-center justify-center p-0">
                        {chat.unreadCount}
                      </Badge>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1 capitalize">
                  {chat.participants?.[0]?.role}
                </p>
              </div>
            </div>
          ))
          )}
        </div>

        {/* Search Bar */}
        <div className="p-4 border-t border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search name or gender"
              className="pl-10 bg-white border-gray-200 rounded-lg h-10 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Right Side - Chat Conversation */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white/80">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src="https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face" />
              <AvatarFallback>IM</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium text-gray-900">Ibrahim Mekni</h3>
              <p className="text-sm text-gray-500">Active 5min ago</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
            <MoreHorizontal className="w-4 h-4 text-gray-500" />
          </Button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id}>
              {message.showTime && (
                <div className="text-center text-xs text-gray-400 mb-4">
                  {new Date(message.createdAt).toLocaleDateString()}
                </div>
              )}

              <div
                className={`flex ${
                  message.sender._id === user?._id ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-md ${
                    message.sender._id === user?._id ? "order-2" : "order-1"
                  }`}
                >
                  {message.content?.text && (
                    <div
                      className={`px-4 py-2 rounded-2xl mb-2 ${
                        message.sender._id === user?._id
                          ? "bg-pink-500 text-white ml-auto"
                          : "bg-gray-200 text-gray-900"
                      }`}
                    >
                      <p className="text-sm">{message.content.text}</p>
                    </div>
                  )}
                  {message.sender._id !== user?._id && (
                    <Avatar className="w-8 h-8 mb-2">
                      <AvatarImage src={message.sender.avatar} />
                      <AvatarFallback>{message.sender.firstName?.[0]}{message.sender.lastName?.[0]}</AvatarFallback>
                    </Avatar>
                  )}

                  {message.content?.file && (
                    <div className="grid grid-cols-4 mt-2">
                      <div className="bg-gray-100 rounded-lg p-3 flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                          <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
                            <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {message.content.file.originalName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(message.content.file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                        <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                          <Download className="w-4 h-4 text-gray-500" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {!message.showTime && (
                    <p className="text-xs text-gray-400 mt-1 text-right">
                      {new Date(message.createdAt).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {/* Typing indicator */}
          {typingUsers.length > 0 && (
            <div className="flex justify-start">
              <div className="bg-gray-200 text-gray-900 px-4 py-2 rounded-2xl">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-gray-200 bg-white/80">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
              <Paperclip className="w-4 h-4 text-gray-500" />
            </Button>
            <div className="flex-1 relative">
              <Input
                placeholder="Start typing here"
                value={messageInput}
                onChange={(e) => {
                  setMessageInput(e.target.value);
                  handleTyping();
                }}
                onBlur={handleStopTyping}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSendMessage();
                  }
                }}
                className="pr-10 bg-white border-gray-200 rounded-full h-10"
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 w-6 h-6 p-0"
              >
                <Smile className="w-4 h-4 text-gray-500" />
              </Button>
            </div>
            <Button 
              className="bg-pink-500 hover:bg-pink-600 text-white w-10 h-10 rounded-full p-0"
              onClick={handleSendMessage}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}