import random
import time
from typing import Optional

_otp_store: dict[str, dict] = {}
OTP_EXPIRY_SECONDS = 300  # 5 minutes


def generate_otp(phone: str) -> str:
    otp = f"{random.randint(100000, 999999)}"
    _otp_store[phone] = {"otp": otp, "created_at": time.time()}
    return otp


def verify_otp(phone: str, otp: str) -> bool:
    record = _otp_store.get(phone)
    if not record:
        return False
    if time.time() - record["created_at"] > OTP_EXPIRY_SECONDS:
        del _otp_store[phone]
        return False
    if record["otp"] != otp:
        return False
    del _otp_store[phone]
    return True


def get_stored_otp(phone: str) -> Optional[str]:
    record = _otp_store.get(phone)
    if not record:
        return None
    if time.time() - record["created_at"] > OTP_EXPIRY_SECONDS:
        del _otp_store[phone]
        return None
    return record["otp"]
