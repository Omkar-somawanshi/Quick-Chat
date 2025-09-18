import React, { useEffect, useRef, useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

const VideoCall = ({ selectedUser }) => {
  const { authUser, socket } = useContext(AuthContext);

  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState(null);
  const [callerSignal, setCallerSignal] = useState(null);

  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();

  useEffect(() => {
    if (!socket) return;

    // When someone calls me
    socket.on("receiveCall", ({ from, name, signal }) => {
      setReceivingCall(true);
      setCaller(from);
      setCallerSignal(signal);
    });

    // When call is rejected or ended
    socket.on("callEnded", () => {
      endCall();
    });

    return () => {
      socket.off("receiveCall");
      socket.off("callEnded");
    };
  }, [socket]);

  const callUser = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    myVideo.current.srcObject = stream;

    const peer = new RTCPeerConnection();

    // Add tracks
    stream.getTracks().forEach(track => peer.addTrack(track, stream));

    // Listen remote stream
    peer.ontrack = (event) => {
      userVideo.current.srcObject = event.streams[0];
    };

    // ICE candidates
    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("iceCandidate", { to: selectedUser._id, candidate: event.candidate });
      }
    };

    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);

    socket.emit("callUser", {
      userToCall: selectedUser._id,
      signalData: offer,
      from: authUser._id,
      name: authUser.fullName
    });

    // Listen for answer
    socket.on("callAccepted", async (signal) => {
      setCallAccepted(true);
      await peer.setRemoteDescription(signal);
    });

    connectionRef.current = peer;
  };

  const answerCall = async () => {
    setCallAccepted(true);
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    myVideo.current.srcObject = stream;

    const peer = new RTCPeerConnection();

    // Add tracks
    stream.getTracks().forEach(track => peer.addTrack(track, stream));

    // Listen remote stream
    peer.ontrack = (event) => {
      userVideo.current.srcObject = event.streams[0];
    };

    // ICE candidates
    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("iceCandidate", { to: caller, candidate: event.candidate });
      }
    };

    await peer.setRemoteDescription(callerSignal);
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);

    socket.emit("answerCall", { to: caller, signal: answer });
    connectionRef.current = peer;
  };

  const endCall = () => {
    setCallEnded(true);
    connectionRef.current?.close();
    connectionRef.current = null;
    socket.emit("endCall", { to: selectedUser._id });
  };

  return (
    <div className="video-call-container">
      <div>
        {authUser && <video playsInline muted ref={myVideo} autoPlay className="my-video" />}
        {callAccepted && !callEnded && <video playsInline ref={userVideo} autoPlay className="user-video" />}
      </div>

      <div>
        {!callAccepted && receivingCall && (
          <div>
            <h3>{selectedUser.fullName} is calling...</h3>
            <button onClick={answerCall}>Answer</button>
          </div>
        )}

        {!callAccepted && !receivingCall && (
          <button onClick={callUser}>Call {selectedUser.fullName}</button>
        )}

        {callAccepted && <button onClick={endCall}>End Call</button>}
      </div>
    </div>
  );
};

export default VideoCall;
