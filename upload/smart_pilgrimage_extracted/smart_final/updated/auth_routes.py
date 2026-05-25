"""
Smart Pilgrimage — Auth routes with location support
Add this to your main FastAPI app (main.py or routes/auth.py)
"""
from fastapi import APIRouter, Request, Depends, Form, Response
from fastapi.responses import RedirectResponse, HTMLResponse
from sqlalchemy.orm import Session
from database import get_db
from models import User
import bcrypt, uuid

router = APIRouter(prefix="/api/auth")

@router.post("/register")
async def register(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
    first_name: str = Form(""),
    last_name: str = Form(""),
    email: str = Form(...),
    phone: str = Form(""),
    password: str = Form(...),
    region: str = Form(""),
    district: str = Form(""),
    latitude: str = Form(""),
    longitude: str = Form(""),
    location_display: str = Form(""),
    next: str = Form("/"),
):
    # Check if email already exists
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        return RedirectResponse(url="/auth?mode=register&error=email_exists", status_code=303)

    # Hash password
    pw_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

    # Build location string
    location_str = ""
    if district and region:
        location_str = f"{district}, {region}"
    elif region:
        location_str = region
    elif location_display:
        location_str = location_display

    # Parse coords
    lat = float(latitude) if latitude else None
    lon = float(longitude) if longitude else None

    user = User(
        id=str(uuid.uuid4()),
        email=email,
        phone=phone or None,
        password_hash=pw_hash,
        first_name=first_name or None,
        last_name=last_name or None,
        role="TOURIST",
        preferred_language="uz",
        # Store location info (add these columns to your User model if needed)
        # region=region,
        # district=district,
        # latitude=lat,
        # longitude=lon,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Set session cookie
    resp = RedirectResponse(url=next or "/", status_code=303)
    resp.set_cookie("user_id", user.id, httponly=True, max_age=86400*30)

    # Also save location to a separate cookie/session for search use
    if lat and lon:
        resp.set_cookie("user_lat", str(lat), httponly=False, max_age=86400*30)
        resp.set_cookie("user_lon", str(lon), httponly=False, max_age=86400*30)
        resp.set_cookie("user_location", location_str, httponly=False, max_age=86400*30)

    return resp


@router.post("/login")
async def login(
    request: Request,
    db: Session = Depends(get_db),
    email: str = Form(...),
    password: str = Form(...),
    next: str = Form("/"),
):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return RedirectResponse(url="/auth?mode=login&error=not_found", status_code=303)

    if not bcrypt.checkpw(password.encode(), user.password_hash.encode()):
        return RedirectResponse(url="/auth?mode=login&error=wrong_password", status_code=303)

    resp = RedirectResponse(url=next or "/", status_code=303)
    resp.set_cookie("user_id", user.id, httponly=True, max_age=86400*30)
    return resp
