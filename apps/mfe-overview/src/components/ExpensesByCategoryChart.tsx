import { useMemo } from 'react';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatCents } from '@findash/domain';

export type CategoryTotal = { label: string; totalCents: number };

// Recharts desenha SVG com cores em JS — atributos SVG não resolvem var(--x).
// Solução documentada na T-2.1: ler os tokens computados uma vez.
function useChartTokens() {
  return useMemo(() => {
    const styles = getComputedStyle(document.documentElement);
    const read = (name: string, fallback: string) =>
      styles.getPropertyValue(name).trim() || fallback;
    return {
      primary: read('--color-primary', '#059669'),
      textMuted: read('--color-text-muted', '#64748b'),
      border: read('--color-border', '#e2e8f0'),
      surface: read('--color-surface', '#ffffff'),
      surfaceMuted: read('--color-surface-muted', '#f8fafc'),
    };
  }, []);
}

const BAR_SIZE = 18;
const ROW_HEIGHT = 44;

// Barras HORIZONTAIS (rótulos pt-BR legíveis sem inclinar) e UMA cor para a
// série única — categoria é identidade no eixo, não no matiz.
export default function ExpensesByCategoryChart({ data }: { data: CategoryTotal[] }) {
  const tokens = useChartTokens();

  return (
    <ResponsiveContainer width="100%" height={Math.max(160, data.length * ROW_HEIGHT)}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 8 }}>
        <XAxis
          type="number"
          tickFormatter={(v: number) => formatCents(v)}
          tick={{ fill: tokens.textMuted, fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="label"
          width={96}
          tick={{ fill: tokens.textMuted, fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          formatter={(value) => [formatCents(Number(value)), 'Total no mês']}
          cursor={{ fill: tokens.surfaceMuted }}
          contentStyle={{
            borderRadius: 8,
            border: `1px solid ${tokens.border}`,
            background: tokens.surface,
            fontSize: 12,
          }}
        />
        <Bar
          dataKey="totalCents"
          fill={tokens.primary}
          barSize={BAR_SIZE}
          radius={[0, 4, 4, 0]}
          // Determinismo > polish: animação de entrada some em snapshots,
          // testes e headless — e é dispensável num dashboard.
          isAnimationActive={false}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
