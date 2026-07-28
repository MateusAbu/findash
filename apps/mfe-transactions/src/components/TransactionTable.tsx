import Badge from 'ds/Badge';
import Button from 'ds/Button';
import { CATEGORY_LABELS, formatCents, type Transaction } from '@findash/domain';

function formatDate(iso: string): string {
  const [year, month, day] = iso.split('-');
  return `${day}/${month}/${year}`;
}

type Props = {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onRemove: (transaction: Transaction) => void;
};

// RF-T1: data, descrição, categoria e valor colorido por tipo.
export default function TransactionTable({ transactions, onEdit, onRemove }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-text-muted">
            <th className="py-2 pr-4 font-medium">Data</th>
            <th className="py-2 pr-4 font-medium">Descrição</th>
            <th className="py-2 pr-4 font-medium">Categoria</th>
            <th className="py-2 pr-4 text-right font-medium">Valor</th>
            <th className="py-2 text-right font-medium">Ações</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr key={t.id} className="border-b border-border last:border-0">
              <td className="py-3 pr-4 whitespace-nowrap">{formatDate(t.date)}</td>
              <td className="py-3 pr-4">{t.description}</td>
              <td className="py-3 pr-4">
                <Badge>{CATEGORY_LABELS[t.category]}</Badge>
              </td>
              <td
                className={`py-3 pr-4 text-right font-medium whitespace-nowrap ${
                  t.type === 'income' ? 'text-success' : 'text-error'
                }`}
              >
                {t.type === 'income' ? '+' : '−'}&nbsp;{formatCents(t.amountCents)}
              </td>
              <td className="py-3 text-right whitespace-nowrap">
                <Button variant="ghost" size="sm" onClick={() => onEdit(t)}>
                  Editar
                </Button>
                <Button variant="danger" size="sm" className="ml-2" onClick={() => onRemove(t)}>
                  Excluir
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
