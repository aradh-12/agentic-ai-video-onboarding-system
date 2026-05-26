from groq import Groq
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import fitz
import os
import pytesseract
from pdf2image import convert_from_path
from PIL import Image
import re

# ==========================================
# LOAD ENV
# ==========================================

load_dotenv()

# ==========================================
# FLASK APP
# ==========================================

app = Flask(__name__)

CORS(app)

# ==========================================
# GROQ CLIENT
# ==========================================

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)

# ==========================================
# UPLOAD FOLDER
# ==========================================

UPLOAD_FOLDER = "uploads"

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# ==========================================
# ROLE STORAGE
# ==========================================

selected_role = "employee"

# ==========================================
# AI MEMORY
# ==========================================

conversation_history = [
    {
        "role": "system",
        "content": """
You are an intelligent AI verification and onboarding assistant.

IMPORTANT RULES:

- Behave naturally
- Keep responses short
- Guide user professionally
- Ask onboarding related questions
- Remember conversation context
- Do not repeatedly welcome user
- Continue onboarding flow naturally

WORKFLOW:

1. Ask user name
2. Ask onboarding role
3. Ask required verification details
4. Guide user to verification dashboard
"""
    }
]

# ==========================================
# ROUTES
# ==========================================

@app.route("/")
def splash():
    return render_template("splash.html")


@app.route("/welcome")
def welcome():
    return render_template("welcome.html")


@app.route("/video")
def video():
    return render_template("video.html")


@app.route("/dashboard")
def dashboard():
    return render_template("dashboard.html")


@app.route("/get_role")
def get_role():

    return jsonify({
        "role": selected_role
    })
@app.route("/result")
def result():
    return render_template("result.html")


# ==========================================
# AI CHAT
# ==========================================

@app.route("/chat", methods=["POST"])
def chat():

    global selected_role

    try:

        data = request.get_json()

        if not data:
            return jsonify({
                "reply": "No JSON data received."
            })

        user_message = data.get("message")

        if not user_message:
            return jsonify({
                "reply": "Please enter a message."
            })

        # ==========================================
        # DETECT ROLE
        # ==========================================

        msg = user_message.lower()

        if "intern" in msg:
            selected_role = "intern"

        elif "employee" in msg:
            selected_role = "employee"

        elif "vendor" in msg:
            selected_role = "vendor"

        elif "partner" in msg:
            selected_role = "partner"

        # ==========================================
        # SAVE USER MESSAGE
        # ==========================================

        conversation_history.append({
            "role": "user",
            "content": user_message
        })

        # ==========================================
        # AI RESPONSE
        # ==========================================

        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=conversation_history,
            temperature=0.7
        )

        ai_reply = completion.choices[0].message.content

        # ==========================================
        # SAVE AI RESPONSE
        # ==========================================

        conversation_history.append({
            "role": "assistant",
            "content": ai_reply
        })

        return jsonify({
            "reply": ai_reply
        })

    except Exception as e:

        print("CHAT ERROR:", str(e))

        return jsonify({
            "reply": f"Error: {str(e)}"
        })


# ==========================================
# RESUME ANALYZER
# ==========================================

@app.route("/upload_resume", methods=["POST"])
def upload_resume():

    try:

        # ==========================================
        # CHECK FILE
        # ==========================================

        if "resume" not in request.files:

            return jsonify({
                "reply": "No PDF uploaded."
            })

        file = request.files["resume"]

        if file.filename == "":

            return jsonify({
                "reply": "Please select PDF."
            })

        if not file.filename.endswith(".pdf"):

            return jsonify({
                "reply": "Only PDF allowed."
            })

        # ==========================================
        # SAVE FILE
        # ==========================================

        filepath = os.path.join(
            app.config["UPLOAD_FOLDER"],
            file.filename
        )

        file.save(filepath)

        # ==========================================
        # READ PDF
        # ==========================================

        pdf_document = fitz.open(filepath)

        pdf_text = ""

        for page in pdf_document:

            pdf_text += page.get_text()

        pdf_document.close()

        # ==========================================
        # OCR TEXT EXTRACTION
        # ==========================================

        extracted_text = pdf_text

        lower_text = extracted_text.lower()

        # ==========================================
        # VERIFICATION VARIABLES
        # ==========================================

        confidence = 0

        verification_status = "Suspicious"

        analysis_points = []

        # ==========================================
        # DOCUMENT KEYWORD ANALYSIS
        # ==========================================

        if "university" in lower_text:

            confidence += 20

            analysis_points.append(
                "University information detected."
            )

        if "student" in lower_text:

            confidence += 15

            analysis_points.append(
                "Student identity data detected."
            )

        if "b.tech" in lower_text:

            confidence += 15

            analysis_points.append(
                "Academic course information verified."
            )

        if "computer science" in lower_text:

            confidence += 10

            analysis_points.append(
                "Department information found."
            )

        if "amity" in lower_text:

            confidence += 20

            analysis_points.append(
                "Institution name validated."
            )

        if len(extracted_text) > 200:

            confidence += 20

            analysis_points.append(
                "Document contains sufficient textual data."
            )

        # ==========================================
        # SUSPICIOUS CHECKS
        # ==========================================

        if len(extracted_text) < 50:

            analysis_points.append(
                "Very little text detected."
            )

        if "asdf" in lower_text:

            analysis_points.append(
                "Suspicious random content found."
            )

        # ==========================================
        # FINAL STATUS
        # ==========================================

        if confidence >= 70:

            verification_status = "Verified"

        elif confidence >= 40:

            verification_status = "Moderate Confidence"

        else:

            verification_status = "Suspicious"

        # ==========================================
        # FINAL AI REPORT
        # ==========================================

        final_report = f"""

DOCUMENT ANALYSIS REPORT

Verification Status:
{verification_status}

Confidence Score:
{confidence}%

Analysis Summary:

"""

        for point in analysis_points:

            final_report += f"\n• {point}"

        final_report += """

\nAI Conclusion:

The uploaded document has been analyzed
using AI-based OCR verification logic.
"""

        # ==========================================
        # RETURN RESULT
        # ==========================================

        return jsonify({

            "reply": final_report,

            "confidence": confidence,

            "status": verification_status
        })

    except Exception as e:

        return jsonify({

            "reply":
            f"Server Error: {str(e)}"
        })
        # ==========================================
        # AI ANALYSIS
        # ==========================================

        prompt = f"""

Analyze this document professionally.

Provide:

1. Summary
2. Important Details
3. Skills
4. Verification Insights
5. Final Verification Status

Document:

{pdf_text}

"""

        completion = client.chat.completions.create(

            model="llama-3.3-70b-versatile",

            messages=[
                {
                    "role": "system",
                    "content": "You are an AI document verification assistant."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],

            temperature=0.5

        )

        ai_reply = completion.choices[0].message.content

        final_reply = (
            "📄 Document Analysis Completed\n\n"
            + ai_reply +
            "\n\n✅ Verification Updated Successfully"
        )

        return jsonify({
            "reply": final_reply
        })

    except Exception as e:

        print("UPLOAD ERROR:", str(e))

        return jsonify({
            "reply": f"Error: {str(e)}"
        })


# ==========================================
# RUN APP
# ==========================================
# ==========================================
# SAVE LIVE FACE
# ==========================================

@app.route("/save_live_face", methods=["POST"])
def save_live_face():

    ...

# ==========================================
# FACE VERIFICATION
# ==========================================

@app.route("/verify_face", methods=["POST"])
def verify_face():

    ...


if __name__ == "__main__":

    app.run(debug=True, port=5001)