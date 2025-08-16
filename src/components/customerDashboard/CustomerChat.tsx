import { useState, useEffect, useRef, useCallback, useMemo } from "react";

// Define message type
interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: any;
  read: boolean;
}

import { db, auth } from "@/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  setDoc,
  doc,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Menu, X, ArrowLeft, User, MoreVertical } from "lucide-react";

// Get chatId consistently - moved outside component to prevent recreating
const getChatId = (customerId, providerId) =>
  `${customerId}_${providerId}`;

export default function CustomerChat() {
  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [providerNames, setProviderNames] = useState({});
  const [isMobile, setIsMobile] = useState(false);
  const [showChatList, setShowChatList] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  const currentUser = auth.currentUser;
  const params = new URLSearchParams(window.location.search);
  const directProviderId = params.get("providerId");
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null); // Add ref for input

  // Memoize current user ID to prevent unnecessary re-renders
  const currentUserId = useMemo(() => currentUser?.uid, [currentUser]);

  // Check if mobile - use useCallback to prevent recreation
  const checkMobile = useCallback(() => {
    const isMobileView = window.innerWidth < 768;
    setIsMobile(isMobileView);
    if (window.innerWidth >= 768) {
      setShowChatList(true);
    }
  }, []);

  useEffect(() => {
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [checkMobile]);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Fetch provider name - memoize with useCallback
  const fetchProviderName = useCallback(async (providerId) => {
    try {
      const providerDoc = await getDoc(doc(db, "users", providerId));
      if (providerDoc.exists()) {
        const data = providerDoc.data();
        return data.displayName || data.name || `Provider ${providerId.slice(0, 6)}`;
      }
      return `Provider ${providerId.slice(0, 6)}`;
    } catch (error) {
      console.error("Error fetching provider name:", error);
      return `Provider ${providerId.slice(0, 6)}`;
    }
  }, []);

  // Fetch all providers the customer has chatted with
  useEffect(() => {
    if (!currentUserId) return;
    
    const q = query(
      collection(db, "chats"),
      where("participants.customerId", "==", currentUserId)
    );

    const unsub = onSnapshot(q, async (snapshot) => {
      const provList = snapshot.docs.map((doc) => ({
        id: doc.id,
        providerId: doc.data().participants.providerId,
        lastMessage: doc.data().lastMessage || "",
        lastMessageTime: doc.data().lastMessageTime,
      }));
      
      // Sort by last message time
      provList.sort((a, b) => {
        if (!a.lastMessageTime) return 1;
        if (!b.lastMessageTime) return -1;
        return b.lastMessageTime.seconds - a.lastMessageTime.seconds;
      });
      
      setProviders(provList);

      // Fetch provider names
      const names = {};
      for (const prov of provList) {
        names[prov.providerId] = await fetchProviderName(prov.providerId);
      }
      setProviderNames(names);

      // Auto-select provider from query
      if (directProviderId) {
        const found = provList.find(
          (prov) => prov.providerId === directProviderId
        );
        if (found) {
          setSelectedProvider(found);
          if (isMobile) setShowChatList(false);
        } else {
          // Not in list yet, create temporary entry for chat
          const providerName = await fetchProviderName(directProviderId);
          setProviderNames(prev => ({ ...prev, [directProviderId]: providerName }));
          setSelectedProvider({ providerId: directProviderId });
          if (isMobile) setShowChatList(false);
        }
      }
    });

    return () => unsub();
  }, [currentUserId, directProviderId, isMobile, fetchProviderName]);

  // Listen for messages with selected provider
  useEffect(() => {
    if (!selectedProvider || !currentUserId) return;

    const chatId = getChatId(currentUserId, selectedProvider.providerId);
    const q = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("timestamp", "asc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({ 
        id: doc.id, 
        ...doc.data() 
      })) as Message[];
      setMessages(msgs);
    });

    return () => unsub();
  }, [selectedProvider, currentUserId]);

  // Send message - use useCallback to prevent recreation
  const sendMessage = useCallback(async () => {
    if (!newMsg.trim() || !selectedProvider || isLoading || !currentUserId) return;
    
    setIsLoading(true);
    const chatId = getChatId(currentUserId, selectedProvider.providerId);

    try {
      await setDoc(
        doc(db, "chats", chatId),
        {
          participants: {
            customerId: currentUserId,
            providerId: selectedProvider.providerId,
          },
          lastMessage: newMsg,
          lastMessageTime: serverTimestamp(),
          createdAt: serverTimestamp(),
        },
        { merge: true }
      );

      await addDoc(collection(db, "chats", chatId, "messages"), {
        senderId: currentUserId,
        text: newMsg,
        timestamp: serverTimestamp(),
        read: false,
      });

      setNewMsg("");
      // Keep focus on input after sending
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  }, [newMsg, selectedProvider, isLoading, currentUserId]);

  // Handle Enter key press - use useCallback
  const handleKeyPress = useCallback((e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  // Handle provider selection - use useCallback
  const handleProviderSelect = useCallback((prov) => {
    setSelectedProvider(prov);
    if (isMobile) {
      setShowChatList(false);
    }
  }, [isMobile]);

  // Handle back button - use useCallback
  const handleBack = useCallback(() => {
    if (isMobile) {
      setShowChatList(true);
      setSelectedProvider(null);
    }
  }, [isMobile]);

  // Format time - use useCallback
  const formatTime = useCallback((timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const msgDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    if (msgDate.getTime() === today.getTime()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString();
    }
  }, []);

  // Chat List Component - memoize to prevent unnecessary re-renders
  const ChatList = useMemo(() => (
    <div className="h-full bg-white flex flex-col">
      {/* Header */}
      <div className="bg-[#ff00c8] text-white p-[22px] flex items-center justify-between">
        <h1 className="text-xl font-medium ">Messages</h1>
        <MoreVertical className="h-5 w-5" />
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1">
        {providers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-4">💬</div>
              <p className="text-lg font-medium mb-2">No conversations yet</p>
              <p className="text-sm">Start chatting with a provider</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {providers.map((prov) => (
              <div
                key={prov.providerId}
                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                  selectedProvider?.providerId === prov.providerId ? 'bg-gray-50' : ''
                }`}
                onClick={() => handleProviderSelect(prov)}
              >
                <div className="flex items-center space-x-3">
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-[#ff00c8] rounded-full flex items-center justify-center text-white font-medium">
                    <User className="h-6 w-6" />
                  </div>
                  
                  {/* Chat Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-gray-900 truncate flex jusitfy-between items-center">
                        {providerNames[prov.providerId] || "Loading..."}
                      </h3>
                      <span className="text-md text-gray-500 truncate">
                        {formatTime(prov.lastMessageTime)}
                      </span>
                    </div>
                    {prov.lastMessage && (
                      <p className="text-lg text-green-500 truncate font-semibold">
                        {prov.lastMessage}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  ), [providers, selectedProvider, providerNames, formatTime, handleProviderSelect]);

  // Chat Window Component
  const ChatWindow = useMemo(() => (
    <div className="h-full bg-white flex flex-col">
      {/* Chat Header */}
      <div className="bg-[#ff00c8] text-white p-4 flex items-center space-x-3 shadow-md">
        {isMobile && (
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-[#e03cbd] p-1"
            onClick={handleBack}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        
        <div className="w-10 h-10 bg-[#ff00c8] rounded-full flex items-center justify-center">
          <User className="h-5 w-5" />
        </div>
        
        <div className="flex-1">
          <h2 className="font-medium">
            {providerNames[selectedProvider?.providerId] || "Loading..."}
          </h2>
          <p className="text-xs text-green-100">Click here for contact info</p>
        </div>
        
        <MoreVertical className="h-5 w-5" />
      </div>

      {/* Messages Area */}
      <div className="flex-1 bg-gray-50 bg-opacity-50 relative overflow-hidden">        
        <ScrollArea className="h-full relative z-10">
          <div className="p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                  <User className="h-10 w-10 text-gray-400" />
                </div>
                <p className="text-center font-medium mb-2">
                  {providerNames[selectedProvider?.providerId] || "Provider"}
                </p>
                <p className="text-sm text-center">
                  Start a conversation by sending a message
                </p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.senderId === currentUserId ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] px-3 py-2 rounded-lg relative ${
                      msg.senderId === currentUserId
                        ? "bg-[#ff00c8] text-white rounded-br-sm"
                        : "bg-white text-gray-900 rounded-bl-sm shadow-sm"
                    }`}
                  >
                    <p className="text-sm leading-relaxed break-words">{msg.text}</p>
                    <div className={`flex items-center justify-end mt-1 space-x-1`}>
                      <span className={`text-xs ${
                        msg.senderId === currentUserId ? "text-green-100" : "text-gray-500"
                      }`}>
                        {msg.timestamp?.toDate()?.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {msg.senderId === currentUserId && (
                        <div className="text-green-100">
                          <svg className="w-4 h-4" viewBox="0 0 16 15" fill="currentColor">
                            <path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l2.541 2.434c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.064-.512z"/>
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Message Input */}
      <div className="bg-gray-50 p-4 border-t">
        <div className="flex items-end space-x-3">
          <div className="flex-1">
            <Input
              ref={inputRef}
              placeholder="Type a message"
              value={newMsg}
              onChange={(e) => setNewMsg(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={isLoading}
              className="w-full rounded-full border border-gray-200 focus:border-green-500 focus:ring-1 focus:ring-green-500 py-3 px-4"
            />
          </div>
          <Button
            onClick={sendMessage}
            disabled={isLoading || !newMsg.trim()}
            className="bg-[#ff00c8] hover:bg-[#e43bbf] rounded-full h-12 w-12 p-0"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  ), [selectedProvider, providerNames, messages, newMsg, isLoading, currentUserId, isMobile, handleBack, handleKeyPress, sendMessage]);

  // Welcome Screen - memoize
  const WelcomeScreen = useMemo(() => (
    <div className="h-full bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-8">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-12 h-12 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
          </svg>
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-3">Welcome to Messages</h2>
        <p className="text-gray-600 mb-6">
          Send and receive messages from service providers. Select a conversation to start chatting.
        </p>
        <div className="text-sm text-gray-500">
          <p>🔒 Your messages are secure and private</p>
        </div>
      </div>
    </div>
  ), []);

  return (
    <div className="h-screen bg-gray-100 flex">
      {/* Desktop Layout */}
      {!isMobile && (
        <>
          <div className="w-80 border-r border-gray-200">
            {ChatList}
          </div>
          <div className="flex-1">
            {selectedProvider ? ChatWindow : WelcomeScreen}
          </div>
        </>
      )}

      {/* Mobile Layout */}
      {isMobile && (
        <>
          {showChatList ? (
            <div className="w-full">
              {ChatList}
            </div>
          ) : (
            selectedProvider && (
              <div className="w-full">
                {ChatWindow}
              </div>
            )
          )}
        </>
      )}
    </div>
  );
}