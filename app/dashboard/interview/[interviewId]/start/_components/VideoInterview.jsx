import * as faceapi from "face-api.js";
import { useEffect, useRef, useState } from "react";
import { Pie } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend, Title, Plugin } from "chart.js";
import { FaSun, FaMoon } from "react-icons/fa";
import React from "react";

// Register chart.js components
Chart.register(ArcElement, Tooltip, Legend, Title);

export default function VideoInterview() {
  const videoRef = useRef(null);
  const [emotionData, setEmotionData] = useState({});
  const [currentSpeech, setCurrentSpeech] = useState("");
  const [cumulativeTranscript, setCumulativeTranscript] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timer, setTimer] = useState(0);
  const [darkMode, setDarkMode] = useState(false);
  const [feedbackReport, setFeedbackReport] = useState({
    pacing: 0,
    fillerWords: 0,
    volume: 0,
  });

  // Timer for recording
  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => setTimer((prev) => prev + 1), 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Load face-api.js models
  useEffect(() => {
    const loadModels = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
        await faceapi.nets.faceExpressionNet.loadFromUri("/models");
        startVideo();
      } catch (err) {
        console.error("Error loading face-api models:", err);
        alert("Failed to load face-api models.");
      }
    };

    const startVideo = () => {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
          videoRef.current.srcObject = stream;
          const recorder = new MediaRecorder(stream);
          setMediaRecorder(recorder);
          recorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              setRecordedChunks((prev) => prev.concat(event.data));
            }
          };
          videoRef.current.addEventListener("play", () => {
            setInterval(async () => {
              const detections = await faceapi
                .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
                .withFaceExpressions();
              if (detections.length > 0) {
                setEmotionData(detections[0].expressions);
              }
            }, 1000);
          });
        })
        .catch((err) => {
          console.error("Error accessing webcam:", err);
          alert("Please enable camera and microphone permissions.");
        });
    };

    loadModels();
  }, []);

  // Speech recognition logic
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error("SpeechRecognition API is not supported in this browser.");
      alert("Speech Recognition is not supported on this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      console.log("Speech recognition started.");
      setIsRecording(true);
    };

    recognition.onresult = (event) => {
      let interimTranscript = "";
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      setCurrentSpeech(finalTranscript + " " + interimTranscript);
      if (finalTranscript) {
        setCumulativeTranscript((prev) => prev + " " + finalTranscript);
        analyzeSpeech(finalTranscript); // Analyze speech for feedback
      }
    };

    recognition.onend = () => {
      console.log("Speech recognition ended.");
      setIsRecording(false);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      alert(`Speech recognition error: ${event.error}`);
    };

    if (isRecording) {
      recognition.start();
    }

    return () => {
      recognition.stop();
      console.log("Speech recognition stopped.");
    };
  }, [isRecording]);

  // Function to analyze speech for pacing and filler words
  const analyzeSpeech = (transcript) => {
    const wordsArray = transcript.split(" ").filter((word) => word.trim() !== "");

    // Calculate pacing (words per minute)
    const totalWords = wordsArray.length;
    const minutesSpentSpeaking = timer > 0 ? timer / 60 : 1; // Prevent division by zero
    const pacing = totalWords / minutesSpentSpeaking;

    // Count filler words
    const fillerWordsList = ["um", "uh", "like", "you know", "so"];
    let fillerWordsCount = 0;
    wordsArray.forEach((word) => {
      if (fillerWordsList.includes(word.toLowerCase())) {
        fillerWordsCount++;
      }
    });

    // Update feedback report
    setFeedbackReport((prevReport) => ({
      ...prevReport,
      pacing: pacing.toFixed(2),
      fillerWords: fillerWordsCount,
    }));
  };

  // Function to monitor audio volume levels
  const monitorVolume = () => {
    if (!mediaRecorder || mediaRecorder.state !== "recording") return;

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();

    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      analyser.fftSize = 256;
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const getVolumeLevel = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const averageVolume = sum / dataArray.length; // Average volume level
        updateVolumeFeedback(averageVolume); // Update feedback based on volume level

        requestAnimationFrame(getVolumeLevel); // Continue monitoring
      };

      getVolumeLevel();
    });
  };

  // Function to update feedback based on volume level
  const updateVolumeFeedback = (averageVolume) => {
    let volumeFeedback;
    if (averageVolume < 50) {
      volumeFeedback = "The voice is too low. Speak up!";
    } else if (averageVolume >= 50 && averageVolume <= 150) {
      volumeFeedback = "Voice level is good.";
    } else {
      volumeFeedback = "The voice is too loud. Please lower your volume.";
    }

    setFeedbackReport((prevReport) => ({
      ...prevReport,
      volume: volumeFeedback,
    }));
  };

  // Function to toggle recording
  const handleToggleRecording = () => {
    if (!mediaRecorder) {
      console.error("MediaRecorder is not initialized.");
      return;
    }

    if (mediaRecorder.state === "recording") {
      mediaRecorder.stop();
      setIsRecording(false);
    } else {
      setRecordedChunks([]);
      mediaRecorder.start();
      setIsRecording(true);
    }
  };

  // Function to download the recorded video
  const handleDownload = () => {
    const blob = new Blob(recordedChunks, { type: "video/webm" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "interview-recording.webm";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Function to save the transcript
  const handleSaveTranscript = () => {
    const blob = new Blob([cumulativeTranscript], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "transcript.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Function to play or pause the video
  const handlePlayPauseVideo = () => {
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  // Pie chart data for emotions
  const pieChartData = {
    labels: Object.keys(emotionData).map(
      (emotion) =>
        `${emotion.charAt(0).toUpperCase() + emotion.slice(1)}: ${(
          emotionData[emotion] * 100
        ).toFixed(2)}%`
    ),
    datasets: [
      {
        label: "Emotion Distribution",
        data: Object.values(emotionData).map((value) =>
          (value * 100).toFixed(2)
        ),
        backgroundColor: [
          "rgba(255, 99, 132, 0.6)",
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(75, 192, 192, 0.6)",
          "rgba(153, 102, 255, 0.6)",
          "rgba(255, 159, 64, 0.6)",
        ],
      },
    ],
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
          labels: {
            padding: 10, // Adjust padding between legend items
          },
        },
        tooltip: {
          enabled: true,
        },
        datalabels: {
          display: true,
          formatter: (value, context) => {
            const label = context.chart.data.labels[context.dataIndex];
            return `${label}: ${value.toFixed(2)}%`; // Add spacing for label and percentage
          },
          color: "#fff",
          font: {
            size: 14,
            weight: "bold",
          },
          padding: 5,
        },
      },
    },
  };

  return (
    <div className={`video-interview ${darkMode ? "dark-mode" : ""}`}>
      <div className="dark-mode-toggle-container">
        <button className="p-2 bg-gray-800 text-white rounded-md" onClick={toggleDarkMode}>
          {darkMode ? <FaSun /> : <FaMoon />}
        </button>
      </div>
      <div className="flex space-x-8 p-8">
        {/* Video container */}
        <div className="video-container flex-1">
          <video ref={videoRef} width="800" height="800" autoPlay muted></video>
        </div>

        {/* Feedback Panel */}
        <div className="analysis-panel flex-1 space-y-4">
          <button
            className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            onClick={handleToggleRecording}
          >
            {isRecording ? "Stop Recording" : "Start Recording"}
          </button>
          <button
            className="p-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            onClick={handleDownload}
            disabled={recordedChunks.length === 0}
          >
            Download Video
          </button>
          <button
            className="p-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
            onClick={handleSaveTranscript}
          >
            Save Transcript
          </button>
          <button
            className="p-2 bg-purple-500 text-white rounded-md hover:bg-purple-600"
            onClick={handlePlayPauseVideo}
          >
            {isPlaying ? "Pause Video" : "Play Video"}
          </button>

          <div className="feedback-panel">
            <p>Pacing: {feedbackReport.pacing} words per minute</p>
            <p>Filler Words: {feedbackReport.fillerWords}</p>
            <p>{feedbackReport.volume}</p>
          </div>
        </div>
      </div>

      {/* Emotion Pie Chart */}
      <div className="pie-chart-container p-4 w-40 h-40">
        <Pie data={pieChartData} width={300} height={300} />
      </div>
    </div>
  );
}
