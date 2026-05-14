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
    await database.execute("DROP TABLE IF EXISTS users")
    await database.execute("""
        CREATE TABLE users (
            id TEXT PRIMARY KEY, firstName TEXT, lastName TEXT,
            login TEXT UNIQUE, password TEXT, age INTEGER,
            phone TEXT, email TEXT, passportId TEXT,
            isAdmin BOOLEAN DEFAULT FALSE, debt NUMERIC DEFAULT 0,
            nextPaymentDate TEXT, enrolledCourses TEXT DEFAULT '[]',
            notifications TEXT DEFAULT '[]'
        )
    """)
    existing = await database.fetch_one(
        "SELECT id FROM users WHERE login = :login", {"login": "mentor"}
    )
    if not existing:
        await database.execute("""
            INSERT INTO users (id, firstName, lastName, login, password, age, phone,
                               email, passportId, isAdmin, debt, nextPaymentDate,
                               enrolledCourses, notifications)
            VALUES (:id, :firstName, :lastName, :login, :password, :age, :phone,
                    :email, :passportId, :isAdmin, :debt, :nextPaymentDate, :ec, :notif)
        """, {
            "id": str(uuid.uuid4()),
            "firstName": "Admin", "lastName": "Mentor",
            "login": "mentor", "password": "matematika",
            "age": 30, "phone": "+998901234567",
            "email": "admin@mavlonov.uz",
            "passportId": "ADMIN001", "isAdmin": True,
            "debt": 0, "nextPaymentDate": "",
            "ec": "[]", "notif": "[]",
        })

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
        r["enrolledCourses"] = json.loads(r["enrolledCourses"] or "[]")
        r["notifications"] = json.loads(r["notifications"] or "[]")
        result.append(r)
    return result

@app.post("/users")
async def save_user(user: User):
    existing = await database.fetch_one(
        "SELECT id FROM users WHERE login=:login OR email=:email OR passportId=:passportId",
        {"login": user.login, "email": user.email, "passportId": user.passportId}
    )
    if existing:
        return {"status": "error", "message": "Login, email yoki passport ID allaqachon mavjud"}

    user_id = str(uuid.uuid4())
    await database.execute("""
        INSERT INTO users (id, firstName, lastName, login, password, age, phone,
                           email, passportId, isAdmin, debt, nextPaymentDate,
                           enrolledCourses, notifications)
        VALUES (:id, :firstName, :lastName, :login, :password, :age, :phone,
                :email, :passportId, :isAdmin, :debt, :nextPaymentDate, :ec, :notif)
    """, {
        "id": user_id,
        "firstName": user.firstName, "lastName": user.lastName,
        "login": user.login, "password": user.password,
        "age": user.age, "phone": user.phone,
        "email": user.email, "passportId": user.passportId,
        "isAdmin": user.isAdmin, "debt": user.debt,
        "nextPaymentDate": user.nextPaymentDate,
        "ec": json.dumps(user.enrolledCourses),
        "notif": json.dumps(user.notifications),
    })
    return {"status": "success", "id": user_id}
