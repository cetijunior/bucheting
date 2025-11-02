export default function TopBar() {
	return (
		<header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-900/80 backdrop-blur">
			<div className="container-px h-12 flex items-center justify-between">
				<div className="font-semibold tracking-wide">Bucheting</div>
				<div className="text-xs text-slate-400">MVP</div>
			</div>
		</header>
	);
}
