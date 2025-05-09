import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  CallControls,
  SpeakerLayout,
  StreamTheme,
  CallingState,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import toast from "react-hot-toast";
import Loader from "../components/Loader";
import { useAuthStore } from "../store/useAuthStore";
import { getStreamToken } from "../lib/api";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const Call = () => {
  const { id: callId } = useParams();
  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const [token, setToken] = useState(null);

  const { authUser } = useAuthStore();
  const navigate = useNavigate();

  // fetch stream token once user is available
  useEffect(() => {
    if (!authUser) return;
    (async () => {
      try {
        const { token } = await getStreamToken();
        setToken(token);
      } catch (err) {
        console.error("Token fetch error:", err);
        toast.error("Unable to retrieve call token.");
      }
    })();
  }, [authUser]);

  // initialize video call once token is ready
  useEffect(() => {
    console.log(authUser)
    console.log(callId)
    console.log(token)
    if (!token || !authUser?._id || !callId) return;
    let videoClient, callInstance;
    const initCall = async () => {
      try {
        const user = {
          id: authUser._id,
          name: authUser.fullName,
          image: authUser.profilePic,
        };
        videoClient = new StreamVideoClient({
          apiKey: STREAM_API_KEY,
          user,
          token,
        });
        callInstance = videoClient.call("default", callId);
        await callInstance.join({ create: true });
        setClient(videoClient);
        setCall(callInstance);
      } catch (err) {
        console.error("Error joining call:", err);
        toast.error("Could not join the call. Please try again.");
      } finally {
        setIsConnecting(false);
      }
    };

    initCall();

    return () => {
      callInstance?.leave();
      videoClient?.disconnect();
    };
  }, [token, authUser?._id, authUser?.fullName, authUser?.profilePic, callId]);
  console.log(isConnecting)
  if (isConnecting) return <Loader />;

  return (
    <div className="h-screen flex items-center justify-center bg-black">
      {client && call ? (
        <StreamVideo client={client}>
          <StreamCall call={call}>
            <CallContent navigate={navigate} />
          </StreamCall>
        </StreamVideo>
      ) : (
        <div className="text-center text-white">
          <p>Could not initialize call.</p>
          <p>Please refresh or try again later.</p>
        </div>
      )}
    </div>
  );
};

const CallContent = ({ navigate }) => {
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();

  useEffect(() => {
    if (callingState === CallingState.LEFT) {
      navigate("/");
    }
  }, [callingState, navigate]);

  return (
    <StreamTheme>
      <SpeakerLayout />
      <CallControls />
    </StreamTheme>
  );
};

export default Call;