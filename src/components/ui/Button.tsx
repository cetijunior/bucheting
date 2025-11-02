import type { ButtonHTMLAttributes } from "react";
import { cn } from "./cn";

export default function Button({
	children,
	className,
	variant = "primary",
	// 1. ADD THE 'size' PROP HERE
	size = "md", // Set a default size
	...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
	variant?: "primary" | "ghost" | "danger";
	// 2. DEFINE THE TYPE FOR THE 'size' PROP
	size?: "sm" | "md" | "lg";
}) {
	// 3. UPDATE THE 'base' CLASS FOR DYNAMIC SIZING
	// Removed specific padding (px-4 py-2) from 'base' class.
	const base =
		"inline-flex items-center justify-center gap-2 rounded-xl font-medium active:scale-[.98] transition";

	const styles = {
		primary: "bg-brand-500 text-white hover:opacity-90",
		ghost:
			"bg-slate-800/60 text-slate-100 border border-slate-700 hover:bg-slate-800",
		danger: "bg-red-600 text-white hover:bg-red-700",
	} as const;

	// 4. DEFINE SIZE-SPECIFIC STYLES
	const sizeStyles = {
		sm: "px-3 py-1.5 text-sm", // Smaller padding and font
		md: "px-4 py-2", // Medium (current default) padding
		lg: "px-6 py-3 text-lg", // Larger padding and font
	} as const;

	return (
		<button
			className={cn(base, styles[variant], sizeStyles[size], className)}
			{...props}
		>
			{children}
		</button>
	);
}
