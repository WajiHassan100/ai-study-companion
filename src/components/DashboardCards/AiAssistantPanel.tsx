import { Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

/**
 * Placeholder for the AI assistant.
 *
 * Wiring point: replace `handleAsk` with a call to a server function that
 * forwards the prompt to the LangChain/LangGraph agent (see
 * `reference-backend/app/ai/`), then stream the reply back into this panel.
 */
export function AiAssistantPanel({
  title,
  description,
  suggestions,
}: {
  title: string;
  description: string;
  suggestions: string[];
}) {
  return (
    <Card className="border-dashed border-accent/60 bg-accent/5">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-accent" />
          <CardTitle className="text-base">{title}</CardTitle>
          <Badge variant="outline" className="ml-auto">
            Coming soon
          </Badge>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Textarea disabled placeholder="Ask the assistant anything about your work..." rows={3} />
        <div className="flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <span
              key={s}
              className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground"
            >
              {s}
            </span>
          ))}
        </div>
        <Button disabled className="w-full sm:w-auto">
          Ask the assistant
        </Button>
        <p className="text-xs text-muted-foreground">
          The agent layer is not connected yet — it plugs in behind this panel.
        </p>
      </CardContent>
    </Card>
  );
}
