import { type Goal } from '@findash/domain';
type Props = {
    goal: Goal;
    onContribute: (goalId: string, amountCents: number) => Promise<void>;
};
export default function GoalCard({ goal, onContribute }: Props): import("react").JSX.Element;
export {};
