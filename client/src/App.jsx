import { Navigate, Route, Routes } from "react-router";
import { useEffect } from "react";
import { Loader } from "lucide-react";
import Navbar from "./components/Navbar";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Home from "./pages/Home";
import { useThemeStore } from "./store/useThemeStore";
import { useAuthStore } from "./store/useAuthStore";
import { Toaster } from "react-hot-toast";
import Reset from "./pages/Reset";
import Forget from "./pages/Forget";
import { User } from "./pages/User";
const App = () => {
  const {authUser, checkAuth, isCheckingAuth} = useAuthStore();
  const { theme } = useThemeStore();
  useEffect(()=>{
    checkAuth();
  }, [checkAuth]);
  if(isCheckingAuth && !authUser){
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    )
  }
  return (
    <div data-theme ={theme} >
      <Navbar />
      
      <Routes>
        <Route path="/" element={authUser ? <Home/> : <Navigate to="/login" />} />
        <Route path="/signup" element={!authUser ? <Signup/> : <Navigate to="/" />}  />
        <Route path="/login" element={!authUser ? <Login/> : <Navigate to="/" />}  />
        <Route path="/profile" element={authUser ? <Profile/> : <Navigate to="/login" />}  />
        <Route path="/settings" element={<Settings/>}  />
        <Route path="/forget-password" element={!authUser ? <Forget/>:<Navigate to="/"/>}  />
        <Route path="/reset/:token" element={!authUser ? <Reset/>:<Navigate to="/"/>}  />
        <Route path="/profile/:id" element={authUser ? <User/>:<Navigate to="/"/>}  />
      </Routes>
      <Toaster />
    </div>
  );
};

export default App;
