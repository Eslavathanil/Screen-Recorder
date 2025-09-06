let mediaRecorder;
let recordedChunks = [];
let startTime, timerInterval;

const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resumeBtn = document.getElementById("resumeBtn");
const stopBtn = document.getElementById("stopBtn");
const downloadBtn = document.getElementById("downloadBtn");
const preview = document.getElementById("preview");
const timerEl = document.getElementById("timer");
const filesizeEl = document.getElementById("filesize");

// Format time
function formatTime(seconds) {
  const m = String(Math.floor(seconds / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return `${m}:${s}`;
}

// Update file size
function updateFileSize() {
  const size = recordedChunks.reduce((acc, chunk) => acc + chunk.size, 0);
  filesizeEl.textContent = (size / 1024).toFixed(2) + " KB";
}

// Start Recording
startBtn.onclick = async () => {
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true
    });

    preview.srcObject = stream;

    recordedChunks = [];
    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) recordedChunks.push(e.data);
      updateFileSize();
    };

    mediaRecorder.onstop = () => {
      clearInterval(timerInterval);
      const blob = new Blob(recordedChunks, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      downloadBtn.href = url;
      downloadBtn.download = "recording.webm";
      downloadBtn.disabled = false;
    };

    mediaRecorder.start();

    // UI state
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    stopBtn.disabled = false;
    downloadBtn.disabled = true;

    // Timer
    startTime = Date.now();
    timerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      timerEl.textContent = formatTime(elapsed);
    }, 1000);

  } catch (err) {
    alert("Error: " + err.message);
  }
};

// Pause
pauseBtn.onclick = () => {
  mediaRecorder.pause();
  pauseBtn.disabled = true;
  resumeBtn.disabled = false;
};

// Resume
resumeBtn.onclick = () => {
  mediaRecorder.resume();
  resumeBtn.disabled = true;
  pauseBtn.disabled = false;
};

// Stop
stopBtn.onclick = () => {
  mediaRecorder.stop();
  startBtn.disabled = false;
  stopBtn.disabled = true;
  pauseBtn.disabled = true;
  resumeBtn.disabled = true;
};
