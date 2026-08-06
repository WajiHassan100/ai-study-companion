import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BookOpen,
  FileText,
  Sparkles,
  Users,
  Search,
  CheckCircle2,
  Bookmark,
  ChevronRight,
  GraduationCap,
  Layers,
  ArrowRight,
  Loader2,
} from "lucide-react";

import { StatCard } from "@/components/DashboardCards/StatCard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { getAllCourses, type CourseListItem } from "@/lib/api/courses";

export const Route = createFileRoute("/_authenticated/courses/")({
  head: () => ({
    meta: [
      { title: "Enrolled Courses — Scholar" },
      {
        name: "description",
        content: "Browse all enrolled courses, access syllabus modules, and query RAG document knowledge bases.",
      },
    ],
  }),
  component: CoursesCatalogPage,
});

function CoursesCatalogPage() {
  const [courses, setCourses] = useState<CourseListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await getAllCourses();
        setCourses(data);
      } catch (err) {
        console.error("Failed to load course catalog:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.instructor_name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = selectedDepartment === "all" || c.department.toLowerCase().includes(selectedDepartment.toLowerCase());
    return matchesSearch && matchesDept;
  });

  const totalIndexedDocs = courses.reduce((acc, c) => acc + c.materials_count, 0);
  const totalModules = courses.reduce((acc, c) => acc + c.modules_count, 0);

  return (
    <div className="space-y-8">
      {/* ── BREADCRUMB ── */}
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <Link to="/dashboard/student" className="hover:text-emerald-700 transition-colors">
          Dashboard
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-semibold">Courses</span>
      </div>

      {/* ── HERO BANNER ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-700 p-8 md:p-10 text-white shadow-xl">
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-700/80 border border-emerald-500/40 text-emerald-100 text-xs uppercase font-bold py-1 px-3.5">
              <BookOpen className="h-3.5 w-3.5 text-emerald-300" />
              Academic Term 2026
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-200 text-xs font-semibold py-1 px-3">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              Agent #5 RAG Grounded
            </span>
          </div>

          <h1 className="font-display text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
            Enrolled Courses & Knowledge Bases
          </h1>

          <p className="max-w-3xl text-sm md:text-base text-emerald-100/90 leading-relaxed font-sans">
            Access your course syllabi, lecture slides, uploaded textbooks, and interactive AI RAG assistants for all active courses.
          </p>

          <div className="pt-4 flex flex-wrap items-center gap-6 border-t border-emerald-700/60 text-xs text-emerald-200">
            <div>
              <span className="opacity-75">Enrolled Courses: </span>
              <strong className="text-white font-bold">{courses.length} Active Courses</strong>
            </div>
            <div>
              <span className="opacity-75">Indexed Documents: </span>
              <strong className="text-white font-bold">{totalIndexedDocs} Files</strong>
            </div>
            <div>
              <span className="opacity-75">Syllabus Modules: </span>
              <strong className="text-white font-bold">{totalModules} Modules</strong>
            </div>
          </div>
        </div>
      </div>

      {/* ── STAT CARDS ROW ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Active Courses" value={courses.length.toString()} hint="Enrolled in current term" icon={BookOpen} />
        <StatCard title="Indexed Documents" value={totalIndexedDocs.toString()} hint="PDFs & Slides for RAG" icon={FileText} />
        <StatCard title="Total Modules" value={totalModules.toString()} hint="Structured syllabus topics" icon={Layers} />
        <StatCard title="AI Knowledge Base" value="Agent #5 Ready" hint="Grounded citations active" icon={Sparkles} />
      </div>

      {/* ── SEARCH & FILTER CONTROLS ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-card border border-border/80 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search courses, codes, or instructors..."
            className="pl-9 text-xs sm:text-sm bg-background border-border/80 rounded-xl"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: "all", label: "All Departments" },
            { id: "biological", label: "Biology" },
            { id: "mathematics", label: "Math" },
            { id: "physics", label: "Physics" },
            { id: "computer", label: "CS" },
          ].map((dept) => (
            <button
              key={dept.id}
              onClick={() => setSelectedDepartment(dept.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedDepartment === dept.id
                  ? "bg-emerald-800 text-white shadow-xs"
                  : "bg-secondary/60 hover:bg-secondary text-muted-foreground"
              }`}
            >
              {dept.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── COURSES GRID ── */}
      {loading ? (
        <div className="py-12 text-center text-emerald-800 font-semibold flex items-center justify-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
          <span>Loading course catalog...</span>
        </div>
      ) : filteredCourses.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((c) => (
            <Card
              key={c.id}
              className="border-border/80 shadow-xs hover:shadow-lg hover:border-emerald-300 transition-all rounded-3xl overflow-hidden flex flex-col justify-between group"
            >
              <CardHeader className="pb-3 space-y-3">
                <div className="flex items-center justify-between">
                  <Badge className="bg-emerald-700 text-white font-bold text-xs uppercase tracking-wide">
                    {c.code}
                  </Badge>
                  <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    View Course <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>

                <div>
                  <CardTitle className="font-display font-bold text-lg text-foreground line-clamp-1">
                    {c.title}
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1 font-medium">
                    <GraduationCap className="h-3.5 w-3.5 text-emerald-600" />
                    {c.instructor_name} • {c.department}
                  </CardDescription>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 pt-1">
                  {c.description}
                </p>
              </CardHeader>

              <CardContent className="space-y-4 pt-2 border-t border-border/40">
                {/* Course Metadata Pills */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-xl bg-secondary/50 space-y-0.5">
                    <span className="text-[10px] text-muted-foreground block font-semibold uppercase">Students</span>
                    <strong className="font-bold text-foreground">{c.enrolled_count}</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-secondary/50 space-y-0.5">
                    <span className="text-[10px] text-muted-foreground block font-semibold uppercase">Modules</span>
                    <strong className="font-bold text-foreground">{c.modules_count}</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-secondary/50 space-y-0.5">
                    <span className="text-[10px] text-muted-foreground block font-semibold uppercase">Docs</span>
                    <strong className="font-bold text-foreground">{c.materials_count}</strong>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-muted-foreground">Course Completion</span>
                    <span className="text-emerald-700 font-bold">{c.progress_percentage}%</span>
                  </div>
                  <Progress value={c.progress_percentage} className="h-2 bg-secondary [&>div]:bg-emerald-600" />
                </div>

                {/* Action Link Button */}
                <Button
                  asChild
                  className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs h-9 rounded-xl gap-2"
                >
                  <Link to={`/courses/${c.id}`}>
                    <BookOpen className="h-4 w-4" />
                    <span>Open Course Workspace →</span>
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center text-muted-foreground space-y-2">
          <p className="text-sm font-semibold">No courses match your search filter "{searchQuery}".</p>
          <Button variant="outline" size="sm" onClick={() => { setSearchQuery(""); setSelectedDepartment("all"); }}>
            Clear Search Filter
          </Button>
        </div>
      )}
    </div>
  );
}
