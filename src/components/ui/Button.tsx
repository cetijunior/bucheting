import { cn } from "./cn";

export default function Button({
	children,
	className,
	variant = "primary",
	...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
	variant?: "primary" | "ghost" | "danger";
}) {
	const base =
		"inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 font-medium active:scale-[.98] transition";
	const styles = {
		primary: "bg-brand-500 text-white hover:opacity-90",
		ghost:
			"bg-slate-800/60 text-slate-100 border border-slate-700 hover:bg-slate-800",
		danger: "bg-red-600 text-white hover:bg-red-700",
	} as const;

	return (
		<button className={cn(base, styles[variant], className)} {...props}>
			{children}
		</button>
	);
}
