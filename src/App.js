// import "./App.css";
// import { useEffect, useRef, useState } from "react";
// import { RealtimeTranscriber } from "assemblyai/streaming";
// import * as RecordRTC from "recordrtc";
// import axios from "axios";
// import io from "socket.io-client";
// import { getBackendURL } from "./utils/getBackendURL";

// const axiosInstance = axios.create({
//   baseURL: getBackendURL(),
//   headers: {
//     "ngrok-skip-browser-warning": "1234",
//   },
// });

// const Loader = ({ size }) => {
//   return <span class="loader" style={{ width: size, height: size }}></span>;
// };

// const executeGPTAndTwilio = async (transcript, fromNumber, toNumber) => {
//   try {
//     const response = await axiosInstance.post("/summarize", {
//       transcript: transcript,
//       fromNumber: "+61483921188",
//       toNumber: toNumber,
//     });
//   } catch (error) {
//     console.log(error);
//   }
// };

// const RealtimeTranscription = ({ newEvent, transferToNumber }) => {
//   const realtimeTranscriber = useRef(null);
//   const recorder = useRef(null);
//   const [isRecording, setIsRecording] = useState(false);
//   const [transcript, setTranscript] = useState("");
//   const [recordingLoading, setRecordingLoading] = useState(false);

//   useEffect(() => {
//     const handleWebhooks = async () => {
//       if (newEvent) {
//         if (newEvent.type == "call.answered") {
//           await startTranscription();
//         } else if (newEvent.type == "call.hungup") {
//           setTranscript("");
//           await endTranscription();
//         } else if (newEvent.type == "call.unsuccessful_transfer") {
//           setTranscript("");
//           // temppp
//           if (transferToNumber.value) {
//             executeGPTAndTwilio(
//               transcript,
//               "from number",
//               transferToNumber.value
//             );
//           }
//           endTranscription();

//           // temppp
//         } else if (newEvent.type == "call.transferred") {
//           setTranscript("");
//           if (transferToNumber.value) {
//             executeGPTAndTwilio(
//               transcript,
//               "from number",
//               transferToNumber.value
//             );
//           }
//           endTranscription();
//         }
//       }
//     };
//     handleWebhooks();
//   }, [newEvent]);

//   const getToken = async () => {
//     const response = await axiosInstance.get(`/token`);

//     return response.data.token;
//   };

//   const startTranscription = async () => {
//     setRecordingLoading(true);

//     realtimeTranscriber.current = new RealtimeTranscriber({
//       token: await getToken(),
//       sampleRate: 16_000,
//     });

//     const texts = {};
//     realtimeTranscriber.current.on("transcript", (transcript) => {
//       let msg = "";
//       texts[transcript.audio_start] = transcript.text;
//       const keys = Object.keys(texts);
//       keys.sort((a, b) => a - b);
//       for (const key of keys) {
//         if (texts[key]) {
//           msg += ` ${texts[key]}`;
//           console.log(msg);
//         }
//       }
//       setTranscript(msg);
//     });

//     realtimeTranscriber.current.on("error", (event) => {
//       console.error(event);
//       setTranscript("");
//       realtimeTranscriber.current.close();
//       realtimeTranscriber.current = null;
//     });

//     realtimeTranscriber.current.on("close", (code, reason) => {
//       console.log(`Connection closed: ${code} ${reason}`);
//       realtimeTranscriber.current = null;
//     });

//     await realtimeTranscriber.current.connect();
//     setRecordingLoading(false);
//     navigator.mediaDevices
//       .getUserMedia({ audio: true })
//       .then((stream) => {
//         recorder.current = new RecordRTC(stream, {
//           type: "audio",
//           mimeType: "audio/webm;codecs=pcm",
//           recorderType: RecordRTC.StereoAudioRecorder,
//           timeSlice: 250,
//           desiredSampRate: 16000,
//           numberOfAudioChannels: 1,
//           bufferSize: 4096,
//           audioBitsPerSecond: 128000,
//           ondataavailable: async (blob) => {
//             if (!realtimeTranscriber.current) return;
//             const buffer = await blob.arrayBuffer();
//             realtimeTranscriber.current.sendAudio(buffer);
//           },
//         });
//         recorder.current.startRecording();
//       })
//       .catch((err) => console.error(err));

