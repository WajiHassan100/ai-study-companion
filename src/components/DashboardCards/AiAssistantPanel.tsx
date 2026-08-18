import { useState, useRef, useEffect } from "react";
import {
  Send,
  Sparkles,
  Bot,
  User as UserIcon,
  BookOpen,
  Loader2,
  Paperclip,
  X,
  FileText,
  MessageSquare,
  History,
  Database,
  RefreshCw,
  AlertCircle,
  Lightbulb,
  CheckCircle2,
  Cpu,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  streamTutorMessage,
  type ChatMessage,
  type TutorChatResponse,
} from "@/lib/api/ai";
import {
  uploadFileObjectToRAG,
  queryRAGDocument,
  executeRAGLearningAction,
  type RAGQueryResponse,
} from "@/lib/api/rag";
import { checkBackendHealth } from "@/lib/api/analytics";

interface RecentChat {
  id: string;
  title: string;
  time: string;
  prompt: string;
}

interface IndexedDoc {
  id: string;
  title: string;
  course: string;
  pages: number;
}

import type { RecentConversation, IndexedDocument } from "@/lib/api/analytics";

interface AiAssistantPanelProps {
  studentId?: string;
  studentLevel?: "beginner" | "intermediate" | "advanced";
  learningStyle?: "visual" | "auditory" | "reading" | "kinesthetic";
  title?: string;
  description?: string;
  suggestions?: string[];
  externalPrompt?: string;
  recentChatsData?: RecentConversation[];
  indexedDocsData?: IndexedDocument[];
}

