export default function StatCard({
	title,
	value,
}: {
	title: string;
	value: string;
}) {
	return (
		<div className="card p-4">
			<div className="text-xs uppercase tracking-wide text-slate-400">
				{title}
			</div>
			<div className="text-xl font-semibold mt-1">{value}</div>
		</div>
	);
}
