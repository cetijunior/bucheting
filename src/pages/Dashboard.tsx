import StatCard from "../shared/StatCard";

export default function Dashboard() {
	// Placeholder numbers; later compute from DB
	const netWorth = 12450.32;
	const monthSpend = 782.55;
	const monthIncome = 2100;

	return (
		<div className="space-y-4 max-w-3xl mx-auto">
			<section className="grid grid-cols-2 sm:grid-cols-3 gap-3">
				<StatCard title="Net Worth" value={`€${netWorth.toLocaleString()}`} />
				<StatCard
					title="Income (M)"
					value={`€${monthIncome.toLocaleString()}`}
				/>
				<StatCard title="Spend (M)" value={`€${monthSpend.toLocaleString()}`} />
			</section>

			<section className="card p-4">
				<h2 className="font-medium mb-2">Quick Actions</h2>
				<div className="flex flex-wrap gap-2">
					<button className="btn">Add Transaction</button>
					<button className="btn">New Account</button>
					<button className="btn">Set Budget</button>
				</div>
			</section>

			<section className="card p-4">
				<h2 className="font-medium mb-2">Recent Transactions</h2>
				<ul className="text-sm divide-y divide-slate-800">
					{Array.from({ length: 5 }).map((_, i) => (
						<li key={i} className="py-2 flex items-center justify-between">
							<div>
								<div className="font-medium">Grocery Store</div>
								<div className="text-slate-400 text-xs">
									Yesterday • Groceries
								</div>
							</div>
							<div className="text-red-300">-€24.90</div>
						</li>
					))}
				</ul>
			</section>
		</div>
	);
}
