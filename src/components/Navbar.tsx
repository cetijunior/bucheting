import { type JSX } from "react";
import { Outlet, useLocation, Link } from "react-router-dom";
import {
	Home,
	List,
	Wallet,
	Settings as Cog,
	// Menu,
	// X,
	// LogOut,
} from "lucide-react";

// --- 1. Top Bar Component Logic (Optimized) ---

// Placeholder components for a real application
const Logo = () => (
	<Link
		to="/"
		className="text-xl font-bold tracking-tight text-white hover:text-blue-400 transition-colors"
	>
		Bucheting
	</Link>
);

// Navigation Link Component
const NavLink = ({
	to,
	children,
}: {
	to: string;
	children: React.ReactNode;
}) => {
	const { pathname } = useLocation();
	// Check for exact match for '/', or startsWith for others
	const isActive = pathname === to || (to !== "/" && pathname.startsWith(to));

	// Styling for active state
	const activeClass = isActive
		? "text-blue-400 border-b-2 border-blue-400"
		: "text-slate-300 hover:text-white border-b-2 border-transparent hover:border-slate-500";

	return (
		<Link
			to={to}
			// Combine common styles with dynamic active/inactive styles
			className={`text-sm font-medium transition-colors duration-200 h-full flex items-center ${activeClass}`}
		>
			{children}
		</Link>
	);
};

function AppTopBar() {
	// const [isMenuOpen, setIsMenuOpen] = useState(false);
	// const isAuthenticated = true; // Placeholder

	// We can simplify the mobile menu since the bottom bar handles primary navigation.
	// Let's keep the menu button only for a "More/Sign Out" action, or simplify the whole TopBar for mobile.
	// For this implementation, I will remove the redundant mobile menu and rely solely on the bottom bar for mobile nav.
	// The hamburger button is no longer needed since its links are in the bottom bar.

	return (
		<header className="sticky top-0 z-50 bg-gray-900 border-b border-gray-700/80 backdrop-blur-sm shadow-lg">
			{/* Desktop and Mobile Container */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
				{/* Logo/Branding */}
				<div className="shrink-0">
					<Logo />
				</div>

				{/* Desktop Navigation (Hidden on mobile) */}
				<nav className="hidden lg:flex lg:space-x-8 h-full">
					<NavLink to="/">Home</NavLink>
					<NavLink to="/transactions">Transactions</NavLink>
					<NavLink to="/accounts">Accounts</NavLink>
					<NavLink to="/settings">Settings</NavLink>
				</nav>

				{/* Placeholder for User Icon / CTA - Removed the Hamburger to avoid duplication with the bottom nav */}
				<div className="flex items-center space-x-4 lg:hidden">
					{/* Optionally, keep a simplified menu for actions like Sign Out, but removing it for clean mobile nav */}
				</div>
			</div>

			{/* Note: The full Mobile Menu Panel is removed here since the bottom nav bar provides the main links. */}
		</header>
	);
}

// --- 2. Mobile Tab Component Logic (Unchanged, but now necessary padding is added) ---

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

// --- 3. Shell Component (Combined and Fixed) ---

export default function Navbar() {
	const { pathname } = useLocation();

	return (
		// The main grid layout
		<div className="min-h-dvh grid grid-rows-[auto_1fr]">
			{/* Changed from [auto_1fr_auto] to [auto_1fr] as the bottom nav is fixed/outside the flow */}

			{/* Top Bar (Visible on all screen sizes, handles desktop nav) */}
			<AppTopBar />

			{/* 🍎 Main Content Area - KEY FIX IS THE pb-14 and lg:pb-6 (resets padding for desktop) */}
			<main className="container-px py-4 pb-20 lg:py-6 lg:pb-6">
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
