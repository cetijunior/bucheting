import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import Button from "../components/ui/Button";
import { useAccounts } from "../queries/useAccounts";
import {
	User,
	Settings as SettingsIcon,
	DollarSign,
	Calendar,
	LogOut,
	Loader2,
	Save,
} from "lucide-react";

type Prefs = {
	id?: string;
	base_currency: string;
	monthly_income: number;
	monthly_allowance: number;
	default_account_id: string | null;
	week_starts_on: "MON" | "SUN";
};

export default function Settings() {
	const nav = useNavigate();
	const { list: accounts } = useAccounts();

	const [email, setEmail] = useState<string>("");
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [prefId, setPrefId] = useState<string | null>(null);

	const [form, setForm] = useState<Prefs>({
		base_currency: "EUR",
		monthly_income: 0,
		monthly_allowance: 0,
		default_account_id: null,
		week_starts_on: "MON",
	});

	const accountOptions = useMemo(
		() => (accounts.data || []).map((a: any) => ({ id: a.id, name: a.name })),
		[accounts.data]
	);

	// Load user + preferences
	useEffect(() => {
		(async () => {
			setLoading(true);

			const {
				data: { user },
				error: userErr,
			} = await supabase.auth.getUser();
			if (userErr) {
				console.error(userErr);
			}
			setEmail(user?.email ?? "");

			if (user?.id) {
				const { data, error } = await supabase
					.from("preferences")
					.select("*")
					.eq("user_id", user.id)
					.limit(1)
					.maybeSingle();

				if (error) {
					console.error(error);
				} else if (data) {
					setPrefId(data.id);
					setForm({
						base_currency: data.base_currency ?? "EUR",
						monthly_income: Number(data.monthly_income ?? 0),
						monthly_allowance: Number(data.monthly_allowance ?? 0),
						default_account_id: data.default_account_id ?? null,
						week_starts_on: (data.week_starts_on as "MON" | "SUN") ?? "MON",
					});
				}
			}

			setLoading(false);
		})();
	}, []);

	async function save() {
		setSaving(true);
		const {
			data: { user },
		} = await supabase.auth.getUser();
		if (!user) {
			setSaving(false);
			alert("Not signed in.");
			return;
		}

		const payload = {
			base_currency: form.base_currency,
			monthly_income: form.monthly_income,
			monthly_allowance: form.monthly_allowance,
			default_account_id: form.default_account_id,
			week_starts_on: form.week_starts_on,
		};

		if (prefId) {
			const { error } = await supabase
				.from("preferences")
				.update(payload)
				.eq("id", prefId);
			if (error) alert(error.message);
			else alert("Settings saved successfully.");
		} else {
			const { data, error } = await supabase
				.from("preferences")
				.insert({ ...payload, user_id: user.id })
				.select()
				.single();
			if (error) alert(error.message);
			else {
				setPrefId(data.id);
				alert("Settings saved successfully.");
			}
		}
		setSaving(false);
	}

	async function signOut() {
		await supabase.auth.signOut();
		nav("/login");
	}

	if (loading) {
		return (
			<div className="max-w-2xl mx-auto space-y-4 px-4 lg:px-0">
				<section className="bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-700">
					<div className="flex items-center text-slate-400">
						<Loader2 className="animate-spin mr-3" size={20} />
						<span className="font-medium">Loading settings…</span>
					</div>
				</section>
			</div>
		);
	}

	return (
		<div className="max-w-3xl mx-auto space-y-6 px-4 lg:px-0">
			<h1 className="text-3xl font-bold text-white flex items-center mb-4">
				<SettingsIcon size={28} className="mr-3 text-blue-400" />
				Settings
			</h1>
			{/* Profile */}
			<section className="bg-slate-900 rounded-xl shadow-lg p-5 border border-slate-800">
				<div className="flex items-center mb-3">
					<User size={20} className="mr-2 text-slate-400" />
					<h2 className="text-xl font-semibold text-white">Profile</h2>
				</div>
				<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-t border-slate-800 pt-3">
					<div className="text-sm text-slate-300">
						Signed in as{" "}
						<span className="font-medium text-blue-300">{email || "—"}</span>
					</div>
					<Button
						variant="ghost"
						onClick={signOut}
						className="mt-3 sm:mt-0 text-red-400 hover:bg-slate-800"
					>
						Sign out
					</Button>
				</div>
			</section>

			{/* Preferences Form */}
			<section className="bg-slate-900 rounded-xl shadow-lg p-5 border border-slate-800 space-y-5">
				<div className="flex items-center">
					<SettingsIcon size={20} className="mr-2 text-slate-400" />
					<h2 className="text-xl font-semibold text-white">
						Application Preferences
					</h2>
				</div>

				{/* Grid Container for Inputs */}
				<div className="space-y-4">
					<div className="grid sm:grid-cols-3 gap-4">
						{/* Base Currency */}
						<div>
							<label className="block text-sm font-medium text-slate-300 mb-1">
								Base Currency
							</label>
							<input
								className="input w-full p-2 border border-slate-700 rounded-lg bg-slate-800 text-white focus:ring-blue-500 focus:border-blue-500 transition-colors"
								value={form.base_currency}
								onChange={(e) =>
									setForm((s) => ({
										...s,
										base_currency: e.target.value.toUpperCase(),
									}))
								}
								placeholder="EUR"
								maxLength={3}
							/>
						</div>

						{/* Monthly Income */}
						<div>
							<label className="block text-sm font-medium text-slate-300 mb-1 flex items-center">
								<DollarSign size={14} className="mr-1 text-emerald-400" />{" "}
								Monthly Income ({form.base_currency})
							</label>
							<input
								type="number"
								step="0.01"
								className="input w-full p-2 border border-slate-700 rounded-lg bg-slate-800 text-white focus:ring-blue-500 focus:border-blue-500 transition-colors"
								value={form.monthly_income}
								onChange={(e) =>
									setForm((s) => ({
										...s,
										monthly_income: Number(e.target.value),
									}))
								}
							/>
						</div>

						{/* Monthly Allowance */}
						<div>
							<label className="block text-sm font-medium text-slate-300 mb-1 flex items-center">
								<DollarSign size={14} className="mr-1 text-red-400" /> Monthly
								Allowance ({form.base_currency})
							</label>
							<input
								type="number"
								step="0.01"
								className="input w-full p-2 border border-slate-700 rounded-lg bg-slate-800 text-white focus:ring-blue-500 focus:border-blue-500 transition-colors"
								value={form.monthly_allowance}
								onChange={(e) =>
									setForm((s) => ({
										...s,
										monthly_allowance: Number(e.target.value),
									}))
								}
							/>
						</div>
					</div>

					<div className="grid sm:grid-cols-2 gap-4">
						{/* Default Account */}
						<div>
							<label className="block text-sm font-medium text-slate-300 mb-1">
								Default Transaction Account
							</label>
							<select
								className="input w-full p-2 border border-slate-700 rounded-lg bg-slate-800 text-white focus:ring-blue-500 focus:border-blue-500 appearance-none transition-colors"
								value={form.default_account_id ?? ""}
								onChange={(e) =>
									setForm((s) => ({
										...s,
										default_account_id: e.target.value || null,
									}))
								}
							>
								<option value="">— No Default Account —</option>
								{accountOptions.map((a) => (
									<option key={a.id} value={a.id}>
										{a.name}
									</option>
								))}
							</select>
							{!accountOptions.length && (
								<p className="text-xs text-red-500 mt-1">
									Create an account first to set a default.
								</p>
							)}
						</div>

						{/* Week Starts On */}
						<div>
							<label className="block text-sm font-medium text-slate-300 mb-1 flex items-center">
								<Calendar size={14} className="mr-1 text-indigo-400" /> Week
								Starts On
							</label>
							<div className="mt-1 flex items-center gap-3">
								<Button
									type="button"
									size="sm"
									variant={form.week_starts_on === "MON" ? "primary" : "ghost"}
									onClick={() =>
										setForm((s) => ({ ...s, week_starts_on: "MON" }))
									}
									className={`w-1/2 justify-center ${
										form.week_starts_on === "MON"
											? "bg-blue-600 hover:bg-blue-700"
											: "text-slate-300 hover:bg-slate-700"
									}`}
								>
									Monday
								</Button>
								<Button
									type="button"
									size="sm"
									variant={form.week_starts_on === "SUN" ? "primary" : "ghost"}
									onClick={() =>
										setForm((s) => ({ ...s, week_starts_on: "SUN" }))
									}
									className={`w-1/2 justify-center ${
										form.week_starts_on === "SUN"
											? "bg-blue-600 hover:bg-blue-700"
											: "text-slate-300 hover:bg-slate-700"
									}`}
								>
									Sunday
								</Button>
							</div>
						</div>
					</div>
				</div>

				{/* Save Button */}
				<div className="flex justify-end pt-4 border-t border-slate-800">
					<Button
						onClick={save}
						disabled={saving}
						className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center"
					>
						{saving ? (
							<Loader2 size={20} className="animate-spin mr-2" />
						) : (
							<Save size={20} className="mr-2" />
						)}
						{saving ? "Saving…" : "Save Changes"}
					</Button>
				</div>
			</section>
			{/* Danger Zone */}
			<section className="bg-slate-900 rounded-xl shadow-lg p-5 border border-red-800/50">
				<div className="flex items-center">
					<LogOut size={20} className="mr-2 text-red-400" />
					<h2 className="text-xl font-semibold text-red-400">Danger Zone</h2>
				</div>
				<p className="text-sm text-slate-400 mt-2 mb-4">
					Sign out of your account on this device. You will be redirected to the
					login page.
				</p>
				<Button
					variant="danger"
					onClick={signOut}
					className="bg-red-600 hover:bg-red-700 text-white"
				>
					Sign Out Now
				</Button>
			</section>
		</div>
	);
}
