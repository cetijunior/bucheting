import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

interface AuthContextType {
	user: any | null;
	sessionChecked: boolean;
}

const AuthContext = createContext<AuthContextType>({
	user: null,
	sessionChecked: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<any | null>(null);
	const [sessionChecked, setSessionChecked] = useState(false);

	// Check user session once at startup
	useEffect(() => {
		supabase.auth.getUser().then(({ data }) => {
			setUser(data.user);
			setSessionChecked(true);
		});

		// Listen for login/logout changes
		const { data: listener } = supabase.auth.onAuthStateChange(
			(_event, session) => {
				setUser(session?.user ?? null);
				setSessionChecked(true);
			}
		);

		return () => {
			listener.subscription.unsubscribe();
		};
	}, []);

	return (
		<AuthContext.Provider value={{ user, sessionChecked }}>
			{children}
		</AuthContext.Provider>
	);
}

export const useAuth = () => useContext(AuthContext);
