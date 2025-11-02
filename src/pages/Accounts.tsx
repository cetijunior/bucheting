import { useState } from "react";

export default function Accounts() {
	const [accounts, setAccounts] = useState<Account[]>([
		{
			id: "a1",
			name: "Cash",
			type: "CASH",
			currency: "EUR",
			opening_balance: 50,
			archived: false,
		},
		{
			id: "a2",
			name: "BOV Bank",
			type: "BANK",
			currency: "EUR",
			opening_balance: 1200,
			archived: false,
		},
	]);

	return (
		<div className="max-w-3xl mx-auto space-y-3">
			<div className="flex items-center justify-between">
				<h2 className="text-lg font-semibold">Accounts</h2>
				<button
					className="btn"
					onClick={() => {
						const name = prompt("Account name?");
						if (!name) return;
						setAccounts((prev) => [
							{
								id: crypto.randomUUID(),
								name,
								type: "CASH",
								currency: "EUR",
								opening_balance: 0,
								archived: false,
							},
							...prev,
						]);
					}}
				>
					+ New
				</button>
			</div>
			<div className="grid sm:grid-cols-2 gap-3">
				{accounts.map((a) => (
					<div
						key={a.id}
						className="card p-4 flex items-center justify-between"
					>
						<div>
							<div className="font-medium">{a.name}</div>
							<div className="text-xs text-slate-400">
								{a.type} • {a.currency}
							</div>
						</div>
						<div className="text-right">
							<div className="text-emerald-300">
								€{a.opening_balance.toFixed(2)}
							</div>
							<button
								className="text-xs text-slate-400 underline"
								onClick={() => {
									if (confirm("Archive this account?"))
										setAccounts((prev) => prev.filter((x) => x.id !== a.id));
								}}
							>
								Archive
							</button>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

type Account = {
	id: string;
	name: string;
	type: "CASH" | "BANK" | "CARD" | "WALLET";
	currency: "EUR" | string;
	opening_balance: number;
	archived: boolean;
};
