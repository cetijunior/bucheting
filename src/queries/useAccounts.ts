import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

export function useAccounts() {
	const qc = useQueryClient();

	// Read from the balances view (includes current_balance)
	const list = useQuery({
		queryKey: ["accounts"],
		queryFn: async () => {
			const { data, error } = await supabase
				.from("v_account_balances")
				.select("*")
				.order("created_at", { ascending: false });
			if (error) throw error;
			return data as any[]; // includes current_balance, tx_sum
		},
	});

	const create = useMutation({
		mutationFn: async (payload: {
			name: string;
			type: "CASH" | "BANK" | "CARD" | "WALLET";
			currency?: string;
			opening_balance?: number;
		}) => {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			const { data, error } = await supabase
				.from("accounts")
				.insert({
					user_id: user!.id,
					name: payload.name,
					type: payload.type,
					currency: payload.currency ?? "EUR",
					opening_balance: payload.opening_balance ?? 0,
				})
				.select()
				.single();
			if (error) throw error;
			return data;
		},
		onSuccess: () => qc.invalidateQueries({ queryKey: ["accounts"] }),
	});

	const update = useMutation({
		mutationFn: async ({ id, ...patch }: { id: string; [k: string]: any }) => {
			const { data, error } = await supabase
				.from("accounts")
				.update(patch)
				.eq("id", id)
				.select()
				.single();
			if (error) throw error;
			return data;
		},
		onSuccess: () => qc.invalidateQueries({ queryKey: ["accounts"] }),
	}) as any;

	// Set balance by inserting an adjustment transaction
	update.setBalance = async (accountId: string, desired: number) => {
		// Get fresh current balance from the view
		const { data: row, error: viewErr } = await supabase
			.from("v_account_balances")
			.select("current_balance")
			.eq("id", accountId)
			.single();
		if (viewErr) throw viewErr;

		const current = Number(row?.current_balance ?? 0);
		const delta = Number((desired - current).toFixed(2));
		if (Math.abs(delta) < 0.005) return;

		const {
			data: { user },
		} = await supabase.auth.getUser();

		const { error: insErr } = await supabase.from("transactions").insert({
			user_id: user!.id,
			account_id: accountId,
			amount: delta,
			date: new Date().toISOString().slice(0, 10),
			payee: "Balance Adjustment",
		});
		if (insErr) throw insErr;

		await qc.invalidateQueries({ queryKey: ["transactions"] });
		await qc.invalidateQueries({ queryKey: ["accounts"] });
	};

	const remove = useMutation({
		mutationFn: async (id: string) => {
			const { error } = await supabase.from("accounts").delete().eq("id", id);
			if (error) throw error;
		},
		onSuccess: () => qc.invalidateQueries({ queryKey: ["accounts"] }),
	});

	return { list, create, update, remove };
}