//     setIsRecording(true);
//   };

//   const endTranscription = async (event) => {
//     event?.preventDefault();
//     setIsRecording(false);
//     await realtimeTranscriber.current.close();
//     realtimeTranscriber.current = null;
//     recorder.current.pauseRecording();
//     recorder.current = null;
//   };

//   return (
//     <div className="App">
//       <div className="real-time-interface">
//         <p id="real-time-title" className="real-time-interface__title">
//           Click start to begin recording!
//         </p>
//         {isRecording ? (
//           <button
//             className="real-time-interface__button"
//             onClick={endTranscription}
//           >
//             Stop recording
//           </button>
//         ) : (
//           <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
//             <button
//               className="real-time-interface__button"
//               onClick={startTranscription}
//             >
//               {!recordingLoading ? "Record" : <Loader size={24} />}
//             </button>

//             {recordingLoading && (
//               <span style={{ fontSize: 22, fontWeight: 500, color: "green" }}>
//                 Please wait...
//               </span>
//             )}
//           </div>
//         )}
//       </div>
//       <div className="real-time-interface__message">{transcript}</div>
//     </div>
//   );
// };

// const socket = io(getBackendURL(), {
//   autoConnect: false,
//   transports: ["websocket"],
//   extraHeaders: {
//     "ngrok-skip-browser-warning": "1234",
//   },
// });

// function App() {
//   const [verificationLoader, setVerificationLoader] = useState(false);
//   const [verificationMessage, setVerificationMessage] = useState(null);
//   const [errorMessage, setErrorMessage] = useState(null);
//   const emailFieldRef = useRef();
//   const transferToFieldRef = useRef();
//   const [newEvent, setNewEvent] = useState(null);

//   useEffect(() => {
//     socket.connect();
//   }, []);

//   useEffect(() => {
//     socket.emit("clientMessage", "hello from client");
//     socket.on("serverMessage", (data) => {
//       console.log(data);
//     });
//     socket.on("callEvent", (data) => {
//       console.log(data);
//       setNewEvent(data);
//     });
//   }, []);

//   const verifyUser = async () => {
//     if (!emailFieldRef.current.value) {
//       setErrorMessage("Please provide an email address.");
//       return;
//     }
//     setVerificationLoader(true);
//     setErrorMessage(null);
//     try {
//       const response = await axiosInstance.post("/finduser", {
//         email: emailFieldRef.current.value,
//       });

//       console.log(response);
//       setVerificationMessage(true);
//     } catch (error) {
//       console.log(error);

//       setErrorMessage(error.response.data.error);
//     } finally {
//       setVerificationLoader(false);
//     }
//   };

//   return (
//     <div>
//       {verificationLoader && (
//         <div
//           style={{
//             width: "100%",
//             height: "100%",
//             position: "absolute",
//             top: 0,
//             left: 0,
//             backgroundColor: "rgba(0,0,0,0.9)",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//           }}
//         >
//           <Loader size={72} />
//         </div>
//       )}
//       <header>
//         <h1 className="header__title">Real-Time Transcription</h1>
//         <p className="header__sub-title">
//           Try AssemblyAI's new real-time transcription endpoint!
//         </p>
//       </header>

//       <div style={{ padding: "40px 80px" }}>
//         <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
//           <label htmlFor="email">Email</label>
//           <input
//             ref={emailFieldRef}
//             type="text"
//             style={{
//               width: 300,
//               padding: "10px 12px",
//               borderRadius: 6,
//               outline: "none",
//               border: "none",
//               backgroundColor: "#09032F",
//               color: "#ffffff",
//             }}
//           />
//           <button
//             style={{
//               alignSelf: "start",
//               padding: "10px 15px",
//               borderRadius: 6,
//               color: "#ffffff",
//               backgroundColor: "#09032F",
//               outline: "none",
//               border: "none",
//               cursor: "pointer",
//             }}
//             onClick={verifyUser}
//           >
//             Verify
//           </button>
//           <label htmlFor="transfer_to">Transfer to</label>
//           <input
//             ref={transferToFieldRef}
//             type="text"
//             style={{
//               width: 300,
//               padding: "10px 12px",
//               borderRadius: 6,
//               outline: "none",
//               border: "none",
//               backgroundColor: "#09032F",
//               color: "#ffffff",
//             }}
//           />
//           <p style={{ fontWeight: 500, fontSize: 20 }}>Example: +18882255322</p>
//           {verificationMessage && (
//             <p style={{ color: "green", fontSize: 22, fontWeight: 500 }}>
//               The user is now verified. A live transcript will be displayed here
//               for each call made by the user
//             </p>
//           )}
//           {errorMessage && (
//             <p style={{ color: "red", fontSize: 20, fontWeight: 500 }}>
//               {errorMessage}
//             </p>
//           )}
//         </div>
//       </div>

