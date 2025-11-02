import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function Login() {
	const [email, setEmail] = useState("");
	const [sending, setSending] = useState(false);
	const [sent, setSent] = useState(false);
	const [error, setError] = useState<string | null>(null); // New state for error messages
	const nav = useNavigate();

	// Helper to send the magic link
	const sendMagicLink = async () => {
		setError(null); // Clear previous errors
		setSending(true);
		const { error } = await supabase.auth.signInWithOtp({
			email,
			options: { emailRedirectTo: window.location.origin },
		});
		setSending(false);

		if (error) {
			// Display error message directly in the UI
			setError(error.message);
		} else {
			setSent(true);
		}
	};

	const signInMagic = async (e: React.FormEvent) => {
		e.preventDefault();
		await sendMagicLink();
	};

	const handleResend = async () => {
		setSent(false); // Go back to the form state temporarily for resend
		await sendMagicLink();
	};

	// --- UI Structure and Rendering ---
	return (
		<div className="min-h-dvh grid place-items-center container-px">
			<div className="card max-w-sm w-full p-5 bg-white shadow-xl rounded-lg">
				<h1 className="text-2xl font-bold mb-4 text-center text-gray-800">
					Sign In
				</h1>

				{/* 1. Error Message Display */}
				{error && (
					<div
						className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
						role="alert"
					>
						<strong className="font-bold">Error:</strong>
						<span className="block sm:inline ml-1">{error}</span>
						<span
							className="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer"
							onClick={() => setError(null)} // Allows user to dismiss the error
						>
							&times;
						</span>
					</div>
				)}

				{!sent ? (
					/* 2. Initial Form: Enter Email */
					<>
						<p className="text-sm text-gray-600 mb-6 text-center">
							Enter your email to receive a **secure, password-less login
							link.**
						</p>
						<form onSubmit={signInMagic} className="space-y-4">
							<div>
								<label
									htmlFor="email"
									className="block text-sm font-medium text-gray-700 mb-1"
								>
									Email Address
								</label>
								<input
									id="email"
									className="input w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
									type="email"
									placeholder="you@example.com"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									required
									disabled={sending}
								/>
							</div>
							<button
								className="btn w-full bg-blue-600 text-white p-3 rounded-md font-semibold hover:bg-blue-700 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
								type="submit"
								disabled={sending || email.length === 0} // Disable if email is empty
							>
								{sending ? (
									<span className="flex items-center justify-center">
										{/* Simple spinner animation could go here */}
										Sending Link...
									</span>
								) : (
									"Send Magic Link"
								)}
							</button>
						</form>
					</>
				) : (
					/* 3. Confirmation Screen: Link Sent */
					<div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
						<p className="text-2xl mb-2">📬</p>
						<h2 className="text-lg font-semibold text-green-700 mb-2">
							Check Your Email!
						</h2>
						<p className="text-sm text-gray-700 mb-4">
							We've sent a login link to: <br /> **{email}**.
						</p>
						<p className="text-xs text-gray-500 mb-6">
							*The link may take a moment to arrive and may be in your spam
							folder.*
						</p>

						{/* Clear Call-to-Action */}
						<button
							className="btn w-full bg-blue-600 text-white p-3 rounded-md font-semibold hover:bg-blue-700 transition duration-150 mb-3"
							onClick={() => nav("/")}
						>
							Continue to App
						</button>

						{/* Resend Option */}
						<button
							className="text-sm text-blue-600 hover:text-blue-800 transition duration-150"
							onClick={handleResend}
							disabled={sending} // Disable during the resend process
						>
							{sending ? "Resending..." : "Didn't receive it? Resend link"}
						</button>
					</div>
				)}
			</div>
		</div>
	);
}
