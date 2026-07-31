import { type Transaction } from '@findash/domain';
export type TransactionFormValues = Omit<Transaction, 'id' | 'createdAt'>;
type Props = {
    editing: Transaction | null;
    onSubmit: (values: TransactionFormValues) => Promise<void>;
    onCancelEdit: () => void;
};
export default function TransactionForm({ editing, onSubmit, onCancelEdit }: Props): import("react").JSX.Element;
export {};
