import { useMemo, useState } from "react";
import { useTransactions } from "../queries/useTransactions";
import { useAccounts } from "../queries/useAccounts";
import Button from "../components/ui/Button";
import TransactionModal from "../components/transactions/TransactionModal";
import { Plus, Edit, Trash2, Loader2, DollarSign } from "lucide-react";

// --- Helper Component for Mobile/List View ---

type TransactionItemProps = {
	t: any; // Transaction object
	accName: string;
	onEdit: () => void;
	onDelete: () => void;
};

const TransactionListItem = ({
	t,
	accName,
	onEdit,
	onDelete,
}: TransactionItemProps) => {
	const isNeg = Number(t.amount) < 0;
	const amountColor = isNeg ? "text-red-400" : "text-emerald-400";

	return (
		<li
			className="bg-slate-800/50 p-4 rounded-lg shadow-md border border-slate-700/70 hover:bg-slate-800 transition-colors cursor-pointer"
			onClick={onEdit}
		>
			<div className="flex items-center justify-between">
				{/* Payee and Date */}
				<div className="flex-1 min-w-0">
					<div className="font-semibold text-white truncate">
						{t.payee || "Uncategorized"}
					</div>
					<div className="text-xs text-slate-400 mt-0.5">
						{t.date} · <span className="text-slate-300">{accName}</span>
					</div>
				</div>

				{/* Amount */}
				<div className={`text-lg font-bold ${amountColor} flex-shrink-0 ml-4`}>
					{isNeg ? "-" : "+"}€{Math.abs(Number(t.amount)).toFixed(2)}
				</div>
			</div>

			{/* Actions (hidden by default, can be toggled to show on hover/click or always visible on mobile) */}
			<div className="flex justify-end gap-2 mt-3 pt-3 border-t border-slate-700">
				<Button
					variant="ghost"
					size="sm"
					onClick={(e) => {
						e.stopPropagation();
						onEdit();
					}}
					className="flex items-center text-blue-400 hover:bg-slate-700"
				>
					<Edit size={16} className="mr-1" /> Edit
				</Button>
				<Button
					variant="danger"
					size="sm"
					onClick={(e) => {
						e.stopPropagation();
						onDelete();
					}}
					className="flex items-center hover:bg-red-700/80"
				>
					<Trash2 size={16} className="mr-1" /> Delete
				</Button>
			</div>
		</li>
	);
};

// --- Main Component ---

