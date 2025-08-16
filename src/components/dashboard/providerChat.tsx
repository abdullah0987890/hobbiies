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
  updateDoc,
  getDocs,
  writeBatch,
} from "firebase/firestore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, ArrowLeft, User, MoreVertical, Phone, Video } from "lucide-react";

// Get chatId consistently - moved outside component
const getChatId = (customerId, providerId) =>
  `${customerId}_${providerId}`;

export default function ProviderChat() {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [customerNames, setCustomerNames] = useState({});
  const [isMobile, setIsMobile] = useState(false);
  const [showChatList, setShowChatList] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [chatInputs, setChatInputs] = useState({});
  
  const currentUser = auth.currentUser;
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

  // Fetch customer name - memoize with useCallback
  const fetchCustomerName = useCallback(async (customerId) => {
    try {
      const customerDoc = await getDoc(doc(db, "users", customerId));
      if (customerDoc.exists()) {
        const data = customerDoc.data();
        return data.displayName || data.name || `Customer ${customerId.slice(0, 6)}`;
      }
      return `Customer ${customerId.slice(0, 6)}`;
    } catch (error) {
      console.error("Error fetching customer name:", error);
      return `Customer ${customerId.slice(0, 6)}`;
    }
  }, []);

  // Fetch all customers that have chatted with this provider
  useEffect(() => {
    if (!currentUserId) return;

    const q = query(
      collection(db, "chats"),
      where("participants.providerId", "==", currentUserId)
    );

    const unsub = onSnapshot(q, async (snapshot) => {
      const customerList = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const chatData = docSnap.data();
          const chatId = docSnap.id;

          // Count unread messages in this chat
          const messagesRef = collection(db, "chats", chatId, "messages");
          const messagesSnap = await getDocs(
            query(messagesRef, where("read", "==", false), where("senderId", "==", chatData.participants.customerId))
          );
          const unreadCount = messagesSnap.size;

          return {
            id: chatId,
            customerId: chatData.participants.customerId,
            lastMessage: chatData.lastMessage || "",
            lastMessageTime: chatData.lastMessageTime,
            unreadCount,
          };
        })
      );

      // Sort by last message time
      customerList.sort((a, b) => {
        if (!a.lastMessageTime) return 1;
        if (!b.lastMessageTime) return -1;
        return b.lastMessageTime.seconds - a.lastMessageTime.seconds;
      });

      setCustomers(customerList);

      // Fetch customer names
      const names = {};
      for (const customer of customerList) {
        names[customer.customerId] = await fetchCustomerName(customer.customerId);
      }
      setCustomerNames(names);
    });

    return () => unsub();
  }, [currentUserId, fetchCustomerName]);

  // Listen for messages with selected customer
  useEffect(() => {
    if (!selectedCustomer || !currentUserId) return;

    const chatId = getChatId(selectedCustomer.customerId, currentUserId);
    const q = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("timestamp", "asc")
    );

    const unsub = onSnapshot(q, async (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({ 
        id: doc.id, 
        ...doc.data() 
      })) as Message[];
      setMessages(msgs);
      
      // Mark messages as read
      const unreadMessages = msgs.filter(msg => 
        msg.senderId !== currentUserId && !msg.read
      );
      
      for (const msg of unreadMessages) {
        try {
          await updateDoc(doc(db, "chats", chatId, "messages", msg.id), {
            read: true
          });
        } catch (error) {
          console.error("Error marking message as read:", error);
        }
      }
    });

    return () => unsub();
  }, [selectedCustomer, currentUserId]);

  // Send message - use useCallback to prevent recreation
  const sendMessage = useCallback(async () => {
    if (!newMsg.trim() || !selectedCustomer || isLoading || !currentUserId) return;
    
    setIsLoading(true);
    const chatId = getChatId(selectedCustomer.customerId, currentUserId);

    try {
      await setDoc(
        doc(db, "chats", chatId),
        {
          participants: {
            customerId: selectedCustomer.customerId,
            providerId: currentUserId,
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
  }, [newMsg, selectedCustomer, isLoading, currentUserId]);

  // Handle Enter key press - use useCallback
  const handleKeyPress = useCallback((e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  // Handle customer selection - use useCallback
  const handleCustomerSelect = useCallback(async (customer) => {
    setSelectedCustomer(customer);
    if (isMobile) {
      setShowChatList(false);
    }

    // Mark all messages from this customer as read
    const chatId = getChatId(customer.customerId, currentUserId);
    const messagesRef = collection(db, "chats", chatId, "messages");
    const unreadSnap = await getDocs(
      query(messagesRef, where("read", "==", false), where("senderId", "==", customer.customerId))
    );

    const batch = writeBatch(db);
    unreadSnap.forEach((docSnap) => {
      batch.update(docSnap.ref, { read: true });
    });
    await batch.commit();

    // Set unreadCount to 0 in local state immediately for UX
    setCustomers((prev) =>
      prev.map((c) =>
        c.customerId === customer.customerId ? { ...c, unreadCount: 0 } : c
      )
    );
  }, [isMobile, currentUserId]);

  // Handle back button - use useCallback
  const handleBack = useCallback(() => {
    if (isMobile) {
      setShowChatList(true);
      setSelectedCustomer(null);
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
      <div className="bg-[#ff00c8] text-white p-4 flex items-center justify-between">
        <h1 className="text-xl font-medium">Udbyder beskeder</h1>
        <MoreVertical className="h-5 w-5" />
      </div>
      
      {/* Chat List */}
      <ScrollArea className="flex-1">
        {customers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-4">💼</div>
              <p className="text-lg font-medium mb-2">Ingen kundebeskeder</p>
              <p className="text-sm">Kunder vises her, når de sender dig en besked</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {customers.map((customer) => (
              <div
                key={customer.customerId}
                className={`p-4 hover:bg-blue-50 cursor-pointer transition-colors relative ${
                  selectedCustomer?.customerId === customer.customerId ? 'bg-blue-50 border-r-4 border-blue-500' : ''
                }`}
                onClick={() => handleCustomerSelect(customer)}
              >
                <div className="flex items-center space-x-3">
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-[#ff00c8] rounded-full flex items-center justify-center text-white font-medium relative">
                    <User className="h-6 w-6" />
                    {customer.unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {customer.unreadCount}
                      </div>
                    )}
                  </div>
                  
                  {/* Chat Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900 truncate flex justify-between items-center">
                        {customerNames[customer.customerId] || "Loading..."}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {formatTime(customer.lastMessageTime)}
                      </span>
                    </div>
                    {customer.lastMessage && (
                      <p className="text-sm text-gray-600 truncate mt-1">
                        {customer.lastMessage}
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
  ), [customers, selectedCustomer, customerNames, formatTime, handleCustomerSelect]);

  // Chat Window Component - memoize to prevent unnecessary re-renders
  const ChatWindow = useMemo(() => (
    <div className="h-full bg-white flex flex-col">
      {/* Chat Header */}
      <div className="bg-[#ff00c8] text-white p-4 flex items-center space-x-3 shadow-md">
        {isMobile && (
          <Button
            variant="ghost"
            size="sm"
            className="text-white  p-1"
            onClick={handleBack}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        
        <div className="w-10 h-10 bg-[#b47aa8] rounded-full flex items-center justify-center">
          <User className="h-5 w-5" />
        </div>
        
        <div className="flex-1">
          <h2 className="font-medium">
            {customerNames[selectedCustomer?.customerId] || "Loading..."}
          </h2>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 bg-gray-50 bg-opacity-50 relative overflow-hidden">
        {/* Background pattern */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />
        
        <ScrollArea className="h-full relative z-10">
          <div className="p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                  <User className="h-10 w-10 text-gray-400" />
                </div>
                <p className="text-center font-medium mb-2">
                  {customerNames[selectedCustomer?.customerId] || "Customer"}
                </p>
                <p className="text-sm text-center">
                  This customer hasn't sent any messages yet
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
                        : "bg-white text-gray-900 rounded-bl-sm shadow-sm border"
                    }`}
                  >
                    <p className="text-sm leading-relaxed break-words">{msg.text}</p>
                    <div className={`flex items-center justify-end mt-1 space-x-1`}>
                      <span className={`text-xs ${
                        msg.senderId === currentUserId ? "text-blue-100" : "text-gray-500"
                      }`}>
                        {msg.timestamp?.toDate()?.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {msg.senderId === currentUserId && (
                        <div className="text-blue-100">
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
              placeholder="Type your response..."
              value={newMsg}
              onChange={(e) => setNewMsg(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={isLoading}
              className="w-full rounded-full border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 py-3 px-4"
            />
          </div>
          <Button
            onClick={sendMessage}
            disabled={isLoading || !newMsg.trim()}
            className="bg-blue-500 hover:bg-blue-600 rounded-full h-12 w-12 p-0"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  ), [selectedCustomer, customerNames, messages, newMsg, isLoading, currentUserId, isMobile, handleBack, handleKeyPress, sendMessage]);

  // Welcome Screen - memoize
  const WelcomeScreen = useMemo(() => (
    <div className="h-full bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-8">
        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-12 h-12 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3.75-2.906z"/>
          </svg>
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-3">Udbyder Dashboard</h2>
        <p className="text-gray-600 mb-6">
          Administrer dine kundesamtaler og yd fremragende service. Vælg en kundesamtale for at begynde at svare.
        </p>
        <div className="bg-blue-50 rounded-lg p-4 text-left">
          <h3 className="font-semibold text-blue-900 mb-2">Tips til god kundeservice:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Svar hurtigt på kundehenvendelser</li>
            <li>• Vær professionel og høflig</li>
            <li>• Giv klare og nyttige oplysninger</li>
            <li>• Opfølgning på kundehenvendelser</li>
          </ul>
        </div>
      </div>
    </div>
  ), []);

  return (
    <div className="h-screen bg-gray-100 flex overflow-hidden">
      {/* Desktop Layout */}
      {!isMobile && (
        <>
          <div className="w-80 border-r border-gray-200">
            {ChatList}
          </div>
          <div className="flex-1">
            {selectedCustomer ? ChatWindow : WelcomeScreen}
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
            selectedCustomer && (
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