import { useMemo, useState } from "react";
import StatCard from "../shared/StatCard";
// Assuming the hooks provide data, isFetching, and error status
import { useAccounts } from "../queries/useAccounts";
import { useTransactions } from "../queries/useTransactions";
import Button from "../components/ui/Button";
import TransactionModal from "../components/transactions/TransactionModal";
import { DollarSign, Plus, ChevronRight, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

// Define a type for your account option data to resolve 'any' issues
type AccountOption = {
	id: string;
	name: string;
};

// Define a type for your transaction data to resolve 'any' issues
// This is a minimal definition based on usage
type Transaction = {
	id: string;
	date: string;
	payee: string | null;
	amount: number;
	category: string;
	currency: string | null;
	account_id: string;
	category_id: string | null;
	note: string | null;
};

export default function Dashboard() {
	const today = new Date();
	const ym = today.toISOString().slice(0, 7);

	// --- Data Fetching ---

	// FIX 1 & 2: Correctly destructure to get the full query result objects
	const { list: accountsQuery } = useAccounts();
	const { list: txnsQuery, create, update } = useTransactions({ month: ym });

	// Extract data and loading status from the inner query results
	const accountsData: any[] | undefined = accountsQuery.data; // Using 'any[]' since the exact object structure is inferred from the original query type, or you can use a more specific type if defined elsewhere.
	const accountsLoading = accountsQuery.isFetching;

	const txnsData: any[] | undefined = txnsQuery.data;
	const txnsLoading = txnsQuery.isFetching;

	// --- State ---

	const [open, setOpen] = useState(false);
	// Note: The editing state should match the Transaction type for safety
	const [editing, setEditing] = useState<Transaction | null>(null);

	// --- Data Pre-processing ---

	// FIX 3: Safely use the fetched data, defaulting to an empty array
	// This resolves the 'accounts' and 'txns' possibly 'undefined' errors
	const safeAccounts = accountsData || [];
	const safeTxns = txnsData || [];

	// Account options for the modal (Now correctly typed)
	const accountOptions = useMemo(
		() =>
			safeAccounts.map((a: any): AccountOption => ({ id: a.id, name: a.name })),
		[safeAccounts]
	);

	// Stats Calculation
	const { netWorth, monthIncome, monthSpend } = useMemo(() => {
		// Net worth
		const netWorthVal = safeAccounts.reduce(
			(s: number, a: any) => s + Number(a.current_balance || 0),
			0
		);

		// Monthly income/spend
		const inc = safeTxns
			.filter((x: any) => Number(x.amount) > 0)
			.reduce((s: number, x: any) => s + Number(x.amount), 0);

		// Use Math.abs for spend to ensure a positive value for display
		const exp = safeTxns
			.filter((x: any) => Number(x.amount) < 0)
			.reduce((s: number, x: any) => s + Math.abs(Number(x.amount)), 0);

		return { netWorth: netWorthVal, monthIncome: inc, monthSpend: exp };
	}, [safeAccounts, safeTxns]);

	// --- Handlers ---

	async function handleSubmit(payload: any) {
		if (editing?.id) {
			await update.mutateAsync({ id: editing.id, patch: payload });
		} else {
			await create.mutateAsync(payload);
		}
		setOpen(false);
	}

	const handleAddTransactionClick = () => {
		if (!accountOptions.length) {
			console.error("Create an account first in Accounts.");
			alert("Please create an account first in the Accounts section.");
			return;
		}
		setEditing(null);
		setOpen(true);
	};

	// --- Helper for Loading/No Data ---

	const isLoading = accountsLoading || txnsLoading;

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-[50dvh] text-slate-400">
				<Loader2 className="animate-spin mr-2" size={24} /> Loading financial
				data...
			</div>
		);
	}

	// --- Render Component ---

	return (
		<div className="space-y-6 max-w-3xl mx-auto">
			{/* 1. Statistics Cards */}
			<section className="items-center justify-center grid grid-cols-2 md:grid-cols-3 gap-4">
				<StatCard
					title="Net Worth"
					// Dynamic color based on value
					valueColor={netWorth >= 0 ? "text-emerald-300" : "text-red-300"}
					value={`€${netWorth.toLocaleString(undefined, {
						maximumFractionDigits: 2,
					})}`}
				/>
				<StatCard
					title="Income (M)"
					valueColor="text-emerald-300"
					value={`€${monthIncome.toLocaleString(undefined, {
						maximumFractionDigits: 2,
					})}`}
				/>
				<StatCard
					title="Spend (M)"
					valueColor="text-red-300"
					value={`€${monthSpend.toLocaleString(undefined, {
						maximumFractionDigits: 2,
					})}`}
				/>
			</section>

			{/* 2. Accounts Overview */}
			<section className="bg-slate-900 rounded-xl shadow-lg p-5 border border-slate-800">
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-xl font-semibold text-white">
						Accounts Overview
					</h2>
					<Button
						onClick={handleAddTransactionClick}
						className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 rounded-md transition-colors"
					>
						<Plus size={18} className="mr-1" /> Add Transaction
					</Button>
				</div>

				{safeAccounts.length === 0 ? (
					<div className="text-slate-400 py-4 text-center border-t border-slate-800">
						No accounts found. Please create one to start tracking.
					</div>
				) : (
					<div className="grid sm:grid-cols-2 gap-4">
						{safeAccounts.map((a: any) => {
							const recent = safeTxns
								.filter((t: any) => t.account_id === a.id)
								.slice(0, 3);

							const balanceColor =
								Number(a.current_balance) >= 0
									? "text-emerald-300"
									: "text-red-300";

							return (
								<div
									key={a.id}
									className="p-4 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700/50 transition duration-200 cursor-pointer flex flex-col justify-between"
								>
									<div className="flex items-center justify-between mb-3">
										<div className="flex items-center">
											<DollarSign size={18} className="text-slate-400 mr-2" />
											<h3 className="font-semibold text-lg text-white">
												{a.name}
											</h3>
										</div>
										<div className={`text-xl font-bold ${balanceColor}`}>
											€
											{Number(a.current_balance).toLocaleString(undefined, {
												minimumFractionDigits: 2,
												maximumFractionDigits: 2,
											})}
										</div>
									</div>

									{/* Recent Transactions List */}
									<h4 className="text-xs font-semibold uppercase text-slate-400 mb-1">
										Recent Activity
									</h4>
									<ul className="text-sm space-y-1">
										{recent.length > 0 ? (
											recent.map((t: any) => {
												const isNeg = Number(t.amount) < 0;
												return (
													<li
														key={t.id}
														className="py-1 flex items-center justify-between group"
														// Allow editing by clicking the transaction (better UX)
														onClick={() => {
															setEditing(t);
															setOpen(true);
														}}
													>
														<span className="truncate text-slate-300">
															{t.payee || "Uncategorized"}
														</span>
														<span
															className={`font-medium ${
																isNeg ? "text-red-400" : "text-emerald-400"
															}`}
														>
															{isNeg ? "-" : "+"}€
															{Math.abs(Number(t.amount)).toFixed(2)}
														</span>
													</li>
												);
											})
										) : (
											<li className="py-1 text-slate-500 text-sm">
												No recent transactions this month.
											</li>
										)}
									</ul>

									{/* Action button at the bottom of the card */}
									<div className="mt-3 pt-3 border-t border-slate-700">
										<Button
											variant="ghost"
											onClick={(e) => {
												e.stopPropagation(); // Prevent card click event from firing
												setEditing({
													account_id: a.id,
													amount: 0,
													date: new Date().toISOString().slice(0, 10),
													payee: "",
													category_id: null,
												} as any); // Use 'as any' as a temporary bridge for partial data
												setOpen(true);
											}}
											className="w-full justify-center text-blue-400 hover:bg-slate-700/70"
										>
											<Plus size={16} className="mr-1" /> Add Transaction
										</Button>
									</div>
								</div>
							);
						})}
					</div>
				)}
			</section>

			{/* 3. Global Recent Transactions List */}
			<section className="bg-slate-900 rounded-xl shadow-lg p-5 border border-slate-800">
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-xl font-semibold text-white">
						Recent Transactions ({ym})
					</h2>
					<Link
						to="/transactions"
						className="text-sm text-blue-400 hover:text-blue-300 flex items-center"
					>
						View All <ChevronRight size={16} />
					</Link>
				</div>

				<ul className="text-sm divide-y divide-slate-800">
					{safeTxns.slice(0, 5).map((t: any) => {
						const isNeg = Number(t.amount) < 0;
						const accountName =
							accountOptions.find((opt) => opt.id === t.account_id)?.name ||
							"N/A";

						return (
							<li
								key={t.id}
								className="py-3 flex items-center justify-between hover:bg-slate-800/50 transition-colors cursor-pointer"
								onClick={() => {
									setEditing(t);
									setOpen(true);
								}}
							>
								<div className="flex-1 min-w-0">
									<div className="font-medium truncate text-white">
										{t.payee || "—"}
									</div>
									<div className="text-slate-500 text-xs">
										{t.date} · {accountName}
									</div>
								</div>
								<div
									className={`ml-4 flex-shrink-0 font-bold ${
										isNeg ? "text-red-300" : "text-emerald-300"
									}`}
								>
									{isNeg ? "-" : "+"}€{Math.abs(Number(t.amount)).toFixed(2)}
								</div>
							</li>
						);
					})}
					{!safeTxns.length && (
						<li className="py-4 text-slate-400 text-center">
							No transactions recorded this month.
						</li>
					)}
				</ul>
			</section>

			{/* Transaction Modal */}
			<TransactionModal
				open={open}
				title={editing?.id ? "Edit Transaction" : "New Transaction"}
				accounts={accountOptions}
				initial={editing || undefined}
				onClose={() => setOpen(false)}
				onSubmit={handleSubmit}
			/>
		</div>
	);
}
