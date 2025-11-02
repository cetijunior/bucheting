import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function Login() {
	const [email, setEmail] = useState("");
	const [sending, setSending] = useState(false);
	const [sent, setSent] = useState(false);
	const nav = useNavigate();

	const signInMagic = async (e: React.FormEvent) => {
		e.preventDefault();
		setSending(true);
		const { error } = await supabase.auth.signInWithOtp({
			email,
			options: { emailRedirectTo: window.location.origin },
		});
		setSending(false);
		if (error) alert(error.message);
		else setSent(true);
	};

	return (
		<div className="min-h-dvh grid place-items-center container-px">
			<div className="card max-w-sm w-full p-5">
				<h1 className="text-xl font-semibold mb-2">Welcome</h1>
				{!sent ? (
					<>
						<p className="text-sm text-slate-400 mb-4">
							Enter your email to receive a magic link.
						</p>
						<form onSubmit={signInMagic} className="space-y-3">
							<div>
								<label className="label">Email</label>
								<input
									className="input mt-1"
									type="email"
									placeholder="you@example.com"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									required
								/>
							</div>
							<button
								className="btn w-full disabled:opacity-60"
								type="submit"
								disabled={sending}
							>
								{sending ? "Sending…" : "Send magic link"}
							</button>
						</form>
					</>
				) : (
					<>
						<p className="text-sm text-slate-300 mb-3">
							Check <b>{email}</b> for your login link.
						</p>
						<button className="btn w-full" onClick={() => nav("/")}>
							Back to app
						</button>
					</>
				)}
			</div>
		</div>
	);
}
