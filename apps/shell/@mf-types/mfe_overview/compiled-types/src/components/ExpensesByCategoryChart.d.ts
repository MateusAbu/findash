export type CategoryTotal = {
    label: string;
    totalCents: number;
};
export default function ExpensesByCategoryChart({ data }: {
    data: CategoryTotal[];
}): import("react").JSX.Element;
