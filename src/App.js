import React, { useEffect } from "react";
import { supabase } from "./lib/helper/supabaseClient";

export default function App() {
  const [user, setUser] = React.useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data?.session.user);
     const {data:authListener} = supabase.auth.onAuthStateChange((event, session) => {
        switch (event) {
          case "SIGNED_IN":
            setUser(session.user);
            break;
          case "SIGNED_OUT":
            setUser(null);
            break;
          default:
            setUser(null);
            break;
        }
      });
      authListener.unsubscribe();
    };
    fetchData();
  }, []);

  const login = async () => {
    supabase.auth.signInWithOAuth({ provider: "github" });
  };

  const logOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div>
      {user ? (
        <div>
          <h1>Authenticated</h1>
          <button className="bg-yellow-500" onClick={logOut}>
            Sign out
          </button>
        </div>
      ) : (
        <button className="bg-yellow-500" onClick={login}>
          Login with Github!
        </button>
      )}
    </div>
  );
}
