import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

export function useTransactions({ month }: { month: string }) {
	const qc = useQueryClient();

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

	const list = useQuery({
		queryKey: ["transactions", month],
		queryFn: async () => {
			const { data, error } = await supabase
				.from("transactions")
				.select("id, date, payee, amount, category_id, currency")
				.gte("date", month + "-01")
				.lte("date", month + "-31")
				.order("date", { ascending: false });
			if (error) throw error;
			return (data ?? []).map((r) => ({
				id: r.id,
				date: r.date as any,
				payee: r.payee,
				amount: r.amount as any,
				category: "",
				currency: r.currency,
			}));
		},
	});

	const create = useMutation({
		mutationFn: async (payload: {
			account_id?: string;
			amount: number;
			date: string;
			payee?: string;
			category_id?: string | null;
		}) => {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			const accountId = payload.account_id ?? firstAccount.data;
			if (!accountId) throw new Error("Create an account first");
			const { error } = await supabase.from("transactions").insert({
				user_id: user!.id,
				account_id: accountId,
				amount: payload.amount,
				date: payload.date,
				payee: payload.payee ?? null,
				category_id: payload.category_id ?? null,
			});
			if (error) throw error;
		},
		onSuccess: () => qc.invalidateQueries({ queryKey: ["transactions"] }),
	});

	return { list, create, firstAccountId: firstAccount.data };
}
