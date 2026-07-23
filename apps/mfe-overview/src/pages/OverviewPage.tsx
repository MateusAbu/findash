// O módulo que a T-1.3 vai expor via Module Federation ('./OverviewPage').
// "Burro" em relação ao ambiente: não sabe se está no shell ou standalone.
export default function OverviewPage() {
  return (
    <section>
      <h1>Olá, sou o Overview 👋</h1>
      <p>Em breve: saldo do mês, totais e gráfico de despesas por categoria.</p>
    </section>
  );
}
