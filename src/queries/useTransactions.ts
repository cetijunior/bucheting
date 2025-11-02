import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

function monthBounds(ym: string) {
	// ym is "YYYY-MM"
	const [y, m] = ym.split("-").map(Number);
	const start = `${ym}-01`;
	const nextMonth =
		m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, "0")}`;
	const endExclusive = `${nextMonth}-01`;
	return { start, endExclusive };
}

type TxnCreate = {
	account_id?: string;
	amount: number;
	date: string; // 'YYYY-MM-DD'
	payee?: string;
	category_id?: string | null;
	note?: string | null;
};

type TxnUpdate = {
	id: string;
	patch: Partial<TxnCreate>;
};

export function useTransactions({ month }: { month: string }) {
	const qc = useQueryClient();

	// Used as a fallback when creating a txn without explicit account_id
	const firstAccount = useQuery({
		queryKey: ["accounts", "first"],
		queryFn: async () => {
			const { data, error } = await supabase
				.from("accounts")
				.select("id")
				.limit(1);
			if (error) throw error;
			return data?.[0]?.id as string | undefined;
		},
	});

	// List transactions within the month (start <= date < nextMonthStart)
	const list = useQuery({
		queryKey: ["transactions", month],
		queryFn: async () => {
			const { start, endExclusive } = monthBounds(month);
			const { data, error } = await supabase
				.from("transactions")
				.select(
					"id, date, payee, amount, account_id, category_id, currency, note"
				)
				.gte("date", start)
				.lt("date", endExclusive)
				.order("date", { ascending: false });
			if (error) throw error;
			return (data ?? []).map((r: any) => ({
				id: r.id,
				date: r.date as string,
				payee: r.payee as string | null,
				amount: r.amount as number,
				category: "", // placeholder until categories table/UI added
				currency: r.currency as string | null,
				account_id: r.account_id as string,
				category_id: r.category_id as string | null,
				note: r.note as string | null,
			}));
		},
	});

	// Create
	const create = useMutation({
		mutationFn: async (payload: TxnCreate) => {
			const {
				data: { user },
			} = await supabase.auth.getUser();

			// Prefer explicit payload account, fall back to first account
			const fallback = firstAccount.data;
			const accountId =
				payload.account_id && payload.account_id.trim() !== ""
					? payload.account_id
					: fallback ?? "";

			if (!accountId) {
				throw new Error("No account selected. Create/select an account first.");
			}

			const { error } = await supabase.from("transactions").insert({
				user_id: user!.id,
				account_id: accountId,
				amount: payload.amount,
				date: payload.date,
				payee: payload.payee ?? null,
				category_id: payload.category_id ?? null,
				note: payload.note ?? null,
			});

			if (error) throw error;
		},
		onSuccess: () =>
			qc.invalidateQueries({
				queryKey: ["transactions"],
			}),
	});

	// Update
	const update = useMutation({
		mutationFn: async ({ id, patch }: TxnUpdate) => {
			const payload: any = { ...patch };

			// If account_id comes through empty string, drop it to avoid uuid cast errors
			if (payload.account_id && String(payload.account_id).trim() === "") {
				delete payload.account_id;
			}

			const { error } = await supabase
				.from("transactions")
				.update(payload)
				.eq("id", id);
			if (error) throw error;
		},
		onSuccess: () =>
			qc.invalidateQueries({
				queryKey: ["transactions"],
			}),
	});

	// Delete
	const remove = useMutation({
		mutationFn: async (id: string) => {
			const { error } = await supabase
				.from("transactions")
				.delete()
				.eq("id", id);
			if (error) throw error;
		},
		onSuccess: () =>
			qc.invalidateQueries({
				queryKey: ["transactions"],
			}),
	});

	return { list, create, update, remove, firstAccountId: firstAccount.data };
}
