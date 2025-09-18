import React, { useContext, useEffect, useRef, useState } from "react";
import assets from "../assets/assets";
import { formatMessageTime } from "../lib/utils";
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";

const ChatContainer = () => {
  const { messages, selectedUser, setSelectedUser, sendMessage, getMessages } =
    useContext(ChatContext);
  const { authUser, onlineUsers, socket } = useContext(AuthContext);

  const scrollEnd = useRef();
  const [input, setInput] = useState("");

  // --- Video Call States ---
  const [callActive, setCallActive] = useState(false); // Track if popup should show
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState(null);
  const [callerSignal, setCallerSignal] = useState(null);

  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();

  // --- Handlers ---
  const handleSendTextMessage = async (e) => {
    e.preventDefault();
    if (input.trim() === "") return null;
    await sendMessage({ text: input.trim() });
    setInput("");
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      await sendMessage({ image: reader.result });
      e.target.value = "";
    };
    reader.readAsDataURL(file);
  };

  // --- Fetch Messages ---
  useEffect(() => {
    if (selectedUser) getMessages(selectedUser._id);
  }, [selectedUser, getMessages]);

  // --- Auto Scroll ---
  useEffect(() => {
    if (scrollEnd.current && messages) {
      scrollEnd.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // --- Video Call Socket Listeners ---
  useEffect(() => {
    if (!socket) return;

    socket.on("receiveCall", ({ from, signal }) => {
      setReceivingCall(true);
      setCaller(from);
      setCallerSignal(signal);
      setCallActive(true); // open popup
    });

    socket.on("callEnded", () => endCall());

    socket.on("iceCandidate", (candidate) => {
      connectionRef.current?.addIceCandidate(new RTCIceCandidate(candidate));
    });

    return () => {
      socket.off("receiveCall");
      socket.off("callEnded");
      socket.off("iceCandidate");
    };
  }, [socket]);

  // --- Video Call Functions ---
  const callUser = async () => {
    setCallActive(true); // show popup
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    myVideo.current.srcObject = stream;

    const peer = new RTCPeerConnection();
    stream.getTracks().forEach((track) => peer.addTrack(track, stream));

    peer.ontrack = (event) => (userVideo.current.srcObject = event.streams[0]);
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
      name: authUser.fullName,
    });

    socket.on("callAccepted", async (signal) => {
      setCallAccepted(true);
      await peer.setRemoteDescription(signal);
    });

    connectionRef.current = peer;
  };

  const answerCall = async () => {
    setCallAccepted(true);
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    myVideo.current.srcObject = stream;

    const peer = new RTCPeerConnection();
    stream.getTracks().forEach((track) => peer.addTrack(track, stream));

    peer.ontrack = (event) => (userVideo.current.srcObject = event.streams[0]);
    peer.onicecandidate = (event) => {
      if (event.candidate) socket.emit("iceCandidate", { to: caller, candidate: event.candidate });
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
    socket?.emit("endCall", { to: selectedUser?._id || caller });
    setCallAccepted(false);
    setReceivingCall(false);
    setCallActive(false); // close popup
  };

  return selectedUser ? (
    <div className="h-full overflow-hidden relative backdrop-blur-lg flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 mx-4 p-4 border-b border-stone-500">
        <img
          src={selectedUser.profilePic || assets.avatar_icon}
          alt=""
          className="w-8 rounded-full"
        />
        <p className="flex-1 text-lg text-white flex items-center gap-2">
          {selectedUser.fullName}
          {onlineUsers.includes(selectedUser._id) && (
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
          )}
        </p>

        <img
          onClick={() => setSelectedUser(null)}
          src={assets.arrow_icon}
          alt=""
          className="md:hidden max-w-7 cursor-pointer"
        />
        <img src={assets.help_icon} alt="Help" className="max-md:hidden max-w-5" />

        {/* Call Button */}
        <button
          onClick={callUser}
          className="ml-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-full text-sm"
        >
          Video Call
         </button>
      </div>

      {/* Video Call Popup */}
      {callActive && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="relative w-full max-w-[600px] h-[400px] bg-black rounded-xl shadow-xl flex flex-col items-center justify-center">
            {/* Remote Video */}
            <video
              ref={userVideo}
              autoPlay
              playsInline
              className="w-full h-full object-cover rounded-xl"
            />

            {/* Local Video */}
            <div className="absolute top-4 right-4 w-24 h-24 bg-black rounded-lg overflow-hidden border-2 border-white">
              <video
                ref={myVideo}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            </div>

            {/* Call Controls */}
            <div className="absolute bottom-4 flex gap-4">
              {!callAccepted && receivingCall && (
                <button
                  onClick={answerCall}
                  className="bg-green-500 w-12 h-12 rounded-full flex items-center justify-center text-white shadow"
                >
                  ✔
                </button>
              )}
              {callAccepted && !callEnded && (
                <button
                  onClick={endCall}
                  className="bg-red-500 w-12 h-12 rounded-full flex items-center justify-center text-white shadow"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 flex flex-col overflow-y-scroll p-3 pb-6">
        {messages.map(
          (msg, index) =>
            msg && msg.senderId && (
              <div
                key={index}
                className={`flex items-end gap-2 justify-end ${
                  msg.senderId !== authUser._id ? "flex-row-reverse" : ""
                }`}
              >
                {msg.image ? (
                  <img
                    src={msg.image}
                    alt=""
                    className="max-w-[230px] border border-gray-700 rounded-lg overflow-hidden md-8"
                  />
                ) : (
                  <p
                    className={`p-2 max-w-[200px] md:text-sm font-light rounded-lg mb-8 break-all bg-violet-500/30 text-white ${
                      msg.senderId === authUser._id ? "rounded-br-none" : "rounded-bl-none"
                    }`}
                  >
                    {msg.text}
                  </p>
                )}
                <div className="text-center text-xs">
                  <img
                    src={
                      msg.senderId === authUser._id
                        ? authUser?.profilePic || assets.profile_icon
                        : selectedUser?.profilePic || assets.avatar_icon
                    }
                    alt=""
                    className="w-7 rounded-full"
                  />
                  <p className="text-gray-500">{formatMessageTime(msg.createdAt)}</p>
                </div>
              </div>
            )
        )}
        <div ref={scrollEnd}></div>
      </div>

      {/* Bottom Input */}
      <div className="absolute bottom-3 left-0 right-0 flex items-center gap-3 p-3">
        <div className="flex-1 flex items-center bg-gray-100/12 px-3 rounded-full">
          <input
            onChange={(e) => setInput(e.target.value)}
            value={input}
            onKeyDown={(e) =>
              e.key === "Enter" ? handleSendTextMessage(e) : null
            }
            type="text"
            placeholder="Send a message"
            className="flex-1 text-sm p-3 border-none rounded-lg outline-none text-white placeholder-gray-400"
          />
          <input
            onChange={handleFileChange}
            type="file"
            id="image"
            accept="image/png, image/jpeg"
            hidden
          />
          <label htmlFor="image">
            <img src={assets.avatar_icon} alt="" className="w-5 mr-2 cursor-pointer" />
          </label>
        </div>
        <img
          onClick={handleSendTextMessage}
          src={assets.send_button}
          alt=""
          className="w-7 cursor-pointer"
        />
      </div>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/10 max-md:hidden">
      <img src={assets.logo_icon} className="max-w-16" alt="" />
      <p className="text-lg font-medium text-white">Chat anytime, anywhere</p>
    </div>
  );
};

export default ChatContainer;