export default function Transactions() {
	const [filterMonth, setFilterMonth] = useState(() =>
		new Date().toISOString().slice(0, 7)
	);

	// Assuming hooks return { data: [], isFetching: boolean } structure
	const { list, create, update, remove } = useTransactions({
		month: filterMonth,
	});
	const { list: accList } = useAccounts();
	const transactions = list.data;
	const isFetching = list.isFetching || accList.isFetching;

	const [open, setOpen] = useState(false);
	const [editing, setEditing] = useState<any | null>(null);

	const accounts = useMemo(
		() => (accList.data || []).map((a: any) => ({ id: a.id, name: a.name })),
		[accList.data]
	);

	// --- Handlers ---

	function onNew() {
		if (!accounts.length) {
			alert("Please create an account first in the Accounts section.");
			return;
		}
		setEditing(null);
		setOpen(true);
	}

	async function handleSubmit(payload: any) {
		if (editing?.id) {
			await update.mutateAsync({ id: editing.id, patch: payload });
		} else {
			await create.mutateAsync(payload);
		}
		setOpen(false);
	}

	// --- Render Logic ---

	if (isFetching) {
		return (
			<div className="flex items-center justify-center min-h-[50dvh] text-slate-400">
				<Loader2 className="animate-spin mr-2" size={24} /> Loading
				transactions...
			</div>
		);
	}

	return (
		<div className="max-w-4xl mx-auto space-y-6 px-4 lg:px-0">
			{/* Controls */}
			<div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
				<div className="flex items-center gap-3">
					<label htmlFor="month-filter" className="sr-only">
						Filter Month
					</label>
					<input
						id="month-filter"
						type="month"
						className="p-2 border border-slate-700 rounded-lg bg-slate-800 text-white shadow-inner max-w-[180px] focus:ring-blue-500 focus:border-blue-500 transition-colors"
						value={filterMonth}
						onChange={(e) => setFilterMonth(e.target.value)}
					/>
					<h1 className="text-xl font-bold text-white hidden sm:block">
						Transactions
					</h1>
				</div>
				<Button
					onClick={onNew}
					className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
				>
					<Plus size={18} className="mr-1" /> Add Transaction
				</Button>
			</div>

			{/* Content Area */}
			<div className="bg-slate-900 rounded-xl shadow-2xl border border-slate-800 overflow-x-auto">
				{/* No Data State */}
				{!transactions?.length && (
					<div className="p-12 text-center text-slate-400">
						<DollarSign size={36} className="mx-auto mb-3 text-slate-600" />
						<p className="text-lg font-medium">
							No transactions recorded in **{filterMonth}**.
						</p>
						<p className="text-sm mt-1">
							Start by clicking the "Add Transaction" button above!
						</p>
					</div>
				)}

				{/* Desktop/Tablet Table View (Visible on sm screens and up) */}
				{transactions && transactions?.length > 0 && (
					<table className="w-full text-sm hidden sm:table">
						<thead className="text-slate-400 bg-slate-900/80 sticky top-0">
							<tr className="border-b border-slate-700">
								<th className="text-left p-4 w-[120px]">Date</th>
								<th className="text-left p-4">Payee</th>
								<th className="text-left p-4 w-[150px]">Account</th>
								<th className="text-right p-4 w-[100px]">Amount</th>
								<th className="p-4 w-[150px]">Actions</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-800">
							{transactions.map((t: any) => {
								const accName =
									accounts.find((a) => a.id === t.account_id)?.name || "—";
								const isNeg = Number(t.amount) < 0;

								return (
									<tr
										key={t.id}
										className="hover:bg-slate-800/60 transition-colors"
									>
										<td className="p-4 text-slate-300">{t.date}</td>
										<td className="p-4 font-medium text-white">
											{t.payee || "—"}
										</td>
										<td className="p-4 text-slate-400">{accName}</td>
										<td
											className={`p-4 text-right font-bold ${
												isNeg ? "text-red-300" : "text-emerald-300"
											}`}
										>
											{isNeg ? "-" : ""}€{Math.abs(Number(t.amount)).toFixed(2)}
										</td>
										<td className="p-4 text-right">
											<div className="flex justify-end gap-2">
												<Button
													variant="ghost"
													size="sm"
													onClick={() => {
														setEditing(t);
														setOpen(true);
													}}
													className="text-blue-400 hover:bg-slate-700"
												>
													Edit
												</Button>
												<Button
													variant="danger"
													size="sm"
													onClick={() => remove.mutate(t.id)}
													className="hover:bg-red-700/80"
												>
													Delete
												</Button>
											</div>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				)}

				{/* Mobile List View (Visible on screens smaller than sm) */}
				{transactions && transactions?.length > 0 && (
					<ul className="divide-y divide-slate-800 sm:hidden p-4 space-y-3">
						{transactions.map((t: any) => {
							const accName =
								accounts.find((a) => a.id === t.account_id)?.name || "—";
							return (
								<TransactionListItem
									key={t.id}
									t={t}
									accName={accName}
									onEdit={() => {
										setEditing(t);
										setOpen(true);
									}}
									onDelete={() => remove.mutate(t.id)}
								/>
							);
						})}
					</ul>
				)}
			</div>

			{/* Transaction Modal */}
			<TransactionModal
				open={open}
				title={editing ? "Edit Transaction" : "New Transaction"}
				accounts={accounts}
				initial={
					editing && {
						id: editing.id,
						account_id: editing.account_id,
						amount: Number(editing.amount),
						date: editing.date,
						payee: editing.payee || "",
						category_id: editing.category_id ?? null,
						note: editing.note || "",
					}
				}
				onClose={() => setOpen(false)}
				onSubmit={handleSubmit}
			/>
		</div>
	);
}
