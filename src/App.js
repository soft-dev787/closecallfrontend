import "./App.css";
import { useEffect, useRef, useState } from "react";
import { RealtimeTranscriber } from "assemblyai/streaming";
import * as RecordRTC from "recordrtc";
import axios from "axios";
import io from "socket.io-client";

const axiosInstance = axios.create({
  // baseURL: "https://sculpin-related-dragon.ngrok-free.app/",
  baseURL: "https://closecallbackend.vercel.app/",
});

const Loader = ({ size }) => {
  return <span class="loader" style={{ width: size, height: size }}></span>;
};

const RealtimeTranscription = ({ newEvent }) => {
  const realtimeTranscriber = useRef(null);
  const recorder = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [recordingLoading, setRecordingLoading] = useState(false);

  useEffect(() => {
    if (newEvent) {
      if (newEvent.type == "call.answered") {
        startTranscription();
      } else if (newEvent.type == "call.hungup") {
        endTranscription();
      }
    }
  }, [newEvent]);

  const getToken = async () => {
    const response = await fetch("https://closecallbackend.vercel.app/token");
    const data = await response.json();

    if (data.error) {
      alert(data.error);
    }

    return data.token;
  };

  const startTranscription = async () => {
    setRecordingLoading(true);

    realtimeTranscriber.current = new RealtimeTranscriber({
      token: await getToken(),
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
          console.log(msg);
        }
      }
      setTranscript(msg);
    });

    realtimeTranscriber.current.on("error", (event) => {
      console.error(event);
      realtimeTranscriber.current.close();
      realtimeTranscriber.current = null;
    });

    realtimeTranscriber.current.on("close", (code, reason) => {
      console.log(`Connection closed: ${code} ${reason}`);
      realtimeTranscriber.current = null;
    });

    await realtimeTranscriber.current.connect();
    setRecordingLoading(false);
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
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
      })
      .catch((err) => console.error(err));

    setIsRecording(true);
  };

  const endTranscription = async (event) => {
    event?.preventDefault();
    setTranscript("");
    setIsRecording(false);
    await realtimeTranscriber.current.close();
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

const socket = io("https://closecallbackend.vercel.app", {
  autoConnect: false,
});

function App() {
  const [verificationLoader, setVerificationLoader] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const emailFieldRef = useRef();
  const [socketMessage, setSocketMessage] = useState(null);
  const [newEvent, setNewEvent] = useState(null);
  // socket.on("webhookReceived", (data) => {
  //   console.log("Webhook data received:", data);
  //   // Handle the data as needed (e.g., display it in the UI)
  // });

  useEffect(() => {
    socket.connect();
  }, []);

  useEffect(() => {
    socket.emit("clientMessage", "hello from client");
    socket.on("serverMessage", (data) => {
      console.log(data);
    });
    socket.on("callEvent", (data) => {
      console.log(data);
      setNewEvent(data);
      // socket.close();
      // setNewEvent(Math.floor(Math.random() * 1000));
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
      const response = await axiosInstance.post("finduser", {
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
    // setTimeout(() => {
    //   setVerificationMessage(false);
    // }, 3000);
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

      <RealtimeTranscription newEvent={newEvent} />
    </div>
  );
}

export default App;
