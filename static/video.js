const chatMessages = document.querySelector(".chat-messages");
const inputField = document.querySelector("input");
const sendBtn = document.getElementById("sendBtn");
const continueBtn = document.getElementById("continueBtn");

const video = document.getElementById("userVideo");
const canvas = document.createElement("canvas");

const micBtn = document.querySelector(".mic");
const micLine = document.querySelector(".mic-line");

const cameraBtn = document.querySelector(".camera");
const cameraLine = document.querySelector(".camera-line");

const endBtn = document.querySelector(".end");

const faceStatus =
    document.getElementById("faceStatus");

let currentRole = "";
let currentStream = null;

let cameraEnabled = true;

let recognition = null;
let isListening = false;

// ==========================================
// FACE VERIFICATION STATE
// ==========================================

let faceVerified = false;

// ==========================================
// INITIAL MIC UI
// ==========================================

micLine.classList.remove("hidden");

micBtn.classList.add("mic-off");

// ==========================================
// ADD MESSAGE
// ==========================================

function addMessage(message, type) {

    const msgDiv =
        document.createElement("div");

    msgDiv.classList.add(
        type === "user"
            ? "user-message"
            : "ai-message"
    );

    msgDiv.innerText = message;

    chatMessages.appendChild(msgDiv);

    chatMessages.scrollTop =
        chatMessages.scrollHeight;
}

// ==========================================
// AI SPEAKING
// ==========================================

function speakAI(text) {

    try {

        window.speechSynthesis.cancel();

        const speech =
            new SpeechSynthesisUtterance(text);

        speech.lang = "en-US";

        speech.rate = 0.92;

        speech.pitch = 1;

        speech.volume = 1;

        window.speechSynthesis.speak(speech);

    }

    catch (error) {

        console.log(
            "Speech Error:",
            error
        );
    }
}

// ==========================================
// START CAMERA
// ==========================================

async function startCamera() {

    try {

        const stream =
            await navigator.mediaDevices.getUserMedia({

                video: true,
                audio: true
            });

        currentStream = stream;

        video.srcObject = stream;

        await video.play();

    }

    catch (error) {

        console.log(
            "Camera Error:",
            error
        );

        alert(
            "Please allow camera and microphone permissions."
        );
    }
}

// ==========================================
// SPEECH RECOGNITION
// ==========================================

function setupSpeechRecognition() {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    if (!SpeechRecognition) {

        alert(
            "Speech Recognition not supported in this browser. Please use Google Chrome."
        );

        return;
    }

    recognition = new SpeechRecognition();

    recognition.lang = "en-US";

    recognition.continuous = false;

    recognition.interimResults = false;

    recognition.maxAlternatives = 1;

    recognition.onstart = () => {

        console.log("Listening Started");

        isListening = true;

        micBtn.classList.remove("mic-off");

        micLine.classList.add("hidden");
    };

    recognition.onresult = (event) => {

        const transcript =
            event.results[0][0].transcript;

        console.log("User Said:", transcript);

        inputField.value = transcript;

        sendMessage();
    };

    recognition.onerror = (event) => {

        console.log(
            "Speech Recognition Error:",
            event.error
        );

        isListening = false;

        micBtn.classList.add("mic-off");

        micLine.classList.remove("hidden");

        if (event.error === "not-allowed") {

            alert(
                "Please allow microphone permission."
            );
        }
    };

    recognition.onend = () => {

        console.log("Listening Ended");

        isListening = false;

        micBtn.classList.add("mic-off");

        micLine.classList.remove("hidden");
    };
}

// ==========================================
// LOAD FACE API
// ==========================================

async function loadFaceAPI() {

    try {

        await faceapi.nets.tinyFaceDetector.loadFromUri(
            "/static/models"
        );

        console.log(
            "Face API Loaded Successfully"
        );

    }

    catch (error) {

        console.log(
            "Face API Loading Error:",
            error
        );
    }
}

// ==========================================
// START FACE DETECTION
// ==========================================

async function startFaceDetection() {

    setInterval(async () => {

        if (
            !cameraEnabled ||
            !video.srcObject
        ) {

            faceStatus.innerText =
                "Camera Off";

            faceStatus.classList.remove(
                "face-detected"
            );

            return;
        }

        try {

            if (
                video.readyState !== 4
            ) {
                return;
            }

            const detection =
                await faceapi.detectSingleFace(
                    video,
                    new faceapi.TinyFaceDetectorOptions({

                        inputSize: 416,

                        scoreThreshold: 0.3
                    })
                );

            if (detection) {

                faceStatus.innerText =
                    "Face Detected";

                faceStatus.classList.add(
                    "face-detected"
                );

                // ======================================
                // FACE DETECTED
                // ======================================

                localStorage.setItem(
                    "faceDetected",
                    "true"
                );

                // ======================================
                // VERIFY FACE ONLY ONCE
                // ======================================

                if (!faceVerified) {

                    faceVerified = true;

                    setTimeout(() => {

                        localStorage.setItem(
                            "faceVerified",
                            "true"
                        );

                        // ======================================
                        // ENABLE CONTINUE BUTTON
                        // ======================================

                        const continueButton =
    document.getElementById(
        "continueBtn"
    );

if (continueButton) {

    continueButton.removeAttribute(
        "disabled"
    );

    continueButton.disabled = false;

    continueButton.style.pointerEvents =
        "auto";

    continueButton.style.opacity =
        "1";

    continueButton.style.cursor =
        "pointer";
}
                        faceStatus.innerText =
                            "Face Verified";
                            // ======================================
                                 // CAPTURE LIVE FACE
                            // ======================================

                                   captureLiveFace();

                    }, 5000);
                }
            }

            else {

                faceStatus.innerText =
                    "No Face Detected";

                faceStatus.classList.remove(
                    "face-detected"
                );

                localStorage.setItem(
                    "faceDetected",
                    "false"
                );

                faceVerified = false;
            }

        }

        catch (error) {

            console.log(
                "Face Detection Error:",
                error
            );
        }

    }, 1000);
}

