import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

interface Ctx {
	user: any | null;
	sessionChecked: boolean;
}
const AuthCtx = createContext<Ctx>({ user: null, sessionChecked: false });

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<any | null>(null);
	const [sessionChecked, setSessionChecked] = useState(false);

	useEffect(() => {
		supabase.auth.getUser().then(({ data }) => {
			setUser(data.user);
			setSessionChecked(true);
		});
		const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) =>
			setUser(session?.user ?? null)
		);
		return () => {
			sub.subscription.unsubscribe();
		};
	}, []);

	return (
		<AuthCtx.Provider value={{ user, sessionChecked }}>
			{children}
		</AuthCtx.Provider>
	);
}

export const useAuth = () => useContext(AuthCtx);