//       <RealtimeTranscription
//         transferToNumber={transferToFieldRef.current}
//         newEvent={newEvent}
//       />
//     </div>
//   );
// }

// export default App;

import "./App.css";
import { useEffect, useRef, useState } from "react";
import { RealtimeTranscriber } from "assemblyai/streaming";
import * as RecordRTC from "recordrtc";
import io from "socket.io-client";
import { getBackendURL } from "./utils/getBackendURL";
import { axiosInstance } from "./utils/axiosInstance";

const Loader = ({ size }) => {
  return <span className="loader" style={{ width: size, height: size }}></span>;
};

const executeGPTAndTwilio = async (transcript, fromNumber, toNumber) => {
  try {
    const response = await axiosInstance.post("/summarize", {
      transcript: transcript,
      fromNumber: "+61483921188",
      toNumber: toNumber,
    });
  } catch (error) {
    console.log(error);
  }
};

const RealtimeTranscription = ({ newEvent, transferToNumber }) => {
  const realtimeTranscriber = useRef(null);
  const recorder = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [recordingLoading, setRecordingLoading] = useState(false);

  useEffect(() => {
    const handleWebhooks = async () => {
      if (newEvent) {
        console.log(newEvent);

        if (newEvent.type === "call.answered") {
          await startTranscription();
        } else if (newEvent.type === "call.hungup") {
          setTranscript("");
          await endTranscription();
        } else if (
          newEvent.type === "call.unsuccessful_transfer" ||
          newEvent.type === "call.transferred"
        ) {
          setTranscript("");
          if (transferToNumber.value) {
            executeGPTAndTwilio(
              transcript,
              "from number",
              transferToNumber.value
            );
          }
          endTranscription();
        }
      }
    };
    handleWebhooks();
  }, [newEvent]);

  const getToken = async () => {
    const response = await axiosInstance.get(`/token`);
    return response.data.token;
  };

  const startTranscription = async () => {
    setRecordingLoading(true);

    // Fetch token and access media device in parallel
    const tokenPromise = getToken();
    const mediaPromise = navigator.mediaDevices.getUserMedia({ audio: true });

    try {
      const [token, stream] = await Promise.all([tokenPromise, mediaPromise]);

      realtimeTranscriber.current = new RealtimeTranscriber({
        token: token,
        sampleRate: 16_000,
      });

      const texts = {};
      realtimeTranscriber.current.on("transcript", (transcript) => {
        let msg = "";
        texts[transcript.audio_start] = transcript.text;
        const keys = Object.keys(texts);
        keys.sort((a, b) => a - b);
        for (const key of keys) {
          if (texts[key]) {
            msg += ` ${texts[key]}`;
          }
        }
        setTranscript(msg);
      });

      realtimeTranscriber.current.on("error", (event) => {
        console.error(event);
        setTranscript("");
        realtimeTranscriber.current.close();
        realtimeTranscriber.current = null;
      });

      realtimeTranscriber.current.on("close", (code, reason) => {
        console.log(`Connection closed: ${code} ${reason}`);
        realtimeTranscriber.current = null;
      });

      await realtimeTranscriber.current.connect();

      recorder.current = new RecordRTC(stream, {
        type: "audio",
        mimeType: "audio/webm;codecs=pcm",
        recorderType: RecordRTC.StereoAudioRecorder,
        timeSlice: 250,
        desiredSampRate: 16000,
        numberOfAudioChannels: 1,
        bufferSize: 4096,
        audioBitsPerSecond: 128000,
        ondataavailable: async (blob) => {
          if (!realtimeTranscriber.current) return;
          const buffer = await blob.arrayBuffer();
          realtimeTranscriber.current.sendAudio(buffer);
        },
      });

      recorder.current.startRecording();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting transcription", error);
      setRecordingLoading(false);
    }
  };

  const endTranscription = async (event) => {
    event?.preventDefault();
    setRecordingLoading(false);

    setIsRecording(false);
    await realtimeTranscriber.current?.close();
    realtimeTranscriber.current = null;
    recorder.current.pauseRecording();
    recorder.current = null;
  };

  return (
    <div className="App">
      <div className="real-time-interface">
        <p id="real-time-title" className="real-time-interface__title">
          Click start to begin recording!
        </p>
        {isRecording ? (
          <button
            className="real-time-interface__button"
            onClick={endTranscription}
          >
            Stop recording
          </button>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
            <button
              className="real-time-interface__button"
              onClick={startTranscription}
            >
              {!recordingLoading ? "Record" : <Loader size={24} />}
            </button>

            {recordingLoading && (
              <span style={{ fontSize: 22, fontWeight: 500, color: "green" }}>
                Please wait...
              </span>
            )}
          </div>
        )}
      </div>
      <div className="real-time-interface__message">{transcript}</div>
    </div>
  );
};

