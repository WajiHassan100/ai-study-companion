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
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
}
