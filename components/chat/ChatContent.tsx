"use client";

import { useState, useEffect, useRef } from "react";
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
  Plus,
} from "lucide-react";

export function ChatContent() {
  const { user } = useAuth();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [chats, setChats] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchChats();

    // Socket event listeners
    const handleNewMessage = (event: any) => {
      const { message, chat } = event.detail;
      if (chat.id === selectedChat || chat._id === selectedChat) {
        setMessages((prev) => [...prev, message]);
        scrollToBottom();
      }
      // Update chat list with new message
      setChats((prev) =>
        prev.map((c) =>
          c._id === (chat.id || chat._id)
            ? { ...c, lastMessage: message, lastActivity: new Date() }
            : c
        )
      );
    };

    const handleUserTyping = (event: any) => {
      const { userId } = event.detail;
      if (userId !== user?._id) {
        setTypingUsers((prev) => [
          ...prev.filter((id) => id !== userId),
          userId,
        ]);

        // Remove typing indicator after 3 seconds
        setTimeout(() => {
          setTypingUsers((prev) => prev.filter((id) => id !== userId));
        }, 3000);
      }
    };

    const handleUserStoppedTyping = (event: any) => {
      const { userId } = event.detail;
      setTypingUsers((prev) => prev.filter((id) => id !== userId));
    };

    const handleUserOnline = (event: any) => {
      const { userId } = event.detail;
      setOnlineUsers((prev: any) => new Set([...prev, userId]));
    };

    const handleUserOffline = (event: any) => {
      const { userId } = event.detail;
      setOnlineUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    };

    const handleOnlineUsersList = (event: any) => {
      const { users } = event.detail;
      const userIds = users.map((u: any) => u.userId);
      setOnlineUsers(new Set(userIds));
    };

    window.addEventListener("new_message", handleNewMessage);
    window.addEventListener("user_typing", handleUserTyping);
    window.addEventListener("user_stopped_typing", handleUserStoppedTyping);
    window.addEventListener("user_online", handleUserOnline);
    window.addEventListener("user_offline", handleUserOffline);
    window.addEventListener("online_users_list", handleOnlineUsersList);

    return () => {
      window.removeEventListener("new_message", handleNewMessage);
      window.removeEventListener("user_typing", handleUserTyping);
      window.removeEventListener(
        "user_stopped_typing",
        handleUserStoppedTyping
      );
      window.removeEventListener("user_online", handleUserOnline);
      window.removeEventListener("user_offline", handleUserOffline);
      window.removeEventListener("online_users_list", handleOnlineUsersList);
    };
  }, [selectedChat, user?._id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchChats = async () => {
    try {
      const response = await chatAPI.getUserChats();
      const chatsData = response.data.data.chats;
      setChats(chatsData);

      if (chatsData.length > 0) {
        const firstChat = chatsData[0];
        setSelectedChat(firstChat._id);
        fetchMessages(firstChat._id);
      }
    } catch (error) {
      console.error("Failed to fetch chats:", error);
      // If no chats exist, show empty state
      setChats([]);
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
      console.error("Failed to fetch messages:", error);
      setMessages([]);
    }
  };

  const handleChatSelect = (chatId: string) => {
    setSelectedChat(chatId);
    fetchMessages(chatId);
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedChat) return;

    const tempMessage = {
      _id: Date.now().toString(),
      content: { text: messageInput },
      sender: user,
      createdAt: new Date().toISOString(),
      messageType: "text",
    };

    // Optimistically add message
    setMessages((prev) => [...prev, tempMessage]);
    const messageText = messageInput;
    setMessageInput("");

    try {
      await chatAPI.sendMessage(selectedChat, {
        messageType: "text",
        content: { text: messageText },
      });

      // Also emit via socket for real-time
      socketService.sendMessage(selectedChat, "text", { text: messageText });
    } catch (error: any) {
      // Remove optimistic message on error
      setMessages((prev) => prev.filter((m) => m._id !== tempMessage._id));
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

  const getOtherParticipant = (chat: any) => {
    if (!chat.participants || chat.participants.length === 0) return null;

    // Find participant that is not the current user
    const otherParticipant = chat.participants.find(
      (p: any) => p.user._id !== user?._id
    );

    return otherParticipant?.user || chat.participants[0]?.user;
  };

  const createNewChat = async (participantId: string) => {
    try {
      const response = await chatAPI.createChat({
        participantIds: [participantId],
        chatType: "direct",
      });

      const newChat = response.data.data.chat;
      setChats((prev) => [newChat, ...prev]);
      setSelectedChat(newChat._id);
      fetchMessages(newChat._id);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to create chat",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex h-[calc(100vh-120px)] bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-gray-50 overflow-hidden">
      {/* Left Sidebar - Chat List */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-pink-500">Chats</h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-8 h-8 p-0 text-blue-500 hover:bg-blue-50"
              onClick={() => {
                // This would open a modal to start new chat
                toast({
                  title: "Info",
                  description: "New chat creation will be available soon",
                });
              }}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search chats..."
              className="pl-10 bg-white border-gray-200 rounded-lg h-10 text-sm"
            />
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
              <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No chats yet</p>
              <p className="text-xs text-gray-400">Start a conversation</p>
            </div>
          ) : (
            chats.map((chat) => {
              const otherParticipant = getOtherParticipant(chat);
              if (!otherParticipant) return null;

              const isOnline = onlineUsers.has(otherParticipant._id);

              return (
                <div
                  key={chat._id}
                  onClick={() => handleChatSelect(chat._id)}
                  className={`flex items-center p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 ${
                    selectedChat === chat._id
                      ? "bg-blue-50 border-l-4 border-l-blue-500"
                      : ""
                  }`}
                >
                  <div className="relative mr-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={otherParticipant.avatar} />
                      <AvatarFallback>
                        {otherParticipant.firstName?.[0]}
                        {otherParticipant.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    {isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900 truncate text-sm">
                        {chat.title ||
                          `${otherParticipant.firstName} ${otherParticipant.lastName}`}
                      </h3>
                      <div className="flex items-center space-x-2">
                        {chat.lastActivity && (
                          <span className="text-xs text-gray-500">
                            {new Date(chat.lastActivity).toLocaleTimeString(
                              [],
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </span>
                        )}
                        {(chat.unreadCount || 0) > 0 && (
                          <Badge className="bg-pink-500 hover:bg-pink-500 text-white w-5 h-5 rounded-full text-xs flex items-center justify-center p-0">
                            {chat.unreadCount > 9 ? "9+" : chat.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-gray-500 capitalize">
                        {otherParticipant.role}
                      </p>
                      {chat.lastMessage && (
                        <p className="text-xs text-gray-400 truncate max-w-32">
                          {chat.lastMessage.content?.text || "File"}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Side - Chat Conversation */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white/80">
              {(() => {
                const currentChat = chats.find((c) => c._id === selectedChat);
                const otherParticipant = currentChat
                  ? getOtherParticipant(currentChat)
                  : null;
                const isOnline = otherParticipant
                  ? onlineUsers.has(otherParticipant._id)
                  : false;

                return (
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={otherParticipant?.avatar} />
                        <AvatarFallback>
                          {otherParticipant?.firstName?.[0]}
                          {otherParticipant?.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      {isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {otherParticipant
                          ? `${otherParticipant.firstName} ${otherParticipant.lastName}`
                          : "Unknown User"}
                      </h3>
                      <p className="text-sm text-gray-500 capitalize">
                        {isOnline ? "Online" : "Offline"} •{" "}
                        {otherParticipant?.role}
                      </p>
                    </div>
                  </div>
                );
              })()}
              <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                <MoreHorizontal className="w-4 h-4 text-gray-500" />
              </Button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No messages yet</p>
                    <p className="text-sm text-gray-400">
                      Start the conversation
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((message, index) => {
                  const showDateSeparator =
                    index === 0 ||
                    new Date(message.createdAt).toDateString() !==
                      new Date(messages[index - 1].createdAt).toDateString();

                  const isOwnMessage =
                    message.sender._id === user?._id ||
                    message.sender === user?._id;

                  return (
                    <div key={message._id || message.messageId || index}>
                      {showDateSeparator && (
                        <div className="text-center text-xs text-gray-400 mb-4">
                          {new Date(message.createdAt).toLocaleDateString()}
                        </div>
                      )}

                      <div
                        className={`flex ${
                          isOwnMessage ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md flex items-end space-x-2 ${
                            isOwnMessage
                              ? "flex-row-reverse space-x-reverse"
                              : ""
                          }`}
                        >
                          {!isOwnMessage && (
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={message.sender.avatar} />
                              <AvatarFallback>
                                {message.sender.firstName?.[0]}
                                {message.sender.lastName?.[0]}
                              </AvatarFallback>
                            </Avatar>
                          )}

                          <div className="flex flex-col">
                            {message.content?.text && (
                              <div
                                className={`px-4 py-2 rounded-2xl mb-1 ${
                                  isOwnMessage
                                    ? "bg-pink-500 text-white"
                                    : "bg-gray-200 text-gray-900"
                                }`}
                              >
                                <p className="text-sm">
                                  {message.content.text}
                                </p>
                              </div>
                            )}

                            {message.content?.file && (
                              <div className="bg-gray-100 rounded-lg p-3 flex items-center space-x-3 max-w-xs">
                                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                                  <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
                                    <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {message.content.file.originalName}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {(message.content.file.size / 1024).toFixed(
                                      1
                                    )}{" "}
                                    KB
                                  </p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-8 h-8 p-0"
                                >
                                  <Download className="w-4 h-4 text-gray-500" />
                                </Button>
                              </div>
                            )}

                            <p className="text-xs text-gray-400 mt-1 px-2">
                              {new Date(message.createdAt).toLocaleTimeString(
                                [],
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              {/* Typing indicator */}
              {typingUsers.length > 0 && (
                <div className="flex justify-start">
                  <div className="bg-gray-200 text-gray-900 px-4 py-2 rounded-2xl">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
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
                      if (e.key === "Enter") {
                        e.preventDefault();
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
                  disabled={!messageInput.trim()}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>Select a chat to start messaging</p>
              <p className="text-sm text-gray-400 mt-1">
                {chats.length === 0
                  ? "No chats available"
                  : "Choose from the list"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