const socket = io(getBackendURL(), {
  autoConnect: false,
  transports: ["websocket"],
  extraHeaders: {
    "ngrok-skip-browser-warning": "1234",
  },
});

function App() {
  const [verificationLoader, setVerificationLoader] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const emailFieldRef = useRef();
  const transferToFieldRef = useRef();
  const [newEvent, setNewEvent] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("token"));
    socket.connect();
    socket.emit("user-login", user.id);
  }, []);

  useEffect(() => {
    socket.on("callEvent", (data) => {
      setNewEvent(data);
    });
  }, []);

  const verifyUser = async () => {
    if (!emailFieldRef.current.value) {
      setErrorMessage("Please provide an email address.");
      return;
    }
    setVerificationLoader(true);
    setErrorMessage(null);
    try {
      const response = await axiosInstance.post("/finduser", {
        email: emailFieldRef.current.value,
      });

      console.log(response);
      setVerificationMessage(true);
    } catch (error) {
      console.log(error);

      setErrorMessage(error.response.data.error);
    } finally {
      setVerificationLoader(false);
    }
  };

  return (
    <div>
      {verificationLoader && (
        <div
          style={{
            width: "100%",
            height: "100%",
            position: "absolute",
            top: 0,
            left: 0,
            backgroundColor: "rgba(0,0,0,0.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Loader size={72} />
        </div>
      )}
      <header>
        <h1 className="header__title">Real-Time Transcription</h1>
        <p className="header__sub-title">
          Try AssemblyAI's new real-time transcription endpoint!
        </p>
      </header>

      <div style={{ padding: "40px 80px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <label htmlFor="email">Email</label>
          <input
            ref={emailFieldRef}
            type="text"
            style={{
              width: 300,
              padding: "10px 12px",
              borderRadius: 6,
              outline: "none",
              border: "none",
              backgroundColor: "#09032F",
              color: "#ffffff",
            }}
          />
          <button
            style={{
              alignSelf: "start",
              padding: "10px 15px",
              borderRadius: 6,
              color: "#ffffff",
              backgroundColor: "#09032F",
              outline: "none",
              border: "none",
              cursor: "pointer",
            }}
            onClick={verifyUser}
          >
            Verify
          </button>
          <label htmlFor="transfer_to">Transfer to</label>
          <input
            ref={transferToFieldRef}
            type="text"
            style={{
              width: 300,
              padding: "10px 12px",
              borderRadius: 6,
              outline: "none",
              border: "none",
              backgroundColor: "#09032F",
              color: "#ffffff",
            }}
          />
          <p style={{ fontWeight: 500, fontSize: 20 }}>Example: +18882255322</p>
          {verificationMessage && (
            <p style={{ color: "green", fontSize: 22, fontWeight: 500 }}>
              The user is now verified. A live transcript will be displayed here
              for each call made by the user
            </p>
          )}
          {errorMessage && (
            <p style={{ color: "red", fontSize: 20, fontWeight: 500 }}>
              {errorMessage}
            </p>
          )}
        </div>
      </div>

      <RealtimeTranscription
        transferToNumber={transferToFieldRef.current}
        newEvent={newEvent}
      />
    </div>
  );
}

export default App;
