import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

export interface ProgressPoint {
  label: string;
  value: number;
}

export function ProgressChart({
  title,
  description,
  data,
  seriesLabel = "Progress",
}: {
  title: string;
  description?: string;
  data: ProgressPoint[];
  seriesLabel?: string;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Card className="border-border/70">
      <CardHeader>
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        {description ? <CardDescription className="text-xs">{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>
        {mounted ? (
          <ChartContainer
            className="h-56 w-full"
            config={{ value: { label: seriesLabel, color: "var(--chart-1)" } }}
          >
            <BarChart data={data}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis tickLine={false} axisLine={false} width={30} fontSize={12} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="value" fill="var(--color-value)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="h-56 w-full flex items-center justify-center text-xs text-muted-foreground">
            Loading chart...
          </div>
        )}
      </CardContent>
    </Card>
  );
}
