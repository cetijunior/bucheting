import { Outlet, useLocation, Link } from "react-router-dom";
import TopBar from "./TopBar";
import { Home, List, Wallet, Settings as Cog } from "lucide-react";
import type { JSX } from "react";

export default function Shell() {
	const { pathname } = useLocation();
	return (
		<div className="min-h-dvh grid grid-rows-[auto_1fr_auto]">
			<TopBar />
			<main className="container-px py-3">
				<Outlet />
			</main>
			{/* Mobile bottom nav */}
			<nav className="sticky bottom-0 bg-slate-900/80 backdrop-blur border-t border-slate-800">
				<div className="mx-auto max-w-md grid grid-cols-4">
					<Tab
						to="/"
						current={pathname === "/"}
						icon={<Home size={22} />}
						label="Home"
					/>
					<Tab
						to="/transactions"
						current={pathname.startsWith("/transactions")}
						icon={<List size={22} />}
						label="Txns"
					/>
					<Tab
						to="/accounts"
						current={pathname.startsWith("/accounts")}
						icon={<Wallet size={22} />}
						label="Accounts"
					/>
					<Tab
						to="/settings"
						current={pathname.startsWith("/settings")}
						icon={<Cog size={22} />}
						label="Settings"
					/>
				</div>
			</nav>
		</div>
	);
}

function Tab({
	to,
	current,
	icon,
	label,
}: {
	to: string;
	current: boolean;
	icon: JSX.Element;
	label: string;
}) {
	return (
		<Link
			to={to}
			className={
				"flex flex-col items-center py-2 text-sm " +
				(current ? "text-brand-300" : "text-slate-300")
			}
		>
			{icon}
			<span className="text-[11px]">{label}</span>
		</Link>
	);
}