export function AiAssistantPanel({
  studentId = "demo_student",
  studentLevel = "beginner",
  learningStyle = "visual",
  title = "AI Socratic Assistant",
  description = "Real-time concept explanations, step-by-step math derivations, and document citations.",
  suggestions = [
    "Explain this topic simply",
    "Create practice questions",
    "Summarize my lecture notes",
    "Show a step-by-step example",
  ],
  externalPrompt,
  recentChatsData,
  indexedDocsData,
}: AiAssistantPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [connectionOk, setConnectionOk] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("chat");

  // Document Upload & RAG State
  const [attachedDoc, setAttachedDoc] = useState<{ name: string; content: string; materialId?: string } | null>(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fallback / Initial Recent Chats
  const [recentChats, setRecentChats] = useState<RecentConversation[]>([]);
  const [indexedDocs, setIndexedDocs] = useState<IndexedDocument[]>([]);

  // Update dynamic data from props
  useEffect(() => {
    if (recentChatsData && recentChatsData.length > 0) {
      setRecentChats(recentChatsData);
    } else {
      setRecentChats([
        { id: "1", title: "Photosynthesis: Light Reactions", time: "2h ago", prompt: "Explain the light-dependent reactions of photosynthesis" },
        { id: "2", title: "Partial Derivatives & Gradients", time: "Yesterday", prompt: "How do partial derivatives work geometrically?" },
        { id: "3", title: "Newton's Laws & Friction", time: "3d ago", prompt: "Explain static vs kinetic friction on an inclined plane" },
      ]);
    }

    if (indexedDocsData && indexedDocsData.length > 0) {
      setIndexedDocs(indexedDocsData);
    } else {
      setIndexedDocs([
        { id: "d1", title: "BIOL101_Lecture_5_Cell_Energy.pdf", course: "BIOL 101", pages: 42 },
        { id: "d2", title: "MATH201_Chapter8_Multivariable_Calculus.pdf", course: "MATH 201", pages: 28 },
        { id: "d3", title: "PHYS102_Lab_Manual_Newtonian_Mechanics.pdf", course: "PHYS 102", pages: 16 },
        { id: "d4", title: "CS101_Asymptotic_Complexity_Guide.pdf", course: "CS 101", pages: 12 },
      ]);
    }
  }, [recentChatsData, indexedDocsData]);

  // Check Backend Connectivity on mount
  useEffect(() => {
    let mounted = true;
    checkBackendHealth()
      .then((isHealthy: boolean) => {
        if (mounted) setConnectionOk(isHealthy);
      })
      .catch(() => {
        if (mounted) setConnectionOk(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Handle external prompts triggered from other cards
  useEffect(() => {
    if (externalPrompt && externalPrompt.trim()) {
      handleSend(externalPrompt);
      setActiveTab("chat");
    }
  }, [externalPrompt]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, 80);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingDoc(true);
    setError(null);

    try {
      const res = await uploadFileObjectToRAG("general_study", file);
      setAttachedDoc({
        name: file.name,
        content: file.name,
        materialId: res.material_id,
      });
      setConnectionOk(true);
      setActiveTab("chat");
    } catch (err: any) {
      console.error("Failed to upload document for RAG:", err);
      setConnectionOk(false);
      setError("Failed to index document for RAG AI.");
    } finally {
      setUploadingDoc(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSend = async (customMessage?: string) => {
    const textToSend = customMessage || input;
    if (!textToSend.trim() || loading) return;

    const userMsgId = Date.now().toString();
    const newStudentMsg: ChatMessage = {
      id: userMsgId,
      sender: "student",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, newStudentMsg]);
    if (!customMessage) setInput("");
    setLoading(true);
    setError(null);

    // Save to recent chats list
    const newRecent: RecentChat = {
      id: `rc_${Date.now()}`,
      title: textToSend.length > 32 ? textToSend.slice(0, 32) + "..." : textToSend,
      time: "Today",
      prompt: textToSend,
    };
    setRecentChats((prev) => [newRecent, ...prev.slice(0, 5)]);

    try {
      if (attachedDoc) {
        const ragRes: RAGQueryResponse = await queryRAGDocument("general_study", textToSend);
        const cleanAnswer = (ragRes.answer || "")
          .replace(/PK[\s\S]*?xml/g, "")
          .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
          .trim();

        const tutorMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: "tutor",
          text: cleanAnswer,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          data: {
            topic: `Citations from ${attachedDoc.name}`,
            encouragement: "Information retrieved from your uploaded document.",
            citations: ragRes.cited_sources || [],
          } as any,
        };

        setMessages((prev) => [...prev, tutorMsg]);
        setConnectionOk(true);
      } else {
        const tutorMsgId = (Date.now() + 1).toString();
        setMessages((prev) => [
          ...prev,
          {
            id: tutorMsgId,
            sender: "tutor",
            text: "",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            data: { topic: "Personal AI Tutor" } as any,
          },
        ]);

        await streamTutorMessage(
          {
            student_id: studentId,
            message: textToSend,
            session_id: sessionId,
            course_id: "biol_101",
            student_level: studentLevel,
            learning_style: learningStyle,
          },
          {
            onToken: (tokenText) =>
              setMessages((prev) =>
                prev.map((m) => (m.id === tutorMsgId ? { ...m, text: m.text + tokenText } : m)),
              ),
            onComplete: (data) => {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === tutorMsgId
                    ? {
                        ...m,
                        text: data.answer || m.text,
                        data: {
                          topic: data.topic,
                          encouragement: data.encouragement,
                          recommendations: data.recommendations,
                        } as any,
                      }
                    : m,
                ),
              );
              if (data.session_id) setSessionId(data.session_id);
              setConnectionOk(true);
            },
            onError: (streamErr) => {
              setConnectionOk(false);
              setError(streamErr.message || "Failed to reach AI Agent backend. Please check connection.");
            },
          },
        );
      }
    } catch (err: any) {
      console.error("AI Assistant call failed:", err);
      setConnectionOk(false);
      setError(err.message || "Failed to reach AI Agent backend. Please check connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleLearningAction = async (action: "mcqs" | "summary" | "explain_simply") => {
    setLoading(true);
    setError(null);
    const actionLabel = action === "mcqs" ? "⚡ Create MCQs" : action === "summary" ? "📝 Summarize Lecture" : "💡 Explain Simply";
    
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "student",
      text: `${actionLabel} from active course material`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const ragRes: RAGQueryResponse = await executeRAGLearningAction(
        "biol_101",
        attachedDoc?.name || "BIOL101_Cell_Biology_Notes.pdf",
        action
      );

      const tutorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "tutor",
        text: ragRes.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        data: {
          topic: `RAG Learning Action: ${actionLabel}`,
          encouragement: `Grounded in ${attachedDoc?.name || "BIOL101_Cell_Biology_Notes.pdf"}`,
          citations: ragRes.cited_sources || [],
        } as any,
      };
      setMessages((prev) => [...prev, tutorMsg]);
      setConnectionOk(true);
    } catch (err: any) {
      console.error("Learning Action error:", err);
      setConnectionOk(false);
      setError("Failed to execute RAG Learning Action.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border border-border/80 bg-card shadow-lg rounded-3xl overflow-hidden transition-all">
      {/* ── STYLISH GRADIENT HEADER ── */}
      <CardHeader className="pb-3 border-b border-border/40 bg-linear-to-r from-emerald-500/10 via-sky-500/5 to-indigo-500/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-emerald-600 text-white shadow-xs">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base font-bold font-display text-foreground flex items-center gap-2">
                <span>{title}</span>
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground line-clamp-1">
                {description}
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {connectionOk === false ? (
              <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-[10px] font-bold gap-1 px-2 py-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                Backend Offline
              </Badge>
            ) : (
              <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-bold gap-1 px-2 py-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Agent Online
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 space-y-4 flex flex-col">
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept=".pdf,.txt,.md,.doc,.docx"
          className="hidden"
        />

        {/* Navigation Tabs (Chat, Recent, Documents) */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 p-1 rounded-2xl bg-secondary/80 border border-border/60 h-auto">
            <TabsTrigger value="chat" className="rounded-xl py-1.5 text-xs font-bold gap-1.5 data-[state=active]:bg-card data-[state=active]:shadow-xs">
              <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
              <span>Chat</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="rounded-xl py-1.5 text-xs font-bold gap-1.5 data-[state=active]:bg-card data-[state=active]:shadow-xs">
              <History className="h-3.5 w-3.5 text-sky-600" />
              <span>Recent</span>
            </TabsTrigger>
            <TabsTrigger value="docs" className="rounded-xl py-1.5 text-xs font-bold gap-1.5 data-[state=active]:bg-card data-[state=active]:shadow-xs">
              <Database className="h-3.5 w-3.5 text-purple-600" />
              <span>Documents</span>
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: LIVE CHAT WINDOW */}
          <TabsContent value="chat" className="mt-4 space-y-3">
            {/* Active Document Attachment Banner */}
            {attachedDoc && (
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 text-xs">
                  <div className="flex items-center gap-2 font-bold truncate">
                    <FileText className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span className="truncate">{attachedDoc.name}</span>
                    <Badge className="bg-emerald-700 text-white text-[10px]">RAG Indexed ✓</Badge>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 text-emerald-700 hover:text-emerald-900"
                    onClick={() => setAttachedDoc(null)}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {/* 1-Click RAG Learning Action Toolbar */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={loading}
                    className="h-7 text-xs gap-1 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 font-bold rounded-xl"
                    onClick={() => handleLearningAction("mcqs")}
                  >
                    ⚡ Create MCQs
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={loading}
                    className="h-7 text-xs gap-1 border-sky-500/40 text-sky-700 dark:text-sky-300 bg-sky-500/10 hover:bg-sky-500/20 font-bold rounded-xl"
                    onClick={() => handleLearningAction("summary")}
                  >
                    📝 Summarize
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={loading}
                    className="h-7 text-xs gap-1 border-amber-500/40 text-amber-700 dark:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 font-bold rounded-xl"
                    onClick={() => handleLearningAction("explain_simply")}
                  >
                    💡 Explain Simply
                  </Button>
                </div>
              </div>
            )}

            {/* Chat History Messages */}
            <div className="max-h-[380px] min-h-[220px] overflow-y-auto overflow-x-hidden space-y-3 pr-1">
              {messages.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground bg-secondary/30 space-y-3">
                  <div className="h-11 w-11 mx-auto rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center border border-emerald-500/20 shadow-xs">
                    <Bot className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-sm text-foreground">AI Socratic Assistant Ready</p>
                    <p className="text-[11px] text-muted-foreground max-w-xs mx-auto">
                      Ask any question, pick a suggested prompt below, or attach lecture notes (📎) for grounded answers.
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-2.5 text-sm ${msg.sender === "student" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.sender === "tutor" && (
                      <div className="h-7 w-7 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/20 shadow-xs">
                        <Bot className="h-4 w-4" />
                      </div>
                    )}

                    <div
                      className={`rounded-2xl px-4 py-3 max-w-[90%] space-y-2 break-words overflow-x-hidden ${
                        msg.sender === "student"
                          ? "bg-linear-to-r from-emerald-700 to-teal-800 text-white font-medium shadow-sm rounded-tr-xs"
                          : "bg-secondary/60 border border-border/80 shadow-xs rounded-tl-xs text-foreground"
                      }`}
                    >
                      {msg.data?.topic && (
                        <div className="flex items-center gap-1.5 pb-1 border-b border-border/40 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                          <BookOpen className="h-3.5 w-3.5" />
                          <span className="truncate">{msg.data.topic}</span>
                        </div>
                      )}

                      <div className="whitespace-pre-wrap leading-relaxed text-xs sm:text-sm break-words">{msg.text}</div>

                      {msg.data?.citations && msg.data.citations.length > 0 && (
                        <div className="mt-2.5 pt-2 border-t border-border/40 space-y-2">
                          <div className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                            <FileText className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                            <span>Official Page Citations:</span>
                          </div>
                          <div className="space-y-1.5">
                            {msg.data.citations?.map((c: any, i: number) => (
                              <div key={i} className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-1">
                                <div className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center justify-between gap-1">
                                  <span className="truncate">{c.material_title}</span>
                                  <Badge className="bg-emerald-800 text-white text-[10px] shrink-0">Page {c.page_number}</Badge>
                                </div>
                                <div className="text-[10px] text-muted-foreground font-semibold">{c.chapter}</div>
                                <p className="text-[11px] text-foreground/90 italic line-clamp-2">"{c.snippet}"</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="text-[10px] opacity-70 text-right mt-1">{msg.timestamp}</div>
                    </div>

                    {msg.sender === "student" && (
                      <div className="h-7 w-7 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-700 dark:text-emerald-300 shrink-0 mt-0.5 border border-emerald-500/30">
                        <UserIcon className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                ))
              )}

              {loading && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/60 border border-border/80 rounded-xl p-3 w-fit">
                  <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                  <span>{attachedDoc ? "Retrieving citations from document..." : "AI Tutor is reasoning & streaming answer..."}</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </TabsContent>

          {/* TAB 2: RECENT CONVERSATIONS */}
          <TabsContent value="history" className="mt-4 space-y-2">
            <div className="p-2.5 rounded-2xl bg-secondary/50 border border-border/60 text-xs font-bold text-foreground flex items-center justify-between">
              <span>Saved AI Conversations</span>
              <span className="text-[11px] text-muted-foreground">{recentChats.length} sessions</span>
            </div>

            <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1">
              {recentChats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => {
                    handleSend(chat.prompt);
                    setActiveTab("chat");
                  }}
                  className="w-full p-3 rounded-2xl bg-card hover:bg-emerald-500/10 border border-border/80 hover:border-emerald-500/40 text-left transition-all space-y-1 group cursor-pointer"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-foreground group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
                    <span className="truncate flex items-center gap-1.5">
                      <MessageSquare className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      {chat.title}
                    </span>
                    <Badge variant="outline" className="text-[10px] shrink-0 font-normal">
                      {chat.time}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-1 italic">
                    "{chat.prompt}"
                  </p>
                </button>
              ))}
            </div>
          </TabsContent>

          {/* TAB 3: INDEXED COURSE DOCUMENTS */}
          <TabsContent value="docs" className="mt-4 space-y-2">
            <div className="p-2.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-xs font-bold text-purple-900 dark:text-purple-200 flex items-center justify-between">
              <span>Course Knowledge Bases</span>
              <Badge className="bg-purple-700 text-white text-[10px]">
                {indexedDocs.length} PDFs Indexed
              </Badge>
            </div>

            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {indexedDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3 rounded-2xl bg-card border border-border/80 flex items-center justify-between gap-2 hover:border-purple-500/40 transition-colors"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <FileText className="h-4 w-4 text-purple-600 shrink-0" />
                    <div className="truncate">
                      <p className="font-bold text-xs text-foreground truncate">{doc.title}</p>
                      <p className="text-[10px] text-muted-foreground">{doc.course} • {doc.pages} pages indexed</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-[11px] font-bold border-purple-500/30 text-purple-700 dark:text-purple-300 hover:bg-purple-500/10 shrink-0 rounded-xl"
                    onClick={() => {
                      setAttachedDoc({ name: doc.title, content: doc.title, materialId: doc.id });
                      setActiveTab("chat");
                    }}
                  >
                    Select
                  </Button>
                </div>
              ))}

              <Button
                variant="outline"
                className="w-full text-xs font-bold gap-1.5 border-dashed border-purple-500/40 text-purple-700 dark:text-purple-300 hover:bg-purple-500/10 rounded-2xl"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip className="h-3.5 w-3.5" />
                <span>Upload & Index New PDF Notes</span>
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* Error notification banner */}
        {error && (
          <div className="rounded-2xl bg-destructive/10 border border-destructive/30 p-3 text-xs text-destructive flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span className="flex-1">{error}</span>
            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => handleSend()}>
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}

        {/* 2. SUGGESTED PROMPTS & INPUT AREA */}
        <div className="space-y-3 pt-2 border-t border-border/40">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <Lightbulb className="h-3 w-3 text-amber-500" />
              Suggested AI Prompts:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {suggestions.map((s) => (
                <button
                  key={s}
                  disabled={loading}
                  onClick={() => {
                    handleSend(s);
                    setActiveTab("chat");
                  }}
                  className="rounded-full border border-emerald-600/30 bg-emerald-500/10 hover:bg-emerald-500/20 hover:border-emerald-500/50 px-3 py-1 text-xs font-bold text-emerald-800 dark:text-emerald-300 transition-colors cursor-pointer disabled:opacity-50"
                >
                  ✨ "{s}"
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 items-end">
            <Button
              type="button"
              variant="outline"
              size="icon"
              title="Attach PDF or Document for RAG AI Chat"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingDoc || loading}
              className="h-10 w-10 shrink-0 text-emerald-700 border-emerald-500/40 hover:bg-emerald-500/10 rounded-2xl"
            >
              {uploadingDoc ? <Loader2 className="h-4 w-4 animate-spin text-emerald-600" /> : <Paperclip className="h-4 w-4" />}
            </Button>

            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                  setActiveTab("chat");
                }
              }}
              disabled={loading}
              placeholder={attachedDoc ? `Ask a question about '${attachedDoc.name}'...` : "Ask your AI Tutor or type a prompt (📎)..."}
              rows={2}
              className="resize-none text-xs sm:text-sm min-h-[50px] bg-secondary/40 border-border/80 rounded-2xl"
            />

            <Button
              onClick={() => {
                handleSend();
                setActiveTab("chat");
              }}
              disabled={loading || !input.trim()}
              size="icon"
              className="h-10 w-10 shrink-0 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-2xl shadow-sm"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
