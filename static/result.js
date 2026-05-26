// ==========================================
// GET LOCAL STORAGE DATA
// ==========================================

const documentStatus =
    localStorage.getItem(
        "documentVerified"
    ) || "Suspicious";

const confidenceScore =
    localStorage.getItem(
        "confidenceScore"
    ) || "0%";

const analysisSummary =
    localStorage.getItem(
        "analysisSummary"
    ) || "No Analysis Found";

const faceVerified =
    localStorage.getItem(
        "faceVerified"
    ) || "false";

const aiInterview =
    localStorage.getItem(
        "aiInterviewCompleted"
    ) || "false";

// ==========================================
// STATUS ELEMENTS
// ==========================================

document.getElementById(
    "verificationStatus"
).innerText =
    documentStatus;

document.getElementById(
    "confidenceScore"
).innerText =
    confidenceScore;

document.getElementById(
    "analysisSummary"
).innerText =
    analysisSummary;

// ==========================================
// FACE STATUS
// ==========================================

document.getElementById(
    "faceStatus"
).innerText =

    faceVerified === "true"
    ? "Successfully Matched"
    : "Verification Failed";

// ==========================================
// AI SCREENING STATUS
// ==========================================

document.getElementById(
    "aiScreeningStatus"
).innerText =

    aiInterview === "true"
    ? "Completed"
    : "Pending";

// ==========================================
// IDENTITY VALIDATION STATUS
// ==========================================

document.getElementById(
    "identityStatus"
).innerText =

    documentStatus === "Verified"
    ? "Approved"
    : "Suspicious";

// ==========================================
// DOCUMENT ANALYSIS STATUS
// ==========================================

document.getElementById(
    "documentStatus"
).innerText =
    documentStatus;

// ==========================================
// DYNAMIC COLORS
// ==========================================

const statusBadge =
    document.getElementById(
        "verificationStatus"
    );

if (
    documentStatus === "Verified"
) {

    statusBadge.style.background =
        "#16A34A";
}

else if (
    documentStatus ===
    "Moderate Confidence"
) {

    statusBadge.style.background =
        "#D97706";
}

else {

    statusBadge.style.background =
        "#DC2626";
}

// ==========================================
// DOWNLOAD REPORT BUTTON
// ==========================================

document.getElementById(
    "downloadBtn"
).addEventListener(
    "click",
    () => {

        window.print();
    }
);

// ==========================================
// FINISH ONBOARDING BUTTON
// ==========================================

document.getElementById(
    "finishBtn"
).addEventListener(
    "click",
    () => {

        alert(
            "Onboarding Completed Successfully!"
        );

        localStorage.clear();

        window.location.href = "/";
    }
);