// ==========================================
// INITIAL LOAD
// ==========================================

window.onload = async () => {

    await startCamera();

    setupSpeechRecognition();

    await loadFaceAPI();

    setTimeout(() => {

        startFaceDetection();

    }, 2000);

    const welcomeMessage =
        "Hello, welcome to AI onboarding. Please introduce yourself.";

    addMessage(
        welcomeMessage,
        "ai"
    );

    // ======================================
    // AI INTERVIEW STARTED
    // ======================================

    localStorage.setItem(
        "aiInterviewCompleted",
        "true"
    );

    // ======================================
    // AUTO SPEAK AFTER PAGE LOAD
    // ======================================

    setTimeout(() => {

        const speech =
            new SpeechSynthesisUtterance(
                welcomeMessage
            );

        speech.lang = "en-US";

        speech.rate = 0.95;

        speech.pitch = 1;

        speech.volume = 1;

        window.speechSynthesis.getVoices();

        window.speechSynthesis.speak(
            speech
        );

    }, 1000);
    // ======================================
// TEMP FORCE ENABLE BUTTON
// ======================================

setTimeout(() => {

    const continueButton =
        document.getElementById(
            "continueBtn"
        );

    if (continueButton) {

        continueButton.removeAttribute(
            "disabled"
        );

        continueButton.disabled = false;

        continueButton.style.pointerEvents =
            "auto";

        continueButton.style.opacity =
            "1";
    }

}, 3000);
};

// ==========================================
// SEND MESSAGE
// ==========================================

async function sendMessage() {

    const userMessage =
        inputField.value.trim();

    if (!userMessage) return;

    addMessage(
        userMessage,
        "user"
    );

    inputField.value = "";

    const lowerText =
        userMessage.toLowerCase();

    if (lowerText.includes("intern")) {

        currentRole = "intern";
    }

    else if (lowerText.includes("employee")) {

        currentRole = "employee";
    }

    else if (lowerText.includes("vendor")) {

        currentRole = "vendor";
    }

    else if (lowerText.includes("hr")) {

        currentRole = "hr";
    }

    if (currentRole) {

        localStorage.setItem(
            "userRole",
            currentRole
        );
    }

    try {

        const response =
            await fetch("/chat", {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({

                    message: userMessage
                })
            });

        const data =
            await response.json();

        addMessage(
            data.reply,
            "ai"
        );

        setTimeout(() => {

            speakAI(data.reply);

        }, 300);
    }

    catch (error) {

        console.log(error);

        addMessage(
            "Server Error",
            "ai"
        );
    }
}

// ==========================================
// SEND BUTTON
// ==========================================

sendBtn.addEventListener(
    "click",
    sendMessage
);

// ==========================================
// ENTER KEY
// ==========================================

inputField.addEventListener(
    "keypress",
    (e) => {

        if (e.key === "Enter") {

            sendMessage();
        }
    }
);

// ==========================================
// CONTINUE BUTTON
// ==========================================

continueBtn.addEventListener(
    "click",
    () => {

        window.location.href =
            "/dashboard";
    }
);

// ==========================================
// MIC BUTTON
// ==========================================

micBtn.addEventListener(
    "click",
    async () => {

        if (!recognition) {

            setupSpeechRecognition();
        }

        try {

            await navigator.mediaDevices.getUserMedia({
                audio: true
            });

            if (isListening) {

                recognition.stop();
            }

            else {

                recognition.start();
            }

        }

        catch (error) {

            console.log(error);

            alert(
                "Microphone permission denied."
            );
        }
    }
);

// ==========================================
// CAMERA BUTTON
// ==========================================

cameraBtn.addEventListener(
    "click",
    () => {

        if (!currentStream) return;

        const videoTracks =
            currentStream.getVideoTracks();

        videoTracks.forEach(track => {

            track.enabled =
                !track.enabled;

            cameraEnabled =
                track.enabled;
        });

        if (cameraEnabled) {

            cameraLine.classList.add(
                "hidden"
            );

            cameraBtn.classList.remove(
                "camera-off"
            );

            faceStatus.innerText =
                "Checking...";
        }

        else {

            cameraLine.classList.remove(
                "hidden"
            );

            cameraBtn.classList.add(
                "camera-off"
            );

            faceStatus.innerText =
                "Camera Off";

            faceStatus.classList.remove(
                "face-detected"
            );
        }
    }
);

// ==========================================
// END BUTTON
// ==========================================

endBtn.addEventListener(
    "click",
    () => {

        window.speechSynthesis.cancel();

        if (
            recognition &&
            isListening
        ) {

            recognition.stop();
        }

        if (currentStream) {

            currentStream
                .getTracks()
                .forEach(track => {

                    track.stop();
                });
        }

        window.location.href = "/";
    }
);