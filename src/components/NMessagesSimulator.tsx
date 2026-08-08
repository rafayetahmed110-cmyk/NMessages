import React, { useState } from 'react';
import {
  MessageSquare,
  Search,
  Filter,
  MoreVertical,
  Plus,
  Send,
  CheckCheck,
  ArrowLeft,
  ShieldAlert,
  Users,
  Settings,
  ShieldCheck,
  Trash2,
  Phone,
  Paperclip,
  Smile,
  Bell,
  Globe,
  Sparkles,
  Smartphone,
  RefreshCw,
  SlidersHorizontal,
  Check,
  RotateCcw
} from 'lucide-react';

interface NMessagesSimulatorProps {
  lang: 'bn' | 'en';
  onLangChange: (lang: 'bn' | 'en') => void;
}

interface Conversation {
  threadId: number;
  contactName: string;
  address: string;
  snippet: string;
  timestamp: string;
  unreadCount: number;
  isRead: boolean;
  isPinned: boolean;
  category: 'All' | 'Unread' | 'Read' | 'Pinned';
  avatarColor: string;
}

interface Message {
  id: number;
  body: string;
  timestamp: string;
  isSentByMe: boolean;
  status: 'DELIVERED' | 'SENT' | 'PENDING';
}

const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    threadId: 1,
    contactName: 'Alex Rivers',
    address: '+1 (555) 019-2834',
    snippet: 'Hey! Did you get the APK build file for NMessages?',
    timestamp: '10:42 AM',
    unreadCount: 2,
    isRead: false,
    isPinned: true,
    category: 'Unread',
    avatarColor: 'bg-indigo-600',
  },
  {
    threadId: 2,
    contactName: 'Sarah Jenkins',
    address: '+1 (555) 014-9921',
    snippet: 'The dark theme UI looks amazingly sleek and modern!',
    timestamp: '09:15 AM',
    unreadCount: 0,
    isRead: true,
    isPinned: true,
    category: 'Read',
    avatarColor: 'bg-emerald-600',
  },
  {
    threadId: 3,
    contactName: 'Grameenphone / Carrier',
    address: 'GP-INFO',
    snippet: 'Your remaining balance is 450 MB valid till 12 Aug.',
    timestamp: 'Yesterday',
    unreadCount: 1,
    isRead: false,
    isPinned: false,
    category: 'Unread',
    avatarColor: 'bg-blue-600',
  },
  {
    threadId: 4,
    contactName: 'David Miller',
    address: '+1 (555) 018-4432',
    snippet: 'Thanks for making it the default SMS app on my Pixel 8.',
    timestamp: 'Aug 06',
    unreadCount: 0,
    isRead: true,
    isPinned: false,
    category: 'Read',
    avatarColor: 'bg-purple-600',
  },
];

const INITIAL_MESSAGES: Record<number, Message[]> = {
  1: [
    { id: 101, body: 'Hi there! Testing out NMessages on Android.', timestamp: '10:38 AM', isSentByMe: false, status: 'DELIVERED' },
    { id: 102, body: 'Working smooth! The Kotlin SMS receiver works directly on Android.', timestamp: '10:40 AM', isSentByMe: true, status: 'DELIVERED' },
    { id: 103, body: 'Hey! Did you get the APK build file for NMessages?', timestamp: '10:42 AM', isSentByMe: false, status: 'DELIVERED' },
  ],
  2: [
    { id: 201, body: 'Love the Material Design 3 layout!', timestamp: '09:10 AM', isSentByMe: false, status: 'DELIVERED' },
    { id: 202, body: 'The dark theme UI looks amazingly sleek and modern!', timestamp: '09:15 AM', isSentByMe: false, status: 'DELIVERED' },
  ],
};

