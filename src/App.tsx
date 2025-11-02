import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Accounts from "./pages/Accounts";
import Settings from "./pages/Settings";
// import Shell from "./components/Shell";
import Navbar from "./components/Navbar.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./providers/AuthProvider;.tsx";
import type { JSX } from "react";

const qc = new QueryClient();

function PrivateRoute({ children }: { children: JSX.Element }) {
	const { sessionChecked, user } = useAuth();
	if (!sessionChecked) return null; // could render a splash here
	if (!user) return <Navigate to="/login" replace />;
	return children;
}

export default function App() {
	return (
		<QueryClientProvider client={qc}>
			<AuthProvider>
				<Routes>
					<Route path="/login" element={<Login />} />
					<Route
						path="/"
						element={
							<PrivateRoute>
								<Navbar />
							</PrivateRoute>
						}
					>
						<Route index element={<Dashboard />} />
						<Route path="transactions" element={<Transactions />} />
						<Route path="accounts" element={<Accounts />} />
						<Route path="settings" element={<Settings />} />
					</Route>
					<Route path="*" element={<Navigate to="/" replace />} />
				</Routes>
			</AuthProvider>
		</QueryClientProvider>
	);
}
