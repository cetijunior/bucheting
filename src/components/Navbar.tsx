import { useState, type JSX } from "react";
import { Outlet, useLocation, Link } from "react-router-dom";
import { Home, List, Wallet, Settings as Cog, Menu, X } from "lucide-react"; // Added Menu and X icons

// --- 1. Top Bar Component Logic (Integrated) ---

// Placeholder components for a real application
const Logo = () => (
	<Link to="/" className="text-xl font-bold tracking-tight text-white">
		Bucheting
	</Link>
);
const DesktopNavLink = ({
	to,
	children,
}: {
	to: string;
	children: React.ReactNode;
}) => (
	<Link
		to={to}
		className="text-sm font-medium text-slate-300 hover:text-white transition-colors duration-200"
	>
		{children}
	</Link>
);
const MobileNavLink = ({
	to,
	children,
	onClick,
}: {
	to: string;
	children: React.ReactNode;
	onClick: () => void;
}) => (
	<Link
		to={to}
		onClick={onClick}
		className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:bg-gray-800 hover:text-white transition-colors"
	>
		{children}
	</Link>
);

function AppTopBar() {
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	// Placeholder for user state (replace with actual user context/state)
	const isAuthenticated = true;

	return (
		<header className="sticky top-0 z-50 bg-gray-900 border-b border-gray-700/80 backdrop-blur-sm shadow-lg">
			{/* Desktop and Mobile Container */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
				{/* Logo/Branding */}
				<div className="flex-shrink-0">
					<Logo />
				</div>

				{/* Desktop Navigation (Hidden on mobile) */}
				<nav className="hidden lg:flex lg:space-x-8">
					<DesktopNavLink to="/">Home</DesktopNavLink>
					<DesktopNavLink to="/transactions">Transactions</DesktopNavLink>
					<DesktopNavLink to="/accounts">Accounts</DesktopNavLink>
				</nav>

				{/* User Actions/CTA (Responsive) */}
				<div className="flex items-center space-x-4">
					<div className="hidden lg:block">
						<DesktopNavLink to="/settings">Settings</DesktopNavLink>
					</div>

					{/* Mobile Menu Button (Hamburger) */}
					<button
						className="p-2 lg:hidden text-slate-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 rounded-md"
						onClick={() => setIsMenuOpen(!isMenuOpen)}
						aria-expanded={isMenuOpen}
						aria-controls="mobile-menu"
					>
						{isMenuOpen ? (
							<X className="h-6 w-6" />
						) : (
							<Menu className="h-6 w-6" />
						)}
					</button>
				</div>
			</div>

			{/* Mobile Menu Panel (Hidden on desktop) */}
			{isMenuOpen && (
				<div
					className="lg:hidden bg-gray-900 border-t border-gray-800"
					id="mobile-menu"
				>
					<div className="px-2 pt-2 pb-3 space-y-1">
						<MobileNavLink to="/" onClick={() => setIsMenuOpen(false)}>
							Home
						</MobileNavLink>
						<MobileNavLink
							to="/transactions"
							onClick={() => setIsMenuOpen(false)}
						>
							Transactions
						</MobileNavLink>
						<MobileNavLink to="/accounts" onClick={() => setIsMenuOpen(false)}>
							Accounts
						</MobileNavLink>
						<MobileNavLink to="/settings" onClick={() => setIsMenuOpen(false)}>
							Settings
						</MobileNavLink>
						{isAuthenticated && (
							<button className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-400 hover:bg-gray-800 transition-colors">
								Sign Out
							</button>
						)}
						{!isAuthenticated && (
							<MobileNavLink to="/login" onClick={() => setIsMenuOpen(false)}>
								Sign In
							</MobileNavLink>
						)}
					</div>
				</div>
			)}
		</header>
	);
}

// --- 2. Mobile Tab Component Logic (Original) ---

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
	// Enhanced styling for better active state visualization
	const activeClasses = current
		? "text-blue-500 border-t-2 border-blue-500 bg-gray-800/50"
		: "text-slate-400 hover:text-white hover:bg-slate-800/30";

	return (
		<Link
			to={to}
			className={`flex flex-col items-center justify-center py-2 px-1 text-xs font-medium transition-colors ${activeClasses}`}
		>
			<div className="mb-0.5">{icon}</div>
			<span className="text-[10px] sm:text-xs">{label}</span>
		</Link>
	);
}

// --- 3. Shell Component (Combined) ---

export default function Navbar() {
	const { pathname } = useLocation();

	return (
		// The main grid layout
		<div className="min-h-dvh grid grid-rows-[auto_1fr_auto]">
			{/* Top Bar (Visible on all screen sizes, handles desktop nav) */}
			<AppTopBar />

			{/* Main Content Area */}
			{/* On desktop, the container-px centers the content */}
			<main className="container-px py-4 lg:py-6">
				<Outlet />
			</main>

			{/* Mobile Bottom Navigation (Hidden on large screens: lg:hidden) */}
			<nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-gray-900/90 backdrop-blur border-t border-gray-700 shadow-2xl">
				<div className="mx-auto max-w-md grid grid-cols-4 h-14">
					<Tab
						to="/"
						current={pathname === "/"}
						icon={<Home size={20} />}
						label="Home"
					/>
					<Tab
						to="/transactions"
						current={pathname.startsWith("/transactions")}
						icon={<List size={20} />}
						label="Txns"
					/>
					<Tab
						to="/accounts"
						current={pathname.startsWith("/accounts")}
						icon={<Wallet size={20} />}
						label="Accounts"
					/>
					<Tab
						to="/settings"
						current={pathname.startsWith("/settings")}
						icon={<Cog size={20} />}
						label="Settings"
					/>
				</div>
			</nav>
		</div>
	);
}
