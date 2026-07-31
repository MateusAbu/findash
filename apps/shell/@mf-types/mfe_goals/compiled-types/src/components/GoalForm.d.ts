import { type Goal } from '@findash/domain';
export type GoalFormValues = Omit<Goal, 'id' | 'createdAt' | 'savedCents'>;
type Props = {
    onSubmit: (values: GoalFormValues) => Promise<void>;
};
export default function GoalForm({ onSubmit }: Props): import("react").JSX.Element;
export {};
