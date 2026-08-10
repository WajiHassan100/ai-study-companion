import React, { Component, type ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ComponentErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ComponentErrorBoundary caught an error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <Card className="border-border/60 bg-muted/20">
          <CardContent className="p-6 text-center text-xs text-muted-foreground flex flex-col items-center justify-center space-y-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            <p className="font-semibold text-foreground">
              {this.props.fallbackTitle || "Unable to load this section"}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {this.state.error?.message || "An unexpected rendering error occurred."}
            </p>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}
