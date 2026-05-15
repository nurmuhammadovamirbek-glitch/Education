import asyncpg
import uuid
import json
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

DATABASE_URL = "postgresql://admin_nurmu:DPxH8G4jiJFInEAXnhXvkT4BpUrxF9cT@dpg-d80ur13bc2fs738hbp50-a.oregon-postgres.render.com/oquv_platformasi_db"

app = FastAPI()
pool = None

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://education-hm99.onrender.com",
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    global pool
    pool = await asyncpg.create_pool(DATABASE_URL)
    async with pool.acquire() as conn:
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                firstName TEXT,
                lastName TEXT,
                login TEXT UNIQUE,
                password TEXT,
                age INTEGER,
                phone TEXT,
                email TEXT,
                passportId TEXT,
                isAdmin BOOLEAN DEFAULT FALSE,
                debt NUMERIC DEFAULT 0,
                nextPaymentDate TEXT,
                enrolledCourses TEXT DEFAULT '[]',
                notifications TEXT DEFAULT '[]'
            )
        """)
        existing = await conn.fetchrow("SELECT id FROM users WHERE login = $1", "mentor")
        if not existing:
            await conn.execute("""
                INSERT INTO users (id, firstName, lastName, login, password,
                    age, phone, email, passportId, isAdmin, debt,
                    nextPaymentDate, enrolledCourses, notifications)
                VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
            """, str(uuid.uuid4()), "Admin", "Mentor", "mentor", "matematika",
                30, "+998901234567", "admin@mavlonov.uz", "ADMIN001",
                True, 0, "", "[]", "[]")
        print("Startup muvaffaqiyatli!")

@app.on_event("shutdown")
async def shutdown():
    await pool.close()


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


class PasswordUpdate(BaseModel):
    password: str


class UserUpdate(BaseModel):
    enrolledCourses: Optional[list] = None
    notifications: Optional[list] = None
    debt: Optional[float] = None
    nextPaymentDate: Optional[str] = None


# Barcha userlarni olish
@app.get("/users")
async def get_users():
    async with pool.acquire() as conn:
        rows = await conn.fetch("SELECT * FROM users")
        result = []
        for row in rows:
            r = dict(row)
            result.append({
                "id": r.get("id"),
                "firstName": r.get("firstname"),
                "lastName": r.get("lastname"),
                "login": r.get("login"),
                "password": r.get("password"),
                "age": r.get("age"),
                "phone": r.get("phone"),
                "email": r.get("email"),
                "passportId": r.get("passportid"),
                "isAdmin": r.get("isadmin"),
                "debt": r.get("debt"),
                "nextPaymentDate": r.get("nextpaymentdate"),
                "enrolledCourses": json.loads(r.get("enrolledcourses") or "[]"),
                "notifications": json.loads(r.get("notifications") or "[]"),
            })
        return result


# Yangi user yaratish
@app.post("/users")
async def save_user(user: User):
    async with pool.acquire() as conn:
        existing = await conn.fetchrow(
            "SELECT id FROM users WHERE login=$1 OR email=$2 OR passportId=$3",
            user.login, user.email, user.passportId
        )
        if existing:
            return {"status": "error", "message": "Login, email yoki passport ID allaqachon mavjud"}

        user_id = str(uuid.uuid4())
        await conn.execute("""
            INSERT INTO users (id, firstName, lastName, login, password,
                age, phone, email, passportId, isAdmin, debt,
                nextPaymentDate, enrolledCourses, notifications)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
        """, user_id, user.firstName, user.lastName, user.login, user.password,
            user.age, user.phone, user.email, user.passportId, user.isAdmin,
            user.debt, user.nextPaymentDate,
            json.dumps(user.enrolledCourses), json.dumps(user.notifications))
        return {"status": "success", "id": user_id}


# Userni yangilash (davomat, ogohlantirish, kurs ma'lumotlari)
@app.put("/users/{user_id}")
async def update_user(user_id: str, updates: UserUpdate):
    async with pool.acquire() as conn:
        sets = []
        values = []
        i = 1

        if updates.enrolledCourses is not None:
            sets.append(f"enrolledCourses=${i}")
            values.append(json.dumps(updates.enrolledCourses))
            i += 1

        if updates.notifications is not None:
            sets.append(f"notifications=${i}")
            values.append(json.dumps(updates.notifications))
            i += 1

        if updates.debt is not None:
            sets.append(f"debt=${i}")
            values.append(updates.debt)
            i += 1

        if updates.nextPaymentDate is not None:
            sets.append(f"nextPaymentDate=${i}")
            values.append(updates.nextPaymentDate)
            i += 1

        if not sets:
            return {"status": "no changes"}

        values.append(user_id)
        query = f"UPDATE users SET {', '.join(sets)} WHERE id=${i}"
        await conn.execute(query, *values)
        return {"status": "success"}


# Parolni yangilash
@app.put("/users/{user_id}/password")
async def update_password(user_id: str, body: PasswordUpdate):
    async with pool.acquire() as conn:
        await conn.execute("UPDATE users SET password=$1 WHERE id=$2", body.password, user_id)
        return {"status": "success"}


# Userni o'chirish
@app.delete("/users/{user_id}")
async def delete_user(user_id: str):
    async with pool.acquire() as conn:
        await conn.execute("DELETE FROM users WHERE id=$1", user_id)
        return {"status": "success"}
