import { useEffect, useState } from "react";
import { useNavigate, useParams, Navigate } from "react-router";
import {
  StreamVideoProvider,
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
  const navigate = useNavigate();
  const { authUser } = useAuthStore();

  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const [isConnecting, setIsConnecting] = useState(true);

  // 1) Fetch token and initialize call
  useEffect(() => {
    if (!authUser) return;

    let isMounted = true;
    (async () => {
      try {
        const { token } = await getStreamToken();
        if (!isMounted) return;

        // 2) Initialize video client & join call
        const videoClient = new StreamVideoClient({
          apiKey: STREAM_API_KEY,
          user: {
            id: authUser._id,
            name: authUser.fullName,
            image: authUser.profilePic,
          },
          token,
        });

        const callInstance = videoClient.call("default", callId);
        await callInstance.join({ create: true });

        if (!isMounted) {
          // If unmounted while joining, immediately clean up
          await callInstance.leave();
          // Try calling `client.stop()` instead of `disconnect()`
          videoClient.stop();  // Assuming this method is available for cleanup
          return;
        }

        setClient(videoClient);
        setCall(callInstance);
      } catch (err) {
        console.error("Error joining call:", err);
        toast.error("Could not join the call. Please try again.");
      } finally {
        if (isMounted) setIsConnecting(false);
      }
    })();
  }, [authUser, callId]);

  if (isConnecting) return <Loader />;

  if (!client || !call) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        <p>Could not initialize call.</p>
        <p>Please refresh or try again later.</p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-black">
      <StreamVideoProvider client={client}>
        <StreamCall call={call}>
          <CallContent navigate={navigate} />
        </StreamCall>
      </StreamVideoProvider>
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
