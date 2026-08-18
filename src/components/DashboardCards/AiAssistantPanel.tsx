import { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Send,
  Loader2,
  Bot,
  User as UserIcon,
  BookOpen,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Paperclip,
  FileText,
  X,
  History,
  Database,
  Lightbulb,
  MessageSquare,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { streamTutorMessage, type ChatMessage } from "@/lib/api/ai";
import { uploadFileObjectToRAG, queryRAGDocument, executeRAGLearningAction, type RAGQueryResponse } from "@/lib/api/rag";

interface RecentChat {
  id: string;
  title: string;
  time: string;
  prompt: string;
}

interface IndexedDoc {
  id: string;
  title: string;
  pages: number;
  course: string;
}

// Recent chats and indexed documents start empty — they are populated by real
// user activity and real backend uploads instead of pre-seeded demo data.
const DEFAULT_RECENT_CHATS: RecentChat[] = [];

const DEFAULT_INDEXED_DOCS: IndexedDoc[] = [];

const DEFAULT_SUGGESTED_PROMPTS = [
  "Explain this topic simply",
  "Create practice questions",
  "Summarize my notes",
  "Help me solve my homework",
];

export function AiAssistantPanel({
  title = "AI Study Assistant",
  description = "Your personal AI tutor, document search assistant, and learning guide.",
  suggestions = DEFAULT_SUGGESTED_PROMPTS,
  studentId,
  studentLevel = "beginner",
  learningStyle = "visual",
  externalPrompt,
  recentChatsData,
  indexedDocsData,
}: {
  title?: string;
  description?: string;
  suggestions?: string[];
  studentId?: string;
  studentLevel?: "beginner" | "intermediate" | "advanced";
  learningStyle?: "visual" | "auditory" | "reading" | "kinesthetic";
  externalPrompt?: string;
  recentChatsData?: RecentChat[];
  indexedDocsData?: IndexedDoc[];
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // null = unknown yet, true = last call succeeded, false = last call failed
  const [connectionOk, setConnectionOk] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState("chat");

  const [recentChats, setRecentChats] = useState<RecentChat[]>(recentChatsData && recentChatsData.length > 0 ? recentChatsData : DEFAULT_RECENT_CHATS);
  const [indexedDocs, setIndexedDocs] = useState<IndexedDoc[]>(indexedDocsData && indexedDocsData.length > 0 ? indexedDocsData : DEFAULT_INDEXED_DOCS);

  useEffect(() => {
    if (recentChatsData && recentChatsData.length > 0) {
      setRecentChats(recentChatsData);
    }
  }, [recentChatsData]);

  useEffect(() => {
    if (indexedDocsData && indexedDocsData.length > 0) {
      setIndexedDocs(indexedDocsData);
    }
  }, [indexedDocsData]);

  // RAG Document Attachment State
  const [attachedDoc, setAttachedDoc] = useState<{ name: string; content: string; materialId: string } | null>(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (externalPrompt) {
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
          .replace(/[^\x20-\x7E\x0A\x0D]/g, " ")
          .trim();

        const tutorMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: "tutor",
          text: cleanAnswer || `Based on '${attachedDoc.name}', here is the explanation for your prompt.`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          data: {
            topic: `RAG Grounded: ${attachedDoc.name}`,
            encouragement: `Answers strictly grounded in '${attachedDoc.name}' (Confidence: ${(ragRes.confidence_score * 100).toFixed(0)}%).`,
            citations: ragRes.cited_sources || [],
          } as any,
        };
        setMessages((prev) => [...prev, tutorMsg]);
      } else {
        // Stream the tutor reply token-by-token via SSE.
        const tutorMsgId = `tutor_${Date.now() + 1}`;
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
    <Card className="border border-emerald-600/30 bg-card shadow-sm flex flex-col h-auto transition-all duration-300">
      {/* Header with Title & Live Connection Status */}
      <CardHeader className="pb-3 border-b border-border/40 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-600 dark:text-emerald-400 animate-pulse" />
            <CardTitle className="text-base font-bold">{title}</CardTitle>
          </div>
          <Badge
            className={`text-white text-[10px] font-bold gap-1 px-2.5 ${
              connectionOk === false ? "bg-rose-700" : "bg-emerald-700"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                connectionOk === false ? "bg-rose-300" : "bg-emerald-300 animate-pulse"
              }`}
            />
            {connectionOk === false ? "Backend Offline" : connectionOk === true ? "AI Active" : "Connecting…"}
          </Badge>
        </div>

        {/* 4. AI Connection Status Badges */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <Badge
            variant="outline"
            className={`text-[10px] font-bold ${
              connectionOk === false
                ? "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20"
                : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20"
            }`}
          >
            {connectionOk === false
              ? "🔴 AI Backend Unavailable"
              : connectionOk === true
                ? "🟢 Connected to AI Backend"
                : "🟡 Connecting…"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-3 flex flex-col">
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept=".pdf,.txt,.md,.doc,.docx"
          className="hidden"
        />

        {/* Navigation Tabs (Chat, Recent Conversations, Course Documents) */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-8 p-0.5 bg-secondary/60">
            <TabsTrigger value="chat" className="text-xs font-semibold gap-1 py-1">
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Chat</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="text-xs font-semibold gap-1 py-1">
              <History className="h-3.5 w-3.5" />
              <span>Recent</span>
            </TabsTrigger>
            <TabsTrigger value="docs" className="text-xs font-semibold gap-1 py-1">
              <Database className="h-3.5 w-3.5" />
              <span>Documents</span>
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: LIVE CHAT WINDOW */}
          <TabsContent value="chat" className="mt-3 space-y-3">
            {/* Active Document Attachment Banner */}
            {attachedDoc && (
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/90 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 text-xs">
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
                    className="h-7 text-xs gap-1 border-emerald-400/50 text-emerald-800 dark:text-emerald-200 bg-emerald-50/50 hover:bg-emerald-100 font-semibold"
                    onClick={() => handleLearningAction("mcqs")}
                  >
                    ⚡ Create MCQs
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={loading}
                    className="h-7 text-xs gap-1 border-blue-400/50 text-blue-800 dark:text-blue-200 bg-blue-50/50 hover:bg-blue-100 font-semibold"
                    onClick={() => handleLearningAction("summary")}
                  >
                    📝 Summarize Lecture
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={loading}
                    className="h-7 text-xs gap-1 border-amber-400/50 text-amber-800 dark:text-amber-200 bg-amber-50/50 hover:bg-amber-100 font-semibold"
                    onClick={() => handleLearningAction("explain_simply")}
                  >
                    💡 Explain Simply
                  </Button>
                </div>
              </div>
            )}

            {/* Chat History Messages */}
            <div className="max-h-[380px] overflow-y-auto overflow-x-hidden space-y-3 pr-1 transition-all duration-300">
              {messages.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-5 text-center text-xs text-muted-foreground bg-background/50 space-y-2.5">
                  <div className="h-10 w-10 mx-auto rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                    <Bot className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-foreground">Personal AI Tutor & Assistant Ready</p>
                    <p className="text-[11px] text-muted-foreground">
                      Ask any question, pick a suggested prompt below, or attach a document (📎) to search your notes!
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-2 text-sm ${msg.sender === "student" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.sender === "tutor" && (
                      <div className="h-7 w-7 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/20">
                        <Bot className="h-4 w-4" />
                      </div>
                    )}

                    <div
                      className={`rounded-xl px-3.5 py-2.5 max-w-[92%] sm:max-w-[88%] space-y-2 break-words overflow-x-hidden ${
                        msg.sender === "student"
                          ? "bg-emerald-800 text-white font-medium rounded-tr-none"
                          : "bg-background border border-border/80 shadow-xs rounded-tl-none text-foreground"
                      }`}
                    >
                      {msg.data?.topic && (
                        <div className="flex items-center gap-1.5 pb-1 border-b border-border/40 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
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
                              <div key={i} className="p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 text-xs space-y-1">
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
                      <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0 mt-0.5">
                        <UserIcon className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                ))
              )}

              {loading && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-background border border-border rounded-lg p-2.5 w-fit">
                  <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                  <span>{attachedDoc ? "Retrieving citations from document..." : "AI Tutor is reasoning & structuring response..."}</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </TabsContent>

          {/* TAB 2: RECENT CONVERSATIONS LIST */}
          <TabsContent value="history" className="mt-3 space-y-2">
            <div className="p-2.5 rounded-xl bg-secondary/40 border border-border/60 text-xs font-semibold text-foreground flex items-center justify-between">
              <span>Recent AI Dialogues</span>
              <span className="text-[11px] text-muted-foreground">{recentChats.length} saved</span>
            </div>

            <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1">
              {recentChats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => {
                    handleSend(chat.prompt);
                    setActiveTab("chat");
                  }}
                  className="w-full p-3 rounded-xl bg-background hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 border border-border/70 hover:border-emerald-500/40 text-left transition-all space-y-1 group cursor-pointer"
                >
                  <div className="flex items-center justify-between text-xs font-semibold text-foreground group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
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

          {/* TAB 3: INDEXED COURSE DOCUMENTS (RAG BASE) */}
          <TabsContent value="docs" className="mt-3 space-y-2">
            <div className="p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center justify-between">
              <span>Indexed Course Knowledge Base</span>
              <Badge
                className={`text-white text-[10px] ${
                  connectionOk === false ? "bg-rose-700" : "bg-emerald-700"
                }`}
              >
                {connectionOk === false ? "Offline" : indexedDocs.length > 0 ? "RAG Connected" : "Empty"}
              </Badge>
            </div>

            {indexedDocs.length === 0 ? (
              <p className="px-1 text-[11px] text-muted-foreground">
                No documents indexed yet. Upload a PDF or notes below to build your course knowledge base.
              </p>
            ) : null}

            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {indexedDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3 rounded-xl bg-background border border-border/70 flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <FileText className="h-5 w-5 text-emerald-600 shrink-0" />
                    <div className="truncate">
                      <p className="font-semibold text-xs text-foreground truncate">{doc.title}</p>
                      <p className="text-[10px] text-muted-foreground">{doc.course} • {doc.pages} pages indexed</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-[11px] font-semibold border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 shrink-0"
                    onClick={() => {
                      setAttachedDoc({ name: doc.title, content: doc.title, materialId: doc.id });
                      setActiveTab("chat");
                    }}
                  >
                    Select for Chat
                  </Button>
                </div>
              ))}

              <Button
                variant="outline"
                className="w-full text-xs font-bold gap-1.5 border-dashed border-emerald-500/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip className="h-3.5 w-3.5" />
                <span>Upload & Index New PDF / Notes</span>
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* Error notification banner */}
        {error && (
          <div className="rounded-md bg-destructive/10 border border-destructive/30 p-2.5 text-xs text-destructive flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span className="flex-1">{error}</span>
            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => handleSend()}>
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}

        {/* 2. SUGGESTED PROMPTS (Quick Prompts Badges) & INPUT AREA */}
        <div className="space-y-2.5 pt-1 border-t border-border/40">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
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
                  className="rounded-full border border-emerald-600/30 bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-emerald-500/50 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:text-emerald-200 transition-colors cursor-pointer disabled:opacity-50"
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
              className="h-10 w-10 shrink-0 text-emerald-700 border-emerald-300 hover:bg-emerald-50"
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
              className="resize-none text-xs sm:text-sm min-h-[50px] bg-background"
            />

            <Button
              onClick={() => {
                handleSend();
                setActiveTab("chat");
              }}
              disabled={loading || !input.trim()}
              size="icon"
              className="h-10 w-10 shrink-0 bg-emerald-800 hover:bg-emerald-900 text-white font-bold"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground text-center sm:text-left">
            {attachedDoc ? "📎 Active Document Search Mode (Page Citations Enabled)" : "Connected to Personal AI Socratic Tutor & Course Knowledge Base."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

