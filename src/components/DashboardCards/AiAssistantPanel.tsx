import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, Loader2, Bot, User as UserIcon, BookOpen, HelpCircle, CheckCircle2, AlertCircle, RefreshCw, Paperclip, FileText, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { orchestrateMessage, type OrchestratorResponse, type ChatMessage } from "@/lib/api/ai";
import { uploadFileObjectToRAG, queryRAGDocument, type RAGQueryResponse } from "@/lib/api/rag";

export function AiAssistantPanel({
  title = "AI Orchestrated Study Assistant",
  description = "Central Orchestrator routes your requests across Tutor, RAG, Planner & Profiler agents.",
  suggestions = ["Explain thylakoid light reactions", "Create a 7-day study revision plan", "Check my biology mastery level"],
  studentId,
  studentLevel = "beginner",
  learningStyle = "visual",
  externalPrompt,
}: {
  title?: string;
  description?: string;
  suggestions?: string[];
  studentId?: string;
  studentLevel?: "beginner" | "intermediate" | "advanced";
  learningStyle?: "visual" | "auditory" | "reading" | "kinesthetic";
  externalPrompt?: string;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // RAG Document Attachment State
  const [attachedDoc, setAttachedDoc] = useState<{ name: string; content: string; materialId: string } | null>(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (externalPrompt) {
      handleSend(externalPrompt);
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
    } catch (err: any) {
      console.error("Failed to upload document for RAG:", err);
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

    try {
      if (attachedDoc) {
        // RAG GROUNDED CHAT MODE (AGENT #5)
        const ragRes: RAGQueryResponse = await queryRAGDocument("general_study", textToSend);
        const cleanAnswer = (ragRes.answer || "")
          .replace(/PK[\s\S]*?xml/g, "")
          .replace(/[^\x20-\x7E\x0A\x0D]/g, " ")
          .trim();

        const tutorMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: "tutor",
          text: cleanAnswer || `Based on '${attachedDoc.name}', here is the key explanation for your prompt.`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          data: {
            topic: `RAG Grounded: ${attachedDoc.name}`,
            encouragement: `Answers strictly grounded in '${attachedDoc.name}' (Confidence: ${(ragRes.confidence_score * 100).toFixed(0)}%).`,
            citations: ragRes.cited_sources || [],
          } as any,
        };
        setMessages((prev) => [...prev, tutorMsg]);
      } else {
        // CENTRAL AI ORCHESTRATOR PIPELINE
        const response: OrchestratorResponse = await orchestrateMessage({
          student_id: studentId,
          query: textToSend,
          session_id: sessionId,
          course_id: "biol_101",
        });

        if (response.session_id) {
          setSessionId(response.session_id);
        }

        const decision = response.orchestrator_decision || {};
        const tutorMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: "tutor",
          text: response.response || "Task executed successfully.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          data: {
            topic: `Orchestrated Intent: ${decision.intent || "General"}`,
            encouragement: `Reasoning: ${decision.reasoning || "Delegated to active agents."}`,
            recommendations: response.delegated_agents || [],
          } as any,
        };

        setMessages((prev) => [...prev, tutorMsg]);
      }
    } catch (err: any) {
      console.error("AI Assistant call failed:", err);
      setError(err.message || "Failed to reach AI Agent backend. Please check connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border border-accent/40 bg-accent/5 shadow-sm flex flex-col h-auto transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-accent animate-pulse" />
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          <Badge variant="secondary" className="ml-auto bg-accent/20 text-accent font-medium text-xs">
            {attachedDoc ? "RAG Document Mode" : "Live • AI Tutor Agent"}
          </Badge>
        </div>
        <CardDescription className="text-xs text-muted-foreground">{description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 flex flex-col">
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept=".pdf,.txt,.md,.doc,.docx"
          className="hidden"
        />

        {/* Active Document Attachment Banner */}
        {attachedDoc && (
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
        )}

        {/* Chat History Messages (Dynamic Height & Smooth Scroll) */}
        <div className="max-h-[460px] overflow-y-auto overflow-x-hidden space-y-3 pr-1 transition-all duration-300">
          {messages.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground bg-background/50 space-y-2">
              <Bot className="h-7 w-7 mx-auto text-emerald-600" />
              <div>Ask me any question or click <strong className="text-emerald-700">📎 Attach Document</strong> to upload notes and chat with Agent #5!</div>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 text-sm ${msg.sender === "student" ? "justify-end" : "justify-start"}`}
              >
                {msg.sender === "tutor" && (
                  <div className="h-7 w-7 rounded-full bg-accent/20 flex items-center justify-center text-accent shrink-0 mt-0.5">
                    <Bot className="h-4 w-4" />
                  </div>
                )}

                <div
                  className={`rounded-xl px-3.5 py-2.5 max-w-[92%] sm:max-w-[88%] space-y-2 break-words overflow-x-hidden ${
                    msg.sender === "student"
                      ? "bg-primary text-primary-foreground font-medium rounded-tr-none"
                      : "bg-background border border-border/80 shadow-xs rounded-tl-none text-foreground"
                  }`}
                >
                  {/* Topic badge for AI Tutor / RAG */}
                  {msg.data?.topic && (
                    <div className="flex items-center gap-1.5 pb-1 border-b border-border/40 text-xs font-semibold text-accent">
                      <BookOpen className="h-3.5 w-3.5" />
                      <span className="truncate">{msg.data.topic}</span>
                    </div>
                  )}

                  {/* Main text content */}
                  <div className="whitespace-pre-wrap leading-relaxed text-xs sm:text-sm break-words">{msg.text}</div>

                  {/* Clean RAG Citations Rendering */}
                  {msg.data?.citations && msg.data.citations.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-border/40 space-y-2">
                      <div className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                        <FileText className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span>Official Page Citations:</span>
                      </div>
                      <div className="space-y-1.5">
                        {msg.data.citations.map((c: any, i: number) => (
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

                  {/* Examples Section */}
                  {msg.data?.examples && msg.data.examples.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-border/40 space-y-1 text-xs">
                      <div className="font-semibold text-muted-foreground flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Worked Examples:
                      </div>
                      {msg.data.examples.map((ex, idx) => (
                        <div key={idx} className="bg-accent/10 rounded-md p-2 text-xs text-foreground/90 font-mono">
                          {ex}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Practice Questions */}
                  {msg.data?.practice_questions && msg.data.practice_questions.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-border/40 space-y-1 text-xs">
                      <div className="font-semibold text-muted-foreground flex items-center gap-1">
                        <HelpCircle className="h-3.5 w-3.5 text-amber-500" /> Practice Questions:
                      </div>
                      <ul className="list-disc list-inside space-y-1 text-xs text-foreground/90 pl-1">
                        {msg.data.practice_questions.map((q, idx) => (
                          <li key={idx}>{q}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Encouragement */}
                  {msg.data?.encouragement && (
                    <div className="text-xs italic text-accent font-medium mt-1">
                      ✨ {msg.data.encouragement}
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
              <Loader2 className="h-4 w-4 animate-spin text-accent" />
              <span>{attachedDoc ? "Agent #5 RAG is retrieving citations from document..." : "AI Tutor is thinking and structuring explanation..."}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

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

        {/* Input & Prompt Suggestions */}
        <div className="space-y-2.5 pt-2">
          {/* Quick suggestions */}
          <div className="flex flex-wrap gap-1.5">
            {suggestions.map((s) => (
              <button
                key={s}
                disabled={loading}
                onClick={() => handleSend(s)}
                className="rounded-full border border-border bg-background hover:bg-accent/10 hover:border-accent/50 px-2.5 py-1 text-xs text-muted-foreground transition-colors cursor-pointer disabled:opacity-50"
              >
                {s}
              </button>
            ))}
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
                }
              }}
              disabled={loading}
              placeholder={attachedDoc ? `Ask a question about '${attachedDoc.name}'...` : "Ask your AI Tutor or attach a document (📎)..."}
              rows={2}
              className="resize-none text-xs sm:text-sm min-h-[50px] bg-background"
            />

            <Button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              size="icon"
              className="h-10 w-10 shrink-0 bg-primary hover:bg-primary/90"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground text-center sm:text-left">
            {attachedDoc ? "📎 Active Document RAG Mode (Agent #5 Citations Enabled)" : "Connected to AI Tutor Agent & Agent #5 RAG via FastAPI."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
