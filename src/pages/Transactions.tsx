import { useState } from "react";
import { useTransactions } from "../queries/useTransactions";

export default function Transactions() {
	const [filterMonth, setFilterMonth] = useState(() =>
		new Date().toISOString().slice(0, 7)
	);

	const { list, create, firstAccountId } = useTransactions({
		month: filterMonth,
	});

	return (
		<div className="max-w-3xl mx-auto space-y-3">
			<div className="flex items-center gap-2">
				<input
					type="month"
					className="input max-w-[200px]"
					value={filterMonth}
					onChange={(e) => setFilterMonth(e.target.value)}
				/>
				<button
					className="btn"
					onClick={async () => {
						if (!firstAccountId) {
							alert("Create an account first in Accounts.");
							return;
						}
						await create.mutateAsync({
							account_id: firstAccountId,
							amount: -4.5,
							date: new Date().toISOString().slice(0, 10),
							payee: "Coffee",
							category_id: null,
						});
					}}
				>
					+ Add
				</button>
			</div>

			<div className="card">
				<table className="w-full text-sm">
					<thead className="text-slate-400">
						<tr className="border-b border-slate-800">
							<th className="text-left p-3">Date</th>
							<th className="text-left p-3">Payee</th>
							<th className="text-left p-3">Category</th>
							<th className="text-right p-3">Amount</th>
						</tr>
					</thead>
					<tbody>
						{list.data?.map((t) => (
							<tr key={t.id} className="border-b border-slate-800/70">
								<td className="p-3">{t.date}</td>
								<td className="p-3">{t.payee}</td>
								<td className="p-3">{t.category || "-"}</td>
								<td
									className={`p-3 text-right ${
										Number(t.amount) < 0 ? "text-red-300" : "text-emerald-300"
									}`}
								>
									{Number(t.amount) < 0 ? "-" : ""}€
									{Math.abs(Number(t.amount)).toFixed(2)}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
