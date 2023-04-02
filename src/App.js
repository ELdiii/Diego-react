import React, { useEffect } from "react";
import LoginPage from "./components/LoginPage";
import MainLayout from "./components/MainLayout";
import { supabase } from "./lib/helper/supabaseClient";

export default function App() {
  const [user, setUser] = React.useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data?.session.user);
      supabase.auth.onAuthStateChange((event, session) => {
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
    };
    fetchData();
  }, []);

  const loginGithub = async () => {
    supabase.auth.signInWithOAuth({ provider: "github" });
  };

  async function logInGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
    });
  }

  const logOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="grid w-screen place-content-center ">
      <div className="">
        {user ? (
          <div className="grid ">
            <MainLayout logOutFunc={logOut} />
          </div>
        ) : (
          <div>
            <LoginPage logInGithub={loginGithub} logInGoogle={logInGoogle} />
          </div>
        )}
      </div>
    </div>
  );
}
