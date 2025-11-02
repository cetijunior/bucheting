import { useState } from "react";
// Assuming useAccounts returns data, isFetching, and error status
import { useAccounts } from "../queries/useAccounts";
import Modal from "../components/ui/Modal";
import Button from "../components/ui/Button";
import {
	Plus,
	Banknote,
	CreditCard,
	Wallet,
	Landmark,
	Loader2,
	Edit,
	Trash2,
} from "lucide-react";

// Helper function to map account type strings to icons
const getAccountIcon = (type: string) => {
	switch (type) {
		case "BANK":
			return <Landmark size={20} className="text-blue-400" />;
		case "CARD":
			return <CreditCard size={20} className="text-yellow-400" />;
		case "WALLET":
			return <Wallet size={20} className="text-purple-400" />;
		case "CASH":
		default:
			return <Banknote size={20} className="text-emerald-400" />;
	}
};

export default function Accounts() {
	// Assuming list, create, update, remove, and isFetching are available
	const { list, create, update, remove } = useAccounts();
	const isFetching = list.isFetching; // Assuming this status is available
	const accountsData = list.data || [];

	const [open, setOpen] = useState(false);
	// Note: If you want a dedicated edit modal, you'd add an `editingAccount` state here.
	// For this update, I'm keeping the original logic for simplicity, but styling the component around it.
	const [form, setForm] = useState({
		name: "",
		type: "CASH",
		currency: "EUR",
		opening_balance: 0,
	});

	// --- Handlers ---

	// Handler for creating a new account (from the modal)
	const handleCreateAccount = async (e: React.FormEvent) => {
		e.preventDefault();
		// Basic validation for name
		if (!form.name.trim()) return;

		await create.mutateAsync(form as any);
		setOpen(false);
		// Reset form after successful creation
		setForm({ name: "", type: "CASH", currency: "EUR", opening_balance: 0 });
	};

	// Handler for the "Set Balance" operation using the native prompt (for now)
	const handleSetBalance = async (
		accountId: number,
		currentBalance: number
	) => {
		const value = prompt(
			"Set current balance (EUR)",
			currentBalance.toFixed(2)
		);
		if (!value) return;
		const desired = Number(value);
		if (Number.isNaN(desired)) return alert("Please enter a valid number.");

		// Assuming update has a specific setBalance function
		await update.setBalance(accountId, desired);
		// alert("Balance adjusted"); // Removed alert for cleaner UX
	};

	// --- Loading and Empty State ---

	if (isFetching) {
		return (
			<div className="flex items-center justify-center min-h-[50dvh] text-slate-400">
				<Loader2 className="animate-spin mr-2" size={24} /> Fetching accounts...
			</div>
		);
	}

	// --- Render Component ---

	return (
		<div className="max-w-4xl mx-auto space-y-6 px-4 lg:px-0">
			{/* Header and Add Button */}
			<header className="flex items-center justify-between pb-2 border-b border-slate-800">
				<h1 className="text-3xl font-bold text-white">Your Accounts</h1>
				<Button
					onClick={() => {
						// Reset form fields when opening modal for new account
						setForm({
							name: "",
							type: "CASH",
							currency: "EUR",
							opening_balance: 0,
						});
						setOpen(true);
					}}
					className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
				>
					<Plus size={18} className="mr-1" /> New Account
				</Button>
			</header>

			{/* Account List */}
			{accountsData.length === 0 ? (
				<div className="p-12 text-center text-slate-400 bg-slate-900 rounded-xl border border-slate-800">
					<Banknote size={36} className="mx-auto mb-3 text-slate-600" />
					<p className="text-lg font-medium">No accounts found.</p>
					<p className="text-sm mt-1">
						Click "New Account" to start tracking your finances!
					</p>
				</div>
			) : (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
					{accountsData.map((a: any) => {
						const balanceColor =
							Number(a.current_balance) >= 0
								? "text-emerald-300"
								: "text-red-300";
						const icon = getAccountIcon(a.type);

						return (
							<div
								key={a.id}
								className="p-5 rounded-xl border border-slate-700 bg-slate-800 shadow-xl hover:bg-slate-700/50 transition duration-200 space-y-3"
							>
								<div className="flex items-start justify-between">
									<div className="flex items-center space-x-3">
										{icon}
										<div>
											{/* Account Name */}
											<div className="font-bold text-lg text-white">
												{a.name}
											</div>
											{/* Type and Currency */}
											<div className="text-xs text-slate-400 uppercase tracking-wider mt-0.5">
												{a.type} • {a.currency}
											</div>
										</div>
									</div>

									{/* Current Balance */}
									<div className="text-right flex-shrink-0">
										<div className={`text-xl font-extrabold ${balanceColor}`}>
											{a.currency}
											{Number(a.current_balance).toLocaleString(undefined, {
												minimumFractionDigits: 2,
												maximumFractionDigits: 2,
											})}
										</div>
									</div>
								</div>

								{/* Actions */}
								<div className="flex flex-wrap gap-2 pt-3 border-t border-slate-700">
									<Button
										variant="ghost"
										size="sm"
										onClick={() => {
											const name = prompt("Rename account", a.name);
											if (name) update.mutate({ id: a.id, name });
										}}
										className="text-blue-400 hover:bg-slate-700/70 flex items-center"
									>
										<Edit size={16} className="mr-1" /> Edit Name
									</Button>

									<Button
										variant="ghost"
										size="sm"
										onClick={() =>
											handleSetBalance(a.id, Number(a.current_balance))
										}
										className="text-yellow-400 hover:bg-slate-700/70"
									>
										Set Balance
									</Button>

									<Button
										variant="danger"
										size="sm"
										onClick={() => {
											if (
												confirm(
													`Are you sure you want to archive the account: ${a.name}?`
												)
											) {
												remove.mutate(a.id);
											}
										}}
										className="flex items-center hover:bg-red-700/80"
									>
										<Trash2 size={16} className="mr-1" /> Archive
									</Button>
								</div>
							</div>
						);
					})}
				</div>
			)}

			{/* New Account Modal (Form Styling) */}
			<Modal
				open={open}
				title="Create New Account"
				onClose={() => setOpen(false)}
			>
				<form className="space-y-4" onSubmit={handleCreateAccount}>
					<div>
						<label className="block text-sm font-medium text-slate-200 mb-1">
							Name
						</label>
						<input
							className="input w-full p-2 border border-slate-700 rounded-lg bg-slate-800 text-white focus:ring-blue-500 focus:border-blue-500"
							value={form.name}
							onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
							placeholder="e.g., Main Checking, Cash Wallet"
							required
						/>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium text-slate-200 mb-1">
								Type
							</label>
							<select
								className="input w-full p-2 border border-slate-700 rounded-lg bg-slate-800 text-white focus:ring-blue-500 focus:border-blue-500 appearance-none"
								value={form.type}
								onChange={(e) =>
									setForm((s) => ({ ...s, type: e.target.value }))
								}
							>
								<option value="CASH">💰 Cash</option>
								<option value="BANK">🏛️ Bank Account</option>
								<option value="CARD">💳 Card/Credit</option>
								<option value="WALLET">📱 Digital Wallet</option>
							</select>
						</div>
						<div>
							<label className="block text-sm font-medium text-slate-200 mb-1">
								Currency
							</label>
							<input
								className="input w-full p-2 border border-slate-700 rounded-lg bg-slate-800 text-white focus:ring-blue-500 focus:border-blue-500"
								value={form.currency}
								placeholder="e.g., EUR, USD"
								onChange={(e) =>
									setForm((s) => ({
										...s,
										currency: e.target.value.toUpperCase(),
									}))
								}
								required
							/>
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium text-slate-200 mb-1">
							Opening Balance
						</label>
						<input
							type="number"
							step="0.01"
							className="input w-full p-2 border border-slate-700 rounded-lg bg-slate-800 text-white focus:ring-blue-500 focus:border-blue-500"
							value={form.opening_balance}
							onChange={(e) =>
								setForm((s) => ({
									...s,
									opening_balance: Number(e.target.value),
								}))
							}
							required
						/>
					</div>

					<div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
						<Button
							type="button"
							variant="ghost"
							onClick={() => setOpen(false)}
							className="text-slate-400 hover:bg-slate-700/70"
						>
							Cancel
						</Button>
						<Button
							type="submit"
							className="bg-emerald-600 hover:bg-emerald-700"
						>
							Create Account
						</Button>
					</div>
				</form>
			</Modal>
		</div>
	);
}
