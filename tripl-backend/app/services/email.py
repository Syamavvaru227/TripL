"""Transactional email helpers with HTML templates and dev-mode fallback."""

import logging
import os
import smtplib
import ssl
from email.message import EmailMessage
from pathlib import Path

logger = logging.getLogger(__name__)

# Directory to store emails in dev mode (when SMTP is not configured)
DEV_EMAIL_DIR = Path(__file__).parent.parent.parent / "dev_emails"


def _welcome_html(full_name: str) -> str:
    """Return a beautiful HTML welcome email body."""
    return f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  body {{ margin: 0; padding: 0; background: #FAFAF5; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }}
  .container {{ max-width: 600px; margin: 0 auto; background: #ffffff; }}
  .header {{
    background: linear-gradient(135deg, #1E1B4B 0%, #006B75 50%, #E8621A 100%);
    padding: 40px 30px; text-align: center; border-radius: 0 0 20px 20px;
  }}
  .header h1 {{ color: #ffffff; font-size: 28px; margin: 0 0 8px 0; font-weight: 800; }}
  .header p {{ color: rgba(255,255,255,0.8); font-size: 14px; margin: 0; }}
  .logo {{ font-size: 36px; margin-bottom: 12px; }}
  .content {{ padding: 36px 30px; }}
  .greeting {{ font-size: 18px; color: #1C1917; font-weight: 600; margin-bottom: 16px; }}
  .message {{ font-size: 15px; color: #78716C; line-height: 1.7; margin-bottom: 24px; }}
  .features {{ background: #F5ECD7; border-radius: 12px; padding: 20px; margin: 24px 0; }}
  .features h3 {{ font-size: 16px; color: #1E1B4B; margin: 0 0 12px 0; }}
  .feature-item {{ display: flex; align-items: center; gap: 10px; padding: 6px 0; font-size: 14px; color: #1C1917; }}
  .feature-emoji {{ font-size: 20px; }}
  .cta-button {{
    display: inline-block; background: #E8621A; color: #ffffff !important;
    padding: 14px 32px; border-radius: 12px; text-decoration: none;
    font-weight: 700; font-size: 16px; margin: 20px 0;
    box-shadow: 0 4px 20px rgba(232,98,26,0.35);
  }}
  .footer {{
    background: #1E1B4B; padding: 24px 30px; text-align: center;
    border-radius: 20px 20px 0 0; margin-top: 20px;
  }}
  .footer p {{ color: rgba(255,255,255,0.5); font-size: 12px; margin: 4px 0; }}
  .footer a {{ color: #E8621A; text-decoration: none; }}
  .divider {{
    text-align: center; margin: 24px 0; position: relative;
  }}
  .divider::before {{
    content: ""; position: absolute; top: 50%; left: 0; right: 0;
    height: 1px; background: #E8E0D5;
  }}
  .divider span {{
    background: #ffffff; padding: 0 16px; position: relative;
    color: #E8621A; font-size: 18px;
  }}
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <div class="logo">🗺️</div>
    <h1>Welcome to TripL!</h1>
    <p>Smart Indian Tourism & AI Travel Planning</p>
  </div>

  <div class="content">
    <div class="greeting">Namaste {full_name}! 🙏</div>

    <p class="message">
      Thank you for joining TripL — your gateway to discovering India's incredible
      tourist destinations. We're thrilled to have you on board!
    </p>

    <p class="message">
      Your account has been created successfully. You can now start exploring
      hidden gems, planning AI-powered journeys, and experiencing India like never before.
    </p>

    <div class="divider"><span>✦</span></div>

    <div class="features">
      <h3>Here's what you can do with TripL:</h3>
      <div class="feature-item"><span class="feature-emoji">📍</span> Discover tourist places within 30 km of any location</div>
      <div class="feature-item"><span class="feature-emoji">✨</span> Generate AI-powered personalized itineraries</div>
      <div class="feature-item"><span class="feature-emoji">🏛️</span> Learn cultural stories behind every destination</div>
      <div class="feature-item"><span class="feature-emoji">🚗</span> Compare travel options with real-time costs</div>
      <div class="feature-item"><span class="feature-emoji">♻️</span> Travel responsibly with eco-friendly suggestions</div>
    </div>

    <div style="text-align: center;">
      <a href="http://localhost:5173/explore?city=Visakhapatnam" class="cta-button">
        Start Exploring →
      </a>
    </div>

    <p class="message" style="font-size: 13px; margin-top: 24px;">
      If you have any questions, feel free to reach out to us at
      <a href="mailto:support@tripl.app" style="color: #E8621A;">support@tripl.app</a>.
    </p>
  </div>

  <div class="footer">
    <p>Made with ❤️ for Smart India Hackathon 2025</p>
    <p><a href="http://localhost:5173">TripL</a> — Explore India. Understand India. Experience India.</p>
    <p style="margin-top: 8px;">This email was sent to you because you registered on TripL.</p>
  </div>
</div>
</body>
</html>"""


def _save_dev_email(recipient: str, subject: str, html_body: str) -> bool:
    """Save email to disk in dev mode for inspection."""
    try:
        DEV_EMAIL_DIR.mkdir(exist_ok=True)
        import time
        filename = f"{int(time.time())}_{recipient.replace('@','_at_')}.html"
        filepath = DEV_EMAIL_DIR / filename
        filepath.write_text(
            f"<!-- Subject: {subject} -->\n"
            f"<!-- To: {recipient} -->\n"
            f"<!-- Date: {time.strftime('%Y-%m-%d %H:%M:%S')} -->\n\n"
            f"{html_body}",
            encoding="utf-8",
        )
        logger.info(f"Dev email saved to {filepath}")
        return True
    except Exception:
        logger.exception("Failed to save dev email")
        return False


def send_welcome_email(recipient: str, full_name: str) -> bool:
    """Send the TripL registration welcome email.

    In development (when SMTP_HOST is not set), saves the email to disk
    so it can be previewed in a browser.
    """
    host = os.getenv("SMTP_HOST")
    sender = os.getenv("SMTP_FROM_EMAIL")
    subject = "Welcome to TripL! 🗺️ — Your Indian Journey Begins"
    html_body = _welcome_html(full_name)

    # ── Dev mode: save email to disk ──────────────────────────────────────
    if not host or not sender:
        logger.info("SMTP not configured — saving welcome email to dev_emails/")
        return _save_dev_email(recipient, subject, html_body)

    # ── Production mode: send via SMTP ────────────────────────────────────
    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = os.getenv("SMTP_FROM_NAME", "TripL") + f" <{sender}>"
    message["To"] = recipient
    message.set_content(
        f"Hi {full_name},\n\n"
        "Thanks for registering with TripL! Your account is ready.\n\n"
        "Happy exploring,\nThe TripL team"
    )
    message.add_alternative(html_body, subtype="html")

    try:
        port = int(os.getenv("SMTP_PORT", "587"))
        username = os.getenv("SMTP_USERNAME")
        password = os.getenv("SMTP_PASSWORD")
        use_ssl = os.getenv("SMTP_USE_SSL", "false").casefold() == "true"
        if use_ssl:
            with smtplib.SMTP_SSL(host, port, context=ssl.create_default_context(), timeout=10) as client:
                if username and password:
                    client.login(username, password)
                client.send_message(message)
        else:
            with smtplib.SMTP(host, port, timeout=10) as client:
                client.starttls(context=ssl.create_default_context())
                if username and password:
                    client.login(username, password)
                client.send_message(message)
        logger.info(f"Welcome email sent to {recipient}")
        return True
    except (OSError, smtplib.SMTPException, ValueError):
        logger.exception("Welcome email delivery failed")
        # Fallback: save to disk so the email is not lost
        return _save_dev_email(recipient, subject, html_body)
