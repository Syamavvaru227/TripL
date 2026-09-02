from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.schemas import AuthResponse, LoginRequest, RegisterRequest, UserOut, SendOtpRequest, VerifyOtpRequest, PhoneLoginRequest, PhoneRegisterRequest, ForgotPasswordRequest, CheckPhoneRequest
from app.services.auth import create_access_token, decode_access_token, hash_password, verify_password
from app.services.email import send_welcome_email
from app.services.otp import generate_otp, verify_otp

router = APIRouter(prefix="/api/auth", tags=["authentication"])
bearer_scheme = HTTPBearer()


def current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    claims = decode_access_token(credentials.credentials)
    user = db.query(User).filter(User.id == int(claims["sub"]), User.is_active == True).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User account is unavailable.")
    return user


def _auth_response(user: User, welcome_email_sent: bool = False) -> AuthResponse:
    return AuthResponse(
        access_token=create_access_token(user.id), user=UserOut.model_validate(user),
        welcome_email_sent=welcome_email_sent,
    )


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(User.id).filter(User.email == payload.email).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="An account with this email already exists.")
    user = User(
        full_name=payload.full_name.strip(), email=payload.email,
        password_hash=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return _auth_response(user, welcome_email_sent=send_welcome_email(user.email, user.full_name))


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not user.is_active or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password.")
    return _auth_response(user)


@router.post("/check-phone")
def check_phone(payload: CheckPhoneRequest, db: Session = Depends(get_db)):
    if not verify_otp(payload.phone, payload.otp):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired OTP.")
    user = db.query(User).filter(User.phone == payload.phone).first()
    return {"exists": user is not None, "phone": payload.phone}


@router.post("/send-otp")
def send_otp(payload: SendOtpRequest):
    otp = generate_otp(payload.phone)
    return {
        "message": f"OTP sent to {payload.phone}",
        "phone": payload.phone,
        "otp_debug": otp,
    }


@router.post("/register-phone", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register_phone(payload: PhoneRegisterRequest, db: Session = Depends(get_db)):
    if not verify_otp(payload.phone, payload.otp):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired OTP.")
    if db.query(User.id).filter(User.phone == payload.phone).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="An account with this phone number already exists.")
    if db.query(User.id).filter(User.email == payload.email).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="An account with this email already exists.")
    phone_user = User(
        full_name=payload.full_name.strip(),
        email=payload.email.strip().casefold(),
        phone=payload.phone,
        password_hash=hash_password(payload.password),
    )
    db.add(phone_user)
    db.commit()
    db.refresh(phone_user)
    return _auth_response(phone_user, welcome_email_sent=send_welcome_email(phone_user.email, phone_user.full_name))


@router.post("/login-phone", response_model=AuthResponse)
def login_phone(payload: PhoneLoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.phone == payload.phone).first()
    if not user or not user.is_active or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect phone number or password.")
    return _auth_response(user)


@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    if not verify_otp(payload.phone, payload.otp):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired OTP.")
    user = db.query(User).filter(User.phone == payload.phone).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Account not found.")
    user.password_hash = hash_password(payload.new_password)
    db.commit()
    return {"message": "Password reset successful. You can now login with your new password."}


@router.get("/me", response_model=UserOut)
def get_current_user(user: User = Depends(current_user)):
    return user
