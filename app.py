# app.py
from flask import Flask, render_template, request, jsonify, session
from flask_mail import Mail, Message
from flask_cors import CORS
from dotenv import load_dotenv
import os, random, time

load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY")

CORS(app)


app.config["MAIL_SERVER"] = "smtp-relay.brevo.com"
app.config["MAIL_PORT"] = 2525
app.config["MAIL_USE_TLS"] = True
app.config["MAIL_USE_SSL"] = False

app.config["MAIL_USERNAME"] = os.getenv("EMAIL_USER")
app.config["MAIL_PASSWORD"] = os.getenv("EMAIL_PASS")
app.config["MAIL_DEFAULT_SENDER"] = "pritirekha7978@gmail.com"

mail = Mail(app)

# ==========================
# Home Route
# ==========================
@app.route("/")
def home():
    return render_template("index.html")


# ==========================
# Send OTP
# ==========================
@app.route("/send-otp", methods=["POST"])
def send_otp():
    data = request.get_json(force=True)

    email = data.get("email", "").strip().lower()

    print("VISITOR EMAIL RECEIVED:", repr(email))

    if not email:
        return jsonify({
            "success": False,
            "message": "Email is required"
        }), 400

    if "@" not in email or "." not in email:
        return jsonify({
            "success": False,
            "message": "Enter a valid email address"
        }), 400

    otp = str(random.randint(100000, 999999))

    session["otp"] = otp
    session["otp_email"] = email
    session["otp_expiry"] = time.time() + 120   # 2 minutes

    try:
        msg = Message(
            subject=f"Your OTP Code: {otp}",
            recipients=[email]
        )

        msg.body = f"""
Hello,

Your verification code is: {otp}

This OTP will expire in 2 minutes.

If you did not request this code, please ignore this email.

Regards,
Pritirekha Mishra
"""

        msg.html = f"""
        <div style="font-family:Arial,sans-serif;padding:20px">
            <h2>Your OTP Verification Code</h2>
            <p style="font-size:28px;font-weight:bold;letter-spacing:4px;">{otp}</p>
            <p>This code expires in <b>2 minutes</b>.</p>
            <p>If you did not request this, ignore this email.</p>
            <br>
            <p>Pritirekha Mishra Portfolio</p>
        </div>
        """

        print("MAIL RECIPIENTS:", msg.recipients)

        mail.send(msg)

        return jsonify({
            "success": True,
            "message": f"Verification code sent to {email}",
            "expires_in": 120
        })

    except Exception as e:
        print("MAIL ERROR:", str(e))
        return jsonify({
            "success": False,
            "message": "Unable to send OTP right now"
        }), 500

# ==========================
# Verify OTP + Send Message
# ==========================
@app.route("/verify-contact", methods=["POST"])
def verify_contact():
    data = request.get_json()

    name = data.get("name")
    email = data.get("email")
    otp = data.get("otp")
    message = data.get("message")

    if session.get("otp_email") != email:
        return jsonify({"success": False, "message": "Email mismatch"}), 400

    if time.time() > session.get("otp_expiry", 0):
        return jsonify({"success": False, "message": "OTP expired"}), 400

    if otp != session.get("otp"):
        return jsonify({"success": False, "message": "Invalid OTP"}), 400

    try:
        msg = Message(
            subject="New Verified Portfolio Contact Message",
            recipients=[os.getenv("EMAIL_USER")]
        )

        msg.body = f"""
New Verified Contact Message

Name: {name}
Email: {email}

Message:
{message}
"""

        mail.send(msg)

        session.pop("otp", None)
        session.pop("otp_email", None)
        session.pop("otp_expiry", None)

        return jsonify({"success": True, "message": "Message sent successfully"})

    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)