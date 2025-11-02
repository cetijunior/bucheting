import { useNavigate } from "react-router-dom";

export default function Settings() {
	const nav = useNavigate();
	const email = localStorage.getItem("demo_email") || "you@example.com";

	return (
		<div className="max-w-2xl mx-auto space-y-4">
			<section className="card p-4">
				<h2 className="font-medium mb-2">Profile</h2>
				<div className="text-sm text-slate-300">
					Signed in as <span className="font-medium">{email}</span>
				</div>
			</section>

			<section className="card p-4">
				<h2 className="font-medium mb-2">Danger Zone</h2>
				<button
					className="btn bg-red-600"
					onClick={() => {
						localStorage.removeItem("demo_authed");
						localStorage.removeItem("demo_email");
						nav("/login");
					}}
				>
					Sign out
				</button>
			</section>
		</div>
	);
}
