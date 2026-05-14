import databases
import uuid
import json
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

DATABASE_URL = "postgresql://admin_nurmu:DPxH8G4jiJFInEAXnhXvkT4BpUrxF9cT@dpg-d80ur13bc2fs738hbp50-a.oregon-postgres.render.com/oquv_platformasi_db"

database = databases.Database(DATABASE_URL)
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    await database.connect()

    # Jadval yaratish — to'liq fieldlar bilan
    await database.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id          TEXT PRIMARY KEY,
            firstName   TEXT,
            lastName    TEXT,
            login       TEXT UNIQUE,
            password    TEXT,
            age         INTEGER,
            phone       TEXT,
            email       TEXT,
            passportId  TEXT,
            isAdmin     BOOLEAN DEFAULT FALSE,
            debt        NUMERIC DEFAULT 0,
            nextPaymentDate TEXT,
            enrolledCourses TEXT DEFAULT '[]',
            notifications   TEXT DEFAULT '[]'
        )
    """)

    # Admin foydalanuvchi yo'q bo'lsa avtomatik yaratish
    # Login: mentor | Parol: matematika
    existing = await database.fetch_one(
        "SELECT id FROM users WHERE login = :login",
        {"login": "mentor"}
    )
    if not existing:
        await database.execute("""
            INSERT INTO users (id, firstName, lastName, login, password, age, phone,
                               email, passportId, isAdmin, debt, nextPaymentDate,
                               enrolledCourses, notifications)
            VALUES (:id, :fn, :ln, :log, :pwd, :age, :phone,
                    :email, :pid, :admin, :debt, :npd, :ec, :notif)
        """, {
            "id":    str(uuid.uuid4()),
            "fn":    "Admin",
            "ln":    "Mentor",
            "log":   "mentor",
            "pwd":   "matematika",
            "age":   30,
            "phone": "+998901234567",
            "email": "admin@mavlonov.uz",
            "pid":   "ADMIN001",
            "admin": True,
            "debt":  0,
            "npd":   "",
            "ec":    "[]",
            "notif": "[]",
        })
        print("✅ Admin foydalanuvchi yaratildi: login=mentor, parol=matematika")

@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()


class User(BaseModel):
    firstName: str
    lastName: str
    login: str
    password: str
    age: Optional[int] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    passportId: Optional[str] = None
    isAdmin: bool = False
    debt: float = 0
    nextPaymentDate: Optional[str] = None
    enrolledCourses: list = []
    notifications: list = []


@app.get("/users")
async def get_users():
    rows = await database.fetch_all("SELECT * FROM users")
    result = []
    for row in rows:
        r = dict(row)
        # TEXT sifatida saqlangan JSON ni parse qilish
        r["enrolledCourses"] = json.loads(r["enrolledCourses"] or "[]")
        r["notifications"]   = json.loads(r["notifications"]   or "[]")
        result.append(r)
    return result


@app.post("/users")
async def save_user(user: User):
    # Duplicate tekshirish (backend tomonida ham)
    existing = await database.fetch_one(
        "SELECT id FROM users WHERE login=:login OR email=:email OR passportId=:pid",
        {"login": user.login, "email": user.email, "pid": user.passportId}
    )
    if existing:
        return {"status": "error", "message": "Login, email yoki passport ID allaqachon mavjud"}

    user_id = str(uuid.uuid4())
    await database.execute("""
        INSERT INTO users (id, firstName, lastName, login, password, age, phone,
                           email, passportId, isAdmin, debt, nextPaymentDate,
                           enrolledCourses, notifications)
        VALUES (:id, :fn, :ln, :login, :pwd, :age, :phone,
                :email, :pid, :admin, :debt, :npd, :ec, :notif)
    """, {
        "id":    user_id,
        "fn":    user.firstName,
        "ln":    user.lastName,
        "login": user.login,
        "pwd":   user.password,
        "age":   user.age,
        "phone": user.phone,
        "email": user.email,
        "pid":   user.passportId,
        "admin": user.isAdmin,
        "debt":  user.debt,
        "npd":   user.nextPaymentDate,
        "ec":    json.dumps(user.enrolledCourses),
        "notif": json.dumps(user.notifications),
    })
    return {"status": "success", "id": user_id}
