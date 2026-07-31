import { type Transaction } from '@findash/domain';
type Props = {
    transactions: Transaction[];
    onEdit: (transaction: Transaction) => void;
    onRemove: (transaction: Transaction) => void;
};
export default function TransactionTable({ transactions, onEdit, onRemove }: Props): import("react").JSX.Element;
export {};
