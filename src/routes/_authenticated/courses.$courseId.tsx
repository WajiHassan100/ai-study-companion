import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BookOpen,
  FileText,
  Sparkles,
  Users,
  Clock,
  Download,
  Upload,
  Search,
  CheckCircle2,
  Bookmark,
  ChevronRight,
  Send,
  Loader2,
  ExternalLink,
  GraduationCap,
  Layers,
} from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/Navbar/Navbar";
import { StatCard } from "@/components/DashboardCards/StatCard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getCourseDetail,
  queryCourseKnowledge,
  type CourseDetail,
  type CourseKnowledgeQueryResult,
} from "@/lib/api/courses";

export const Route = createFileRoute("/_authenticated/courses/$courseId")({
  head: ({ params }) => ({
    meta: [
      { title: `Course Details — ${params.courseId} | Scholar` },
      {
        name: "description",
        content: "View course modules, materials, syllabus, and grounded AI knowledge base.",
      },
    ],
  }),
  component: CourseDetailPage,
});

function CourseDetailPage() {
  const { courseId } = Route.useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("modules");

  // RAG Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<CourseKnowledgeQueryResult | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await getCourseDetail(courseId);
        setCourse(data);
      } catch (err) {
        console.error("Failed to load course details:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [courseId]);

  const handleKnowledgeQuery = async (queryText?: string) => {
    const textToSearch = queryText || searchQuery;
    if (!textToSearch.trim() || searching) return;

    setSearching(true);
    try {
      const res = await queryCourseKnowledge(courseId, textToSearch);
      setSearchResult(res);
    } catch (err) {
      console.error("Failed to query course knowledge base:", err);
    } finally {
      setSearching(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="flex items-center gap-3 text-emerald-800 font-semibold">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
          <span>Loading course workspace & materials...</span>
        </div>
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className="space-y-8">
      {/* ── BREADCRUMB ── */}
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <Link to="/dashboard" className="hover:text-emerald-700 transition-colors">
            Dashboard
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span>Courses</span>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground font-semibold">{course.code}</span>
        </div>

        {/* ── HERO BANNER (EMERALD PRESTIGE) ── */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-700 p-8 md:p-10 text-white shadow-xl">
          <div className="relative z-10 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-700/80 border border-emerald-500/40 text-emerald-100 text-xs uppercase font-bold py-1 px-3.5">
                <Bookmark className="h-3.5 w-3.5 text-emerald-300" />
                {course.code} • {course.department}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-200 text-xs font-semibold py-1 px-3">
                <GraduationCap className="h-3.5 w-3.5 text-amber-300" />
                {course.instructor_name}
              </span>
            </div>

            <h1 className="font-display text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
              {course.title}
            </h1>

            <p className="max-w-3xl text-sm md:text-base text-emerald-100/90 leading-relaxed font-sans">
              {course.description}
            </p>

            <div className="pt-4 flex flex-wrap items-center justify-between gap-6 border-t border-emerald-700/60">
              <div className="flex items-center gap-4 text-xs font-medium text-emerald-200">
                <div>
                  <span className="opacity-75">Enrolled: </span>
                  <strong className="text-white font-bold">{course.enrolled_count} Students</strong>
                </div>
                <div>
                  <span className="opacity-75">Syllabus Modules: </span>
                  <strong className="text-white font-bold">{course.modules.length} Modules</strong>
                </div>
                <div>
                  <span className="opacity-75">Materials: </span>
                  <strong className="text-white font-bold">{course.materials.length} Documents</strong>
                </div>
              </div>

              {/* Progress Indicator */}
              <div className="w-full sm:w-64 space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span>Course Progress</span>
                  <span>{course.progress_percentage}%</span>
                </div>
                <Progress value={course.progress_percentage} className="h-2 bg-emerald-950/60 [&>div]:bg-amber-400" />
              </div>
            </div>
          </div>
        </div>

        {/* ── STAT CARDS ROW ── */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Course Modules" value={course.modules.length.toString()} hint="Active syllabus topics" icon={Layers} />
          <StatCard title="Course Materials" value={course.materials.length.toString()} hint="Textbooks & slides" icon={FileText} />
          <StatCard title="Enrolled Students" value={course.enrolled_count.toString()} hint="Active roster" icon={Users} />
          <StatCard title="RAG AI Index Status" value="100% Grounded" hint="Indexed by Agent #5" icon={Sparkles} />
        </div>

        {/* ── MAIN CONTENT TABS ── */}
        <Tabs defaultValue="modules" onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-secondary/60 p-1 rounded-xl border border-border/60">
            <TabsTrigger value="modules" className="data-[state=active]:bg-background data-[state=active]:text-foreground font-semibold text-xs sm:text-sm rounded-lg px-4 py-2">
              <Layers className="h-4 w-4 mr-2 text-emerald-600" /> Syllabus Modules
            </TabsTrigger>
            <TabsTrigger value="materials" className="data-[state=active]:bg-background data-[state=active]:text-foreground font-semibold text-xs sm:text-sm rounded-lg px-4 py-2">
              <FileText className="h-4 w-4 mr-2 text-emerald-600" /> Materials & PDFs ({course.materials.length})
            </TabsTrigger>
            <TabsTrigger value="knowledge" className="data-[state=active]:bg-background data-[state=active]:text-foreground font-semibold text-xs sm:text-sm rounded-lg px-4 py-2">
              <Sparkles className="h-4 w-4 mr-2 text-amber-500" /> Course AI Assistant (Agent #5)
            </TabsTrigger>
          </TabsList>

          {/* ── TAB 1: SYLLABUS MODULES ── */}
          <TabsContent value="modules" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-xl font-bold tracking-tight">Syllabus & Learning Modules</h3>
                <p className="text-xs text-muted-foreground">Comprehensive chapter breakdown for {course.code}</p>
              </div>
            </div>

            <div className="grid gap-4">
              {course.modules.map((mod) => (
                <Card key={mod.id} className="border-border/80 shadow-xs hover:shadow-md transition-all rounded-2xl">
                  <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-emerald-600 text-white font-bold text-xs">
                          Module {mod.module_number}
                        </Badge>
                        <CardTitle className="font-display text-base font-bold text-foreground">
                          {mod.title}
                        </CardTitle>
                      </div>
                      <CardDescription className="text-xs text-muted-foreground leading-relaxed pt-1">
                        {mod.description}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-semibold text-muted-foreground bg-secondary px-2.5 py-1 rounded-full shrink-0">
                      <Clock className="h-3.5 w-3.5 text-emerald-600" />
                      <span>{mod.duration_hours} Hours</span>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-2 border-t border-border/40 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-xs font-bold text-muted-foreground mr-1">Key Topics:</span>
                      {mod.topics.map((t, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs bg-emerald-50/50 text-emerald-800 border-emerald-200 font-medium">
                          {t}
                        </Badge>
                      ))}
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs font-semibold text-emerald-700 border-emerald-300 hover:bg-emerald-50 gap-1.5"
                      onClick={() => {
                        setActiveTab("knowledge");
                        handleKnowledgeQuery(`Explain key concepts for Module ${mod.module_number}: ${mod.title}`);
                      }}
                    >
                      <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                      Ask Course AI About This Module
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ── TAB 2: COURSE MATERIALS & PDFS ── */}
          <TabsContent value="materials" className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-display text-xl font-bold tracking-tight">Course Document Library</h3>
                <p className="text-xs text-muted-foreground">Official textbook chapters, slides, and lab guides</p>
              </div>
              <Button className="bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs gap-2 rounded-xl">
                <Upload className="h-4 w-4" /> Upload Course Material (PDF/Slides)
              </Button>
            </div>

            <div className="grid gap-3">
              {course.materials.map((mat) => (
                <div
                  key={mat.id}
                  className="p-4 rounded-2xl border border-border/80 bg-card hover:bg-emerald-50/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs uppercase">
                      {mat.type}
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                        {mat.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span>Size: {mat.file_size}</span>
                        <span>•</span>
                        <span>Coverage: {mat.chapters_covered}</span>
                        <span>•</span>
                        <span>{mat.pages_count} Pages</span>
                        <span>•</span>
                        <span>Uploaded {mat.uploaded_at}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <Badge variant="outline" className="text-[11px] bg-emerald-50 text-emerald-700 border-emerald-200">
                      <CheckCircle2 className="h-3 w-3 mr-1 text-emerald-600" /> Indexed for RAG
                    </Badge>
                    <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground hover:text-foreground gap-1">
                      <Download className="h-3.5 w-3.5" /> Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* ── TAB 3: COURSE AI ASSISTANT (AGENT #5 RAG INTEGRATOR) ── */}
          <TabsContent value="knowledge" className="space-y-6">
            <Card className="border-emerald-200/80 shadow-md bg-gradient-to-br from-emerald-50/30 via-background to-background rounded-3xl overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-emerald-800 text-white flex items-center justify-center">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold font-display">
                      Agent #5: Course RAG Knowledge Assistant
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      Ask any question — answers are 100% grounded in official course textbooks and slides with page citations
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Search Bar */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleKnowledgeQuery();
                      }}
                      placeholder="Ask a question about Photosynthesis, Calvin Cycle, or lab protocols..."
                      className="pl-9 text-xs sm:text-sm bg-background border-border/80 rounded-xl"
                    />
                  </div>
                  <Button
                    onClick={() => handleKnowledgeQuery()}
                    disabled={searching || !searchQuery.trim()}
                    className="bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs px-5 rounded-xl"
                  >
                    {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 mr-1.5" />}
                    <span>{searching ? "Searching..." : "Ask Agent #5"}</span>
                  </Button>
                </div>

                {/* Suggested Course Queries */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="font-bold text-muted-foreground mr-1">Suggested Questions:</span>
                  {[
                    "Where do light-dependent reactions occur?",
                    "What is the role of RuBisCO in the Calvin Cycle?",
                    "How does ATP Synthase convert ADP?",
                  ].map((sq) => (
                    <button
                      key={sq}
                      onClick={() => {
                        setSearchQuery(sq);
                        handleKnowledgeQuery(sq);
                      }}
                      className="px-2.5 py-1 rounded-full border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/80 text-emerald-800 text-xs font-medium transition-colors cursor-pointer"
                    >
                      {sq}
                    </button>
                  ))}
                </div>

                {/* Grounded RAG Search Result View */}
                {searchResult ? (
                  <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-200/80 space-y-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        <h4 className="font-bold text-sm text-foreground">Grounded Answer (Agent #5 RAG)</h4>
                      </div>
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200 text-xs">
                        Confidence: {(searchResult.confidence_score * 100).toFixed(0)}%
                      </Badge>
                    </div>

                    <p className="text-xs sm:text-sm text-foreground leading-relaxed font-sans whitespace-pre-wrap">
                      {searchResult.answer}
                    </p>

                    {/* Citations & Source Highlights */}
                    {searchResult.cited_sources && searchResult.cited_sources.length > 0 && (
                      <div className="pt-4 border-t border-border/40 space-y-2.5">
                        <h5 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                          <FileText className="h-3.5 w-3.5 text-emerald-600" /> Official Page Citations & Text Snippets:
                        </h5>

                        <div className="grid gap-2 sm:grid-cols-2">
                          {searchResult.cited_sources.map((cite, idx) => (
                            <div key={idx} className="p-3 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-100 text-xs space-y-1">
                              <div className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                                <span className="truncate">{cite.material_title}</span>
                                <Badge className="bg-emerald-800 text-white text-[10px] shrink-0 ml-1">
                                  Page {cite.page_number}
                                </Badge>
                              </div>
                              <div className="text-[11px] text-muted-foreground font-semibold">{cite.chapter}</div>
                              <p className="text-xs text-foreground/90 italic line-clamp-2">"{cite.snippet}"</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
    </div>
  );
}