export const NMessagesSimulator: React.FC<NMessagesSimulatorProps> = ({ lang, onLangChange }) => {
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [messages, setMessages] = useState<Record<number, Message[]>>(INITIAL_MESSAGES);
  const [selectedThread, setSelectedThread] = useState<Conversation | null>(null);
  const [currentTab, setCurrentTab] = useState<'All' | 'Unread' | 'Read' | 'Pinned'>('All');
  const [bottomNav, setBottomNav] = useState<'conversations' | 'contacts'>('conversations');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isDefaultSms, setIsDefaultSms] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [screen, setScreen] = useState<'home' | 'conversation' | 'settings' | 'new_message' | 'blocked_numbers'>('home');
  const [simulatedSender, setSimulatedSender] = useState('+1 (555) 019-2834');
  const [simulatedText, setSimulatedText] = useState('New incoming SMS test from Android device!');
  const [blockedNumbers, setBlockedNumbers] = useState<string[]>(['+1 (555) 099-7711']);
  const [newBlockedInput, setNewBlockedInput] = useState('');
  const [suppressedNotification, setSuppressedNotification] = useState<string | null>(null);

  const toggleBlockNumber = (num: String) => {
    const target = num.toString();
    if (blockedNumbers.includes(target)) {
      setBlockedNumbers(blockedNumbers.filter((n) => n !== target));
    } else {
      setBlockedNumbers([...blockedNumbers, target]);
    }
  };

  const addCustomBlockedNumber = () => {
    if (!newBlockedInput.trim()) return;
    if (!blockedNumbers.includes(newBlockedInput.trim())) {
      setBlockedNumbers([...blockedNumbers, newBlockedInput.trim()]);
    }
    setNewBlockedInput('');
  };

  // Filter conversations
  const filteredConversations = conversations.filter((c) => {
    const matchesSearch =
      c.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.snippet.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.address.includes(searchQuery);

    if (!matchesSearch) return false;

    if (currentTab === 'Unread') return !c.isRead;
    if (currentTab === 'Read') return c.isRead;
    if (currentTab === 'Pinned') return c.isPinned;
    return true;
  });

  const handleSendMessage = () => {
    if (!inputMessage.trim() || !selectedThread) return;

    const newMsg: Message = {
      id: Date.now(),
      body: inputMessage.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSentByMe: true,
      status: 'DELIVERED',
    };

    setMessages((prev) => ({
      ...prev,
      [selectedThread.threadId]: [...(prev[selectedThread.threadId] || []), newMsg],
    }));

    setConversations((prev) =>
      prev.map((c) =>
        c.threadId === selectedThread.threadId
          ? { ...c, snippet: inputMessage.trim(), timestamp: 'Just now' }
          : c
      )
    );

    setInputMessage('');
  };

  const triggerSimulatedIncomingSms = () => {
    if (!simulatedText.trim()) return;

    // Check if sender is blocked
    const cleanSender = simulatedSender.trim();
    if (blockedNumbers.includes(cleanSender)) {
      setSuppressedNotification(`Blocked SMS from ${cleanSender} was suppressed by NMessages service.`);
      setTimeout(() => setSuppressedNotification(null), 4000);
      return;
    }

    const existing = conversations.find((c) => c.address === cleanSender);
    const threadId = existing ? existing.threadId : Date.now();

    const newMsg: Message = {
      id: Date.now(),
      body: simulatedText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSentByMe: false,
      status: 'DELIVERED',
    };

    setMessages((prev) => ({
      ...prev,
      [threadId]: [...(prev[threadId] || []), newMsg],
    }));

    if (existing) {
      setConversations((prev) =>
        prev.map((c) =>
          c.threadId === threadId
            ? { ...c, snippet: simulatedText, timestamp: 'Just now', unreadCount: c.unreadCount + 1, isRead: false }
            : c
        )
      );
    } else {
      const newConv: Conversation = {
        threadId,
        contactName: simulatedSender,
        address: simulatedSender,
        snippet: simulatedText,
        timestamp: 'Just now',
        unreadCount: 1,
        isRead: false,
        isPinned: false,
        category: 'Unread',
        avatarColor: 'bg-rose-600',
      };
      setConversations((prev) => [newConv, ...prev]);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left Control Panel / Simulator Actions */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-600/20 text-indigo-400 rounded-2xl border border-indigo-500/30">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  NMessages <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">v1.0.0</span>
                </h2>
                <p className="text-xs text-slate-400">{lang === 'bn' ? 'অ্যান্ড্রয়েড লাইভ অ্যাপ সিমুলেটর' : 'Android Live App Simulator'}</p>
              </div>
            </div>

            <button
              onClick={() => onLangChange(lang === 'bn' ? 'en' : 'bn')}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-xl flex items-center gap-1.5 transition"
            >
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              {lang === 'bn' ? 'বাংলা' : 'English'}
            </button>
          </div>

          {/* Default SMS App Role Toggle */}
          <div className={`p-4 rounded-2xl border transition ${
            isDefaultSms
              ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
              : 'bg-indigo-950/40 border-indigo-500/30 text-indigo-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 font-bold text-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{lang === 'bn' ? 'ডিফল্ট এসএমএস অ্যাপ স্ট্যাটাস' : 'Default SMS App Status'}</span>
              </div>
              <button
                onClick={() => setIsDefaultSms(!isDefaultSms)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                  isDefaultSms
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-indigo-600 text-white hover:bg-indigo-500'
                }`}
              >
                {isDefaultSms ? (lang === 'bn' ? 'সক্রিয় (Default)' : 'Active (Default)') : (lang === 'bn' ? 'ডিফল্ট করুন' : 'Grant Default Role')}
              </button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {isDefaultSms
                ? (lang === 'bn' ? 'অ্যান্ড্রয়েড সিস্টেম রোল অ্যাক্টিভ। ইনকামিং ও আউটগোয়িং এসএমএস সরাসরি ডিভাইসে কাজ করবে।' : 'Android system SMS role granted. Complete SMS permissions and intent handlers enabled.')
                : (lang === 'bn' ? 'অ্যান্ড্রয়েড সিস্টেমে NMessages কে ডিফল্ট এসএমএস অ্যাপ করার টেস্ট করতে বাটন ক্লিক করুন।' : 'Simulate granting Android system default SMS role requirement.')}
            </p>
          </div>

          {/* Incoming SMS Test Trigger */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              {lang === 'bn' ? 'ইনকামিং এসএমএস টেস্ট সিমুলেটর' : 'Simulate Incoming SMS Broadcast'}
            </h3>
            
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Sender Phone (e.g. +1 555-019-2834)"
                value={simulatedSender}
                onChange={(e) => setSimulatedSender(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
              <textarea
                placeholder="Message content..."
                value={simulatedText}
                onChange={(e) => setSimulatedText(e.target.value)}
                rows={2}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
              />
              <button
                onClick={triggerSimulatedIncomingSms}
                className="w-full py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-lg shadow-indigo-600/20"
              >
                <Bell className="w-3.5 h-3.5" />
                {lang === 'bn' ? 'ইনকামিং এসএমএস তৈরি করুন' : 'Broadcast Incoming SMS'}
              </button>
            </div>
          </div>

          {/* Suppressed SMS Alert Banner */}
          {suppressedNotification && (
            <div className="bg-red-950/80 border border-red-500/50 text-red-200 p-3 rounded-2xl text-xs flex items-center gap-2 animate-bounce">
              <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
              <span>{suppressedNotification}</span>
            </div>
          )}

          {/* Blocked Numbers Manager */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              {lang === 'bn' ? 'ব্লকড নম্বর তালিকা' : 'Blocked Phone Numbers'}
            </h3>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter number to block..."
                value={newBlockedInput}
                onChange={(e) => setNewBlockedInput(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-red-500"
              />
              <button
                onClick={addCustomBlockedNumber}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition"
              >
                Block
              </button>
            </div>

            <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
              {blockedNumbers.length === 0 ? (
                <p className="text-[11px] text-slate-500 italic">No numbers currently blocked.</p>
              ) : (
                blockedNumbers.map((num) => (
                  <div key={num} className="flex items-center justify-between bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-800/80 text-xs">
                    <span className="text-slate-300 font-mono text-[11px]">{num}</span>
                    <button
                      onClick={() => toggleBlockNumber(num)}
                      className="text-[10px] text-emerald-400 hover:underline font-bold"
                    >
                      Unblock
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Key Android Features Summary */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs text-slate-300">
            <div className="font-bold text-white mb-1">{lang === 'bn' ? 'অ্যান্ড্রয়েড নেটিভ ফিচার্স' : 'Native Android Capabilities'}</div>
            <div className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> <span>RoleManager / Telephony Default Handler</span></div>
            <div className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> <span>ContentProvider reading from content://sms</span></div>
            <div className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> <span>BroadcastReceiver for Telephony.SMS_RECEIVED</span></div>
            <div className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> <span>Kotlin MethodChannels & EventChannels</span></div>
            <div className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> <span>Dual-SIM SubscriptionManager detection</span></div>
          </div>
        </div>
      </div>

      {/* Right Pixel Phone Screen Mockup */}
      <div className="lg:col-span-7 flex justify-center">
        <div className="w-full max-w-[380px] bg-slate-950 rounded-[44px] border-[10px] border-slate-800 shadow-2xl overflow-hidden flex flex-col h-[720px] relative font-sans">
          
          {/* Phone Top Notch & Status Bar */}
          <div className="bg-slate-900 px-6 pt-3 pb-2 flex items-center justify-between text-[11px] text-slate-400 font-mono border-b border-slate-800/80">
            <span>09:41</span>
            <div className="w-20 h-4 bg-slate-950 rounded-full flex items-center justify-center mx-auto">
              <div className="w-3 h-3 rounded-full bg-slate-800"></div>
            </div>
            <div className="flex items-center gap-1.5">
              <span>5G</span>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
            </div>
          </div>

          {/* PHONE CONTENT AREA */}
          <div className="flex-1 bg-slate-900 flex flex-col overflow-hidden text-slate-100">
            
            {/* SCREEN 1: HOME MESSAGES LIST */}
            {screen === 'home' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <div className="p-4 bg-slate-900 border-b border-slate-800/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <h1 className="text-xl font-bold text-white tracking-tight">
                      {lang === 'bn' ? 'মেসেজ' : 'Messages'}
                    </h1>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setIsSearching(!isSearching)}
                        className="p-2 text-slate-400 hover:text-white rounded-full transition"
                      >
                        <Search className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setScreen('settings')}
                        className="p-2 text-slate-400 hover:text-white rounded-full transition"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Search Bar */}
                  {isSearching && (
                    <input
                      type="text"
                      placeholder={lang === 'bn' ? 'মেসেজ খুঁজুন...' : 'Search messages...'}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  )}

                  {/* Default SMS Banner */}
                  {!isDefaultSms && (
                    <div className="bg-indigo-950/80 border border-indigo-500/40 p-2.5 rounded-xl flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-indigo-300 shrink-0" />
                        <span className="text-[11px] text-indigo-200">
                          {lang === 'bn' ? 'ডিফল্ট এসএমএস অ্যাপ সেট করুন' : 'Set as default SMS app'}
                        </span>
                      </div>
                      <button
                        onClick={() => setIsDefaultSms(true)}
                        className="px-2 py-1 bg-indigo-600 text-white font-bold rounded-lg text-[10px]"
                      >
                        Set
                      </button>
                    </div>
                  )}

                  {/* Filter Tabs */}
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
                    {(['All', 'Unread', 'Read', 'Pinned'] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setCurrentTab(tab)}
                        className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition ${
                          currentTab === tab
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-950 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {tab === 'All' ? (lang === 'bn' ? 'সব' : 'All') :
                         tab === 'Unread' ? (lang === 'bn' ? 'অপঠিত' : 'Unread') :
                         tab === 'Read' ? (lang === 'bn' ? 'পঠিত' : 'Read') : (lang === 'bn' ? 'পিন করা' : 'Pinned')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Conversation List / Contacts tab */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {bottomNav === 'conversations' ? (
                    filteredConversations.length === 0 ? (
                      <div className="text-center py-12 text-slate-500 text-xs">
                        {lang === 'bn' ? 'কোন কথোপকথন পাওয়া যায়নি' : 'No conversations found'}
                      </div>
                    ) : (
                      filteredConversations.map((conv) => (
                        <div
                          key={conv.threadId}
                          onClick={() => {
                            setSelectedThread(conv);
                            // Mark read
                            setConversations((prev) =>
                              prev.map((c) =>
                                c.threadId === conv.threadId ? { ...c, isRead: true, unreadCount: 0 } : c
                              )
                            );
                            setScreen('conversation');
                          }}
                          className={`p-3 rounded-2xl bg-slate-950 border border-slate-800/80 hover:border-indigo-500/40 cursor-pointer transition flex items-center gap-3 relative ${
                            conv.unreadCount > 0 ? 'border-indigo-500/50 bg-indigo-950/10' : ''
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-full ${conv.avatarColor} text-white font-bold flex items-center justify-center text-sm shrink-0 shadow`}>
                            {conv.contactName[0]}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-0.5">
                              <h4 className="text-xs font-bold text-white truncate">{conv.contactName}</h4>
                              <span className="text-[10px] text-slate-400">{conv.timestamp}</span>
                            </div>
                            <p className="text-[11px] text-slate-400 truncate">{conv.snippet}</p>
                          </div>

                          {conv.unreadCount > 0 && (
                            <span className="w-5 h-5 bg-indigo-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center shrink-0">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                      ))
                    )
                  ) : (
                    // Contacts Screen
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold text-slate-400 px-1 mb-2">Device Contacts</h3>
                      {[
                        { name: 'Alex Rivers', phone: '+1 (555) 019-2834' },
                        { name: 'David Miller', phone: '+1 (555) 018-4432' },
                        { name: 'Sarah Jenkins', phone: '+1 (555) 014-9921' },
                        { name: 'John Doe', phone: '+1 (555) 088-1122' },
                      ].map((contact, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            const match = conversations.find((c) => c.contactName === contact.name);
                            if (match) setSelectedThread(match);
                            else {
                              const newConv: Conversation = {
                                threadId: Date.now(),
                                contactName: contact.name,
                                address: contact.phone,
                                snippet: 'Start a conversation...',
                                timestamp: 'Now',
                                unreadCount: 0,
                                isRead: true,
                                isPinned: false,
                                category: 'All',
                                avatarColor: 'bg-indigo-600',
                              };
                              setConversations((prev) => [newConv, ...prev]);
                              setSelectedThread(newConv);
                            }
                            setScreen('conversation');
                          }}
                          className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between hover:border-indigo-500/40 cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-slate-800 text-indigo-400 font-bold flex items-center justify-center text-xs">
                              {contact.name[0]}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-white">{contact.name}</div>
                              <div className="text-[10px] text-slate-400">{contact.phone}</div>
                            </div>
                          </div>
                          <MessageSquare className="w-4 h-4 text-indigo-400" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Floating New Conversation Button */}
                <button
                  onClick={() => setScreen('new_message')}
                  className="absolute bottom-16 right-4 p-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl shadow-xl shadow-indigo-600/30 flex items-center gap-2 text-xs font-bold transition"
                >
                  <Plus className="w-5 h-5" />
                </button>

                {/* Bottom Navigation */}
                <div className="bg-slate-950 border-t border-slate-800 py-2.5 px-6 flex items-center justify-around">
                  <button
                    onClick={() => setBottomNav('conversations')}
                    className={`flex flex-col items-center gap-1 text-[10px] font-bold transition ${
                      bottomNav === 'conversations' ? 'text-indigo-400' : 'text-slate-500'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>{lang === 'bn' ? 'মেসেজ' : 'Conversations'}</span>
                  </button>
                  <button
                    onClick={() => setBottomNav('contacts')}
                    className={`flex flex-col items-center gap-1 text-[10px] font-bold transition ${
                      bottomNav === 'contacts' ? 'text-indigo-400' : 'text-slate-500'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>{lang === 'bn' ? 'পরিচিতি' : 'Contacts'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* SCREEN 2: CONVERSATION DETAIL */}
            {screen === 'conversation' && selectedThread && (
              <div className="flex-1 flex flex-col overflow-hidden bg-slate-950">
                {/* App Bar */}
                <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <button onClick={() => setScreen('home')} className="p-1 text-slate-400 hover:text-white">
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                      {selectedThread.contactName[0]}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xs font-bold text-white truncate">{selectedThread.contactName}</h3>
                      <p className="text-[10px] text-slate-400 truncate">{selectedThread.address}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleBlockNumber(selectedThread.address)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition ${
                        blockedNumbers.includes(selectedThread.address)
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                          : 'bg-red-950/80 text-red-400 border border-red-500/40 hover:bg-red-900'
                      }`}
                      title="Block / Unblock this sender"
                    >
                      <ShieldAlert className="w-3 h-3" />
                      <span>{blockedNumbers.includes(selectedThread.address) ? 'Unblock' : 'Block'}</span>
                    </button>
                    <button className="p-1.5 text-indigo-400 hover:text-indigo-300">
                      <Phone className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Blocked Warning Banner */}
                {blockedNumbers.includes(selectedThread.address) && (
                  <div className="bg-red-950/60 border-b border-red-500/30 px-3 py-1.5 text-[11px] text-red-200 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                      Contact is blocked. Messages suppressed.
                    </span>
                    <button
                      onClick={() => toggleBlockNumber(selectedThread.address)}
                      className="text-indigo-300 font-bold hover:underline"
                    >
                      Unblock
                    </button>
                  </div>
                )}

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {(messages[selectedThread.threadId] || []).map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${msg.isSentByMe ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed ${
                          msg.isSentByMe
                            ? 'bg-indigo-600 text-white rounded-br-none'
                            : 'bg-slate-800 text-slate-200 rounded-bl-none'
                        }`}
                      >
                        <p>{msg.body}</p>
                        <div
                          className={`mt-1 text-[9px] flex items-center justify-end gap-1 ${
                            msg.isSentByMe ? 'text-indigo-200' : 'text-slate-400'
                          }`}
                        >
                          <span>{msg.timestamp}</span>
                          {msg.isSentByMe && <CheckCheck className="w-3 h-3 text-indigo-200" />}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input Bar */}
                <div className="p-2.5 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
                  <button className="text-slate-400 p-1 hover:text-white">
                    <Smile className="w-4 h-4" />
                  </button>
                  <input
                    type="text"
                    placeholder={lang === 'bn' ? 'মেসেজ লিখুন...' : 'Type a message...'}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* SCREEN 3: SETTINGS */}
            {screen === 'settings' && (
              <div className="flex-1 flex flex-col overflow-y-auto bg-slate-950 p-4 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                  <button onClick={() => setScreen('home')} className="p-1 text-slate-400 hover:text-white">
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <h2 className="text-base font-bold text-white">{lang === 'bn' ? 'সেটিংস' : 'Settings'}</h2>
                </div>

                <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-indigo-400">{lang === 'bn' ? 'ভাষা নির্ধারণ' : 'Language Selection'}</div>
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span>{lang === 'bn' ? 'বাংলা' : 'English'}</span>
                    <button
                      onClick={() => onLangChange(lang === 'bn' ? 'en' : 'bn')}
                      className="px-2.5 py-1 bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 rounded-lg font-bold"
                    >
                      Change
                    </button>
                  </div>
                </div>

                <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-emerald-400">Default SMS Role</div>
                  <p className="text-[11px] text-slate-400">
                    {isDefaultSms ? 'Active as system SMS provider.' : 'Not active.'}
                  </p>
                  <button
                    onClick={() => setIsDefaultSms(!isDefaultSms)}
                    className="w-full py-1.5 bg-slate-800 text-xs font-bold text-white rounded-xl"
                  >
                    Toggle Default Status
                  </button>
                </div>
              </div>
            )}

            {/* SCREEN 4: NEW MESSAGE */}
            {screen === 'new_message' && (
              <div className="flex-1 flex flex-col bg-slate-950 p-4 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                  <button onClick={() => setScreen('home')} className="p-1 text-slate-400 hover:text-white">
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <h2 className="text-base font-bold text-white">{lang === 'bn' ? 'নতুন মেসেজ' : 'New Conversation'}</h2>
                </div>

                <input
                  type="text"
                  placeholder="Enter phone or recipient name..."
                  value={simulatedSender}
                  onChange={(e) => setSimulatedSender(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />

                <button
                  onClick={() => {
                    const existing = conversations.find((c) => c.address === simulatedSender);
                    if (existing) {
                      setSelectedThread(existing);
                    } else {
                      const newConv: Conversation = {
                        threadId: Date.now(),
                        contactName: simulatedSender,
                        address: simulatedSender,
                        snippet: 'New conversation started',
                        timestamp: 'Just now',
                        unreadCount: 0,
                        isRead: true,
                        isPinned: false,
                        category: 'All',
                        avatarColor: 'bg-indigo-600',
                      };
                      setConversations((prev) => [newConv, ...prev]);
                      setSelectedThread(newConv);
                    }
                    setScreen('conversation');
                  }}
                  className="w-full py-2 bg-indigo-600 text-white font-bold rounded-xl text-xs"
                >
                  Start Conversation
                </button>
              </div>
            )}

          </div>

          {/* Bottom Phone Chin */}
          <div className="bg-slate-950 py-2 flex justify-center">
            <div className="w-28 h-1 bg-slate-800 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
