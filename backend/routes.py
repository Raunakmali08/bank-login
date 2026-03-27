from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
import database, models, schemas, security

router = APIRouter()

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(request: Request, db: Session = Depends(get_db)):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    token = auth_header.split(" ")[1]
    try:
        payload = security.jwt.decode(token, security.SECRET_KEY, algorithms=[security.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except security.jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.query(models.User).filter(models.User.username == username).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user

@router.post("/auth/register", response_model=schemas.UserResponse)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    hashed_password = security.get_password_hash(user.password)
    new_user = models.User(username=user.username, password_hash=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/auth/login")
def login(request: Request, user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if not db_user or not security.verify_password(user.password, db_user.password_hash):
        raise HTTPException(status_code=401, detail={"message": "Incorrect username or password"})

    ip = request.client.host or "127.0.0.1"
    user_agent = request.headers.get("user-agent", "")
    fingerprint = security.generate_fingerprint(ip, user_agent)

    device = db.query(models.Device).filter(
        models.Device.user_id == db_user.id,
        models.Device.fingerprint == fingerprint
    ).first()

    if not device:
        total_devices = db.query(models.Device).filter(models.Device.user_id == db_user.id).count()
        if total_devices == 0:
            new_device = models.Device(user_id=db_user.id, fingerprint=fingerprint, is_trusted=True)
            db.add(new_device)
            db.commit()
        else:
            raise HTTPException(status_code=403, detail={"message": "Unrecognized device", "fingerprint": fingerprint})
    elif not device.is_trusted:
        raise HTTPException(status_code=403, detail={"message": "Unrecognized device", "fingerprint": fingerprint})

    access_token_expires = security.timedelta(minutes=security.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        data={"sub": db_user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/auth/devices/approve")
def approve_device(approval: schemas.DeviceApprove, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.username == approval.username).first()
    if not db_user or not security.verify_password(approval.password, db_user.password_hash):
        raise HTTPException(status_code=401, detail={"message": "Incorrect credentials for approval"})
    
    device = db.query(models.Device).filter(
        models.Device.user_id == db_user.id,
        models.Device.fingerprint == approval.fingerprint
    ).first()

    if device:
        device.is_trusted = True
    else:
        device = models.Device(user_id=db_user.id, fingerprint=approval.fingerprint, is_trusted=True)
        db.add(device)
    
    db.commit()
    return {"message": "Device approved successfully"}

@router.get("/auth/me", response_model=schemas.UserResponse)
def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user

@router.get("/auth/devices", response_model=list[schemas.DeviceResponse])
def get_devices(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    devices = db.query(models.Device).filter(models.Device.user_id == current_user.id).all()
    return devices

@router.delete("/auth/devices/{device_id}")
def delete_device(device_id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    device = db.query(models.Device).filter(
        models.Device.id == device_id,
        models.Device.user_id == current_user.id
    ).first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    
    db.delete(device)
    db.commit()
    return {"message": "Device deleted"}
