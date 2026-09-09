import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/EmptyState";
import { useBudgets, useCategories, useChallenges, useProfile, useTransactions } from "@/lib/data";
import { categoryBreakdown, computeHealth, dailySeries, monthlySeries, totalsFor } from "@/lib/finance";
import { formatMoney, monthLabel, monthRange } from "@/lib/format";
import { buildReportHtml } from "@/lib/report";

export const Route = createFileRoute("/_authenticated/reportes")({
  head: () => ({
    meta: [
      { title: "Reportes — PlantWallet" },
      { name: "description", content: "Evolución de tus ingresos y gastos, categorías principales y reporte PDF." },
      { property: "og:title", content: "Reportes — PlantWallet" },
      { property: "og:description", content: "Analiza tus finanzas mes a mes." },
    ],
  }),
  component: Reportes;
});

function Reportes() {
  return null;
}
