import { useEffect, useMemo, useState } from "react";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";

type Account = { id: string; name: string };

// 🚀 FIX: Updated Props to correctly allow 'null' for fields that can be null
type Props = {
	open: boolean;
	title: string;
	accounts: Account[];
	initial?: {
		id?: string;
		account_id?: string;
		amount?: number; // signed amount (neg for expense, pos for income)
		date?: string;
		// 🔑 FIX: payee must accept string, null, or undefined to match Transaction type
		payee?: string | null;
		category_id?: string | null;
		// 🔑 FIX: note must accept string, null, or undefined
		note?: string | null;
	};
	onClose: () => void;
	onSubmit: (payload: {
		id?: string;
		account_id: string;
		amount: number; // signed
		date: string;
		payee?: string | null; // Allowing null in submit payload too for consistency
		category_id?: string | null;
		note?: string | null; // Allowing null in submit payload too for consistency
	}) => Promise<void> | void;
};

export default function TransactionModal({
	open,
	title,
	accounts,
	initial,
	onClose,
	onSubmit,
}: Props) {
	const today = new Date().toISOString().slice(0, 10);

	const [kind, setKind] = useState<"EXPENSE" | "INCOME">(
		initial && typeof initial.amount === "number" && initial.amount > 0
			? "INCOME"
			: "EXPENSE"
	);

	const [form, setForm] = useState({
		id: initial?.id,
		account_id: initial?.account_id || accounts[0]?.id || "",
		amountAbs: Math.abs(initial?.amount ?? 0),
		date: initial?.date || today,
		// Using `|| ""` ensures the input value is a string, preventing control flow issues
		payee: initial?.payee || "",
		category_id: initial?.category_id ?? null,
		note: initial?.note || "",
	});

	useEffect(() => {
		setKind(
			initial && typeof initial.amount === "number" && initial.amount > 0
				? "INCOME"
				: "EXPENSE"
		);
		setForm({
			id: initial?.id,
			account_id: initial?.account_id || accounts[0]?.id || "",
			amountAbs: Math.abs(initial?.amount ?? 0),
			date: initial?.date || today,
			// Ensure payee is initialized to a string if null
			payee: initial?.payee || "",
			category_id: initial?.category_id ?? null,
			note: initial?.note || "",
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [initial, open, accounts.length]);

	const canSave = useMemo(
		() =>
			accounts.length > 0 &&
			form.account_id &&
			form.account_id.trim() !== "" &&
			!Number.isNaN(form.amountAbs) &&
			form.date,
		[accounts.length, form.account_id, form.amountAbs, form.date]
	);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!canSave) return;
		const signedAmount =
			kind === "EXPENSE" ? -Math.abs(form.amountAbs) : Math.abs(form.amountAbs);

		// Final cleanup for submission: if string is empty, send null/undefined.
		// For payee and note, sending `null` is often better for database consistency
		// than relying on the backend to convert `undefined` or an empty string.

		await onSubmit({
			id: form.id,
			account_id: form.account_id,
			amount: signedAmount,
			date: form.date,
			// Convert empty string from input to null for data consistency
			payee: form.payee.trim() === "" ? null : form.payee,
			category_id: form.category_id ?? null, // keep as is
			// Convert empty string from input to null for data consistency
			note: form.note.trim() === "" ? null : form.note,
		});
	}

	return (
		<Modal open={open} title={title} onClose={onClose}>
			<form className="space-y-3" onSubmit={handleSubmit}>
				{/* Kind toggle */}
				<div className="flex gap-2">
					<Button
						type="button"
						variant={kind === "EXPENSE" ? "primary" : "ghost"}
						onClick={() => setKind("EXPENSE")}
					>
						Expense
					</Button>
					<Button
						type="button"
						variant={kind === "INCOME" ? "primary" : "ghost"}
						onClick={() => setKind("INCOME")}
					>
						Income
					</Button>
				</div>

				<div className="grid grid-cols-2 gap-2">
					<div>
						<label className="label">Account</label>
						<select
							className="input mt-1"
							value={form.account_id}
							onChange={(e) =>
								setForm((s) => ({ ...s, account_id: e.target.value }))
							}
							required
						>
							{accounts.length === 0 ? (
								<option value="">No accounts — create one first</option>
							) : (
								accounts.map((a) => (
									<option key={a.id} value={a.id}>
										{a.name}
									</option>
								))
							)}
						</select>
					</div>
					<div>
						<label className="label">Date</label>
						<input
							type="date"
							className="input mt-1"
							value={form.date}
							onChange={(e) => setForm((s) => ({ ...s, date: e.target.value }))}
							required
						/>
					</div>
				</div>

				<div className="grid grid-cols-2 gap-2">
					<div>
						<label className="label">
							Amount (€){kind === "EXPENSE" ? " (will be negative)" : ""}
						</label>
						<input
							type="number"
							step="0.01"
							className="input mt-1"
							value={form.amountAbs}
							onChange={(e) =>
								setForm((s) => ({ ...s, amountAbs: Number(e.target.value) }))
							}
							required
						/>
					</div>
					<div>
						<label className="label">Payee</label>
						<input
							className="input mt-1"
							value={form.payee}
							onChange={(e) =>
								setForm((s) => ({ ...s, payee: e.target.value }))
							}
							placeholder={
								kind === "EXPENSE"
									? "e.g., Market Lami"
									: "e.g., Client payment"
							}
						/>
					</div>
				</div>

				<div>
					<label className="label">Note (optional)</label>
					<input
						className="input mt-1"
						value={form.note}
						onChange={(e) => setForm((s) => ({ ...s, note: e.target.value }))}
						placeholder="Add a note"
					/>
				</div>

				<div className="flex justify-end gap-2">
					<Button type="button" variant="ghost" onClick={onClose}>
						Cancel
					</Button>
					<Button type="submit" disabled={!canSave}>
						Save
					</Button>
				</div>
			</form>
		</Modal>
	);
}
