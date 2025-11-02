import { useEffect } from "react";

type ModalProps = {
	open: boolean;
	title?: string;
	children: React.ReactNode;
	onClose: () => void;
	size?: "sm" | "md" | "lg";
};

/**
 * Generic modal component.
 * Usage:
 * <Modal open={open} title="Add Transaction" onClose={()=>setOpen(false)}>
 *   <form>...</form>
 * </Modal>
 */
export default function Modal({
	open,
	title,
	children,
	onClose,
	size = "md",
}: ModalProps) {
	// Close on Escape
	useEffect(() => {
		function onKey(e: KeyboardEvent) {
			if (e.key === "Escape") onClose();
		}
		document.addEventListener("keydown", onKey);
		return () => document.removeEventListener("keydown", onKey);
	}, [onClose]);

	if (!open) return null;

	const sizeClass =
		size === "sm" ? "max-w-sm" : size === "lg" ? "max-w-2xl" : "max-w-md";

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn"
			onClick={onClose}
		>
			<div
				className={`card w-full ${sizeClass} p-5 bg-slate-900 border border-slate-800 shadow-xl rounded-xl`}
				onClick={(e) => e.stopPropagation()}
			>
				<div className="flex items-center justify-between mb-3">
					{title && <h3 className="text-lg font-semibold">{title}</h3>}
					<button
						className="text-slate-400 hover:text-slate-200 transition"
						onClick={onClose}
					>
						✕
					</button>
				</div>

				<div className="overflow-y-auto max-h-[70vh]">{children}</div>
			</div>
		</div>
	);
}
