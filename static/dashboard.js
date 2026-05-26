const uploadGrid =
    document.getElementById("uploadGrid");

const roleText =
    document.getElementById("roleText");

const role =
    localStorage.getItem("userRole");

// ==========================================
// RESET OLD VERIFICATION DATA
// ==========================================

localStorage.removeItem(
    "documentsUploaded"
);

localStorage.removeItem(
    "documentVerified"
);

localStorage.removeItem(
    "confidenceScore"
);

localStorage.removeItem(
    "analysisSummary"
);

// ==========================================
// ROLE TEXT
// ==========================================

roleText.innerText =
    `Detected Role: ${role}`;

// ==========================================
// DOCUMENTS BASED ON ROLE
// ==========================================

let documents = [];

if (role === "intern") {

    documents = [

        "Resume",
        "Student ID",
        "College Letter"
    ];
}

else if (role === "employee") {

    documents = [

        "PAN Card",
        "Aadhaar Card",
        "Experience Letter"
    ];
}

else if (role === "vendor") {

    documents = [

        "GST Certificate",
        "Company PAN",
        "Business License"
    ];
}

else if (role === "hr") {

    documents = [

        "Employee ID",
        "Offer Letter",
        "Resume"
    ];
}

else {

    documents = [

        "Resume"
    ];
}

// ==========================================
// CREATE CARDS
// ==========================================

documents.forEach((doc) => {

    const card = document.createElement("div");

    card.classList.add("upload-card");

    card.innerHTML = `

        <h2>${doc}</h2>

        <input type="file"
               id="${doc}Input">

        <button id="${doc}Btn">

            Upload ${doc}

        </button>

    `;

    uploadGrid.appendChild(card);

    // ======================================
    // BUTTON EVENT
    // ======================================

    const button =
        card.querySelector("button");

    const input =
        card.querySelector("input");

    button.addEventListener(
        "click",
        async () => {

            const file =
                input.files[0];

            if (!file) {

                alert(
                    `Please select ${doc}`
                );

                return;
            }

            const formData =
                new FormData();

            formData.append(
                "resume",
                file
            );

            document.getElementById(
                "analysisResult"
            ).innerText =
                "AI is analyzing document...";

            try {

                const response =
                    await fetch(
                        "/upload_resume",
                        {
                            method:"POST",
                            body:formData
                        }
                    );

                const data =
                    await response.json();

                // ======================================
                // SHOW AI RESULT
                // ======================================

                document.getElementById(
                    "analysisResult"
                ).innerText =
                    data.reply ||
                    "Document Analysis Completed";

                // ======================================
                // DOCUMENT STATUS
                // ======================================

                localStorage.setItem(
                    "documentsUploaded",
                    "true"
                );

                // ======================================
                // REAL AI VERIFICATION STATUS
                // ======================================

                localStorage.setItem(
                    "documentVerified",
                    data.status
                );

                // ======================================
                // FACE STATUS
                // ======================================

                localStorage.setItem(
                    "faceVerified",
                    localStorage.getItem(
                        "faceVerified"
                    ) || "false"
                );

                localStorage.setItem(
                    "faceDetected",
                    localStorage.getItem(
                        "faceDetected"
                    ) || "false"
                );

                // ======================================
                // REAL CONFIDENCE SCORE
                // ======================================

                localStorage.setItem(
                    "confidenceScore",
                    data.confidence + "%"
                );

                // ======================================
                // AI ANALYSIS SUMMARY
                // ======================================

                localStorage.setItem(
                    "analysisSummary",
                    data.reply ||
                    "Document Analysis Completed"
                );

                // ======================================
                // SUCCESS MESSAGE
                // ======================================

                const faceVerified =
    localStorage.getItem(
        "faceVerified"
    );

if (faceVerified !== "true") {

    alert(
        "Face verification required.\n\nPlease go back and complete live face verification."
    );

    return;
}

alert(
    "Document Uploaded Successfully"
);

            }

            catch(error){

                console.log(error);

                document.getElementById(
                    "analysisResult"
                ).innerText =
                    "Upload Failed";

                localStorage.setItem(
                    "documentsUploaded",
                    "false"
                );

                localStorage.setItem(
                    "documentVerified",
                    "false"
                );

                localStorage.setItem(
                    "confidenceScore",
                    "0%"
                );

                localStorage.setItem(
                    "analysisSummary",
                    "Verification Failed"
                );
            }
        }
    );
});

// ==========================================
// ANALYZE DOCUMENTS BUTTON
// ==========================================

document.getElementById(
    "viewResultBtn"
).addEventListener(
    "click",
    () => {

        const uploaded =
            localStorage.getItem(
                "documentsUploaded"
            );

        if (!uploaded || uploaded !== "true") {

            alert(
                "Please upload and analyze documents first."
            );

            return;
        }

        window.location.href =
            "/result";
    }
);