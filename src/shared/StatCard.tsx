export default function StatCard({
	title,
	value,
	valueColor, // <-- New prop added
}: {
	title: string;
	value: string;
	valueColor: string; // <-- Must be defined in the type
}) {
	return (
		<div className="bg-slate-900 rounded-xl shadow-lg p-4 border border-slate-800">
			<div className="text-xs uppercase tracking-wide font-medium text-slate-400">
				{title}
			</div>
			{/* The valueColor prop is now correctly applied here */}
			<div className={`text-2xl font-bold mt-1 ${valueColor}`}>{value}</div>
		</div>
	);
}
