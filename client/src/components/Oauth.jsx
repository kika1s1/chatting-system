import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { app } from "../firebase";
import { useAuthStore } from "../store/useAuthStore";
const Oauth = () => {
    const {googleLogin}  =  useAuthStore()
//   const dispatch = useDispatch();

  const handleGoogleClick = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const auth = getAuth(app);
      const result = await signInWithPopup(auth, provider);
      const user = {
        fullName: result.user.displayName,
        email: result.user.email,
        profilePic: result.user.photoURL,
      }
      googleLogin(user);
    } catch (error) {
      console.log("could not sign in with google", error);
    }
  };
  return (
    <button
      onClick={handleGoogleClick}
      type="button"
      className="btn btn-error bg-red-700 text-white w-full
    rounded-lg uppercase"
    >
      Continue with google
    </button>
  );
};

export default Oauth;
