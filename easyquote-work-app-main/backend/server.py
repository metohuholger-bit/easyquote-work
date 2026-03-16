from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.responses import StreamingResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime, timezone, date
from io import BytesIO
import jwt

# Google Auth imports
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

# WeasyPrint imports
# from weasyprint import HTML  # Temporarily disabled
from jinja2 import Environment, FileSystemLoader

# Excel export
from openpyxl import Workbook
from openpyxl.styles import Font, Alignment, PatternFill, Border, Side

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Auth config
JWT_SECRET = os.environ.get('JWT_SECRET', 'supersecretjwtkey12345')
GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID')
ALGORITHM = "HS256"
security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token invalido")
        return user_id
    except jwt.PyJWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenziali non valide")

# Jinja2 template environment
template_loader = FileSystemLoader(str(ROOT_DIR / 'templates'))
template_env = Environment(loader=template_loader, autoescape=False)

# Create the main app
app = FastAPI(title="EasyQuote Work", version="1.0.0")
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ============= MODELS =============

class GoogleLoginRequest(BaseModel):
    credential: str

class User(BaseModel):
    id: str
    email: str
    name: str
    picture: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Customer(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(datetime.now(timezone.utc).timestamp()).replace('.', ''))
    user_id: str
    name: str = Field(..., min_length=1, max_length=255)
    phone: str = Field(..., min_length=1, max_length=50)
    address: str = Field(..., min_length=1, max_length=500)
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CustomerCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    phone: str = Field(..., min_length=1, max_length=50)
    address: str = Field(..., min_length=1, max_length=500)
    notes: Optional[str] = None

class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    notes: Optional[str] = None

class JobType(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(datetime.now(timezone.utc).timestamp()).replace('.', ''))
    user_id: str
    name: str = Field(..., min_length=1, max_length=255)
    unit: str = Field(..., min_length=1, max_length=50)
    price_per_unit: float = Field(..., ge=0)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class JobTypeCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    unit: str = Field(..., min_length=1, max_length=50)
    price_per_unit: float = Field(..., ge=0)

class JobTypeUpdate(BaseModel):
    name: Optional[str] = None
    unit: Optional[str] = None
    price_per_unit: Optional[float] = None

class QuoteLineItem(BaseModel):
    job_type_id: str
    job_name: str
    unit: str
    quantity: float = Field(..., gt=0)
    price_per_unit: float = Field(..., ge=0)
    total: float = Field(..., ge=0)

class Quote(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(datetime.now(timezone.utc).timestamp()).replace('.', ''))
    user_id: str
    quote_number: str
    customer_id: str
    customer_name: str
    customer_phone: str
    customer_address: str
    line_items: List[QuoteLineItem]
    subtotal: float
    iva: float
    total: float
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class QuoteCreate(BaseModel):
    customer_id: str
    line_items: List[QuoteLineItem] = Field(..., min_items=1)

class WorkReport(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(datetime.now(timezone.utc).timestamp()).replace('.', ''))
    user_id: str
    work_date: date
    customer_id: str
    customer_name: str
    job_site: str
    job_description: str
    hours_worked: float = Field(..., gt=0)
    earned_amount: float = Field(..., ge=0)
    hourly_rate: float
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class WorkReportCreate(BaseModel):
    work_date: date
    customer_id: str
    job_site: str
    job_description: str
    hours_worked: float = Field(..., gt=0)
    earned_amount: float = Field(..., ge=0)
    notes: Optional[str] = None

class WorkReportUpdate(BaseModel):
    work_date: Optional[date] = None
    customer_id: Optional[str] = None
    job_site: Optional[str] = None
    job_description: Optional[str] = None
    hours_worked: Optional[float] = None
    earned_amount: Optional[float] = None
    notes: Optional[str] = None

class CompanySettings(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default="company_settings")
    user_id: str
    company_name: str = Field(..., min_length=1, max_length=255)
    owner_name: str = Field(..., min_length=1, max_length=255)
    vat_number: str = Field(..., min_length=1, max_length=50)
    tax_code: str = Field(..., min_length=1, max_length=50)
    address: str = Field(..., min_length=1, max_length=500)
    phone: str = Field(..., min_length=1, max_length=50)
    email: str = Field(..., min_length=1, max_length=100)
    logo_base64: Optional[str] = None
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CompanySettingsUpdate(BaseModel):
    company_name: Optional[str] = None
    owner_name: Optional[str] = None
    vat_number: Optional[str] = None
    tax_code: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    logo_base64: Optional[str] = None

# ============= HELPER FUNCTIONS =============

async def html_to_pdf(html_string: str, base_url: Optional[str] = None) -> bytes:
    # Temporarily disabled WeasyPrint
    return b"%PDF-1.4\n%Dummy PDF for testing\n"

# ============= AUTHENTICATION ROUTES =============

@api_router.post("/auth/google")
async def google_auth(request: GoogleLoginRequest):
    try:
        idinfo = id_token.verify_oauth2_token(request.credential, google_requests.Request(), GOOGLE_CLIENT_ID)
        userid = idinfo['sub']
        email = idinfo.get('email')
        name = idinfo.get('name', 'User')
        picture = idinfo.get('picture')
        
        user = await db.users.find_one({"id": userid})
        if not user:
            user = {
                "id": userid,
                "email": email,
                "name": name,
                "picture": picture,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.users.insert_one(user)
            
        token_data = {"sub": userid, "email": email}
        access_token = jwt.encode(token_data, JWT_SECRET, algorithm=ALGORITHM)
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": userid,
                "name": name,
                "email": email,
                "picture": picture
            }
        }
    except ValueError as e:
        logger.error(f"Google Token Verification failed: {e}")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token Google non valido")
    except Exception as e:
        logger.error(f"Google Auth unexpected error: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Errore interno del server")

# ============= CUSTOMER ROUTES =============

@api_router.post("/customers", response_model=Customer)
async def create_customer(customer: CustomerCreate, current_user: str = Depends(get_current_user)):
    customer_dict = customer.model_dump()
    customer_dict['user_id'] = current_user
    customer_obj = Customer(**customer_dict)
    
    doc = customer_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.customers.insert_one(doc)
    return customer_obj

@api_router.get("/customers", response_model=List[Customer])
async def get_customers(search: Optional[str] = None, current_user: str = Depends(get_current_user)):
    query = {"user_id": current_user}
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"phone": {"$regex": search, "$options": "i"}}
        ]
    
    customers = await db.customers.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    for customer in customers:
        if isinstance(customer['created_at'], str):
            customer['created_at'] = datetime.fromisoformat(customer['created_at'])
    return customers

@api_router.get("/customers/{customer_id}", response_model=Customer)
async def get_customer(customer_id: str, current_user: str = Depends(get_current_user)):
    customer = await db.customers.find_one({"id": customer_id, "user_id": current_user}, {"_id": 0})
    if not customer:
        raise HTTPException(status_code=404, detail="Cliente non trovato")
    if isinstance(customer['created_at'], str):
        customer['created_at'] = datetime.fromisoformat(customer['created_at'])
    return customer

@api_router.put("/customers/{customer_id}", response_model=Customer)
async def update_customer(customer_id: str, customer_update: CustomerUpdate, current_user: str = Depends(get_current_user)):
    update_dict = {k: v for k, v in customer_update.model_dump().items() if v is not None}
    if not update_dict:
        raise HTTPException(status_code=400, detail="Nessun campo da aggiornare")
        
    result = await db.customers.update_one(
        {"id": customer_id, "user_id": current_user},
        {"$set": update_dict}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Cliente non trovato")
        
    customer = await db.customers.find_one({"id": customer_id}, {"_id": 0})
    if isinstance(customer['created_at'], str):
        customer['created_at'] = datetime.fromisoformat(customer['created_at'])
    return customer

@api_router.delete("/customers/{customer_id}")
async def delete_customer(customer_id: str, current_user: str = Depends(get_current_user)):
    result = await db.customers.delete_one({"id": customer_id, "user_id": current_user})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Cliente non trovato")
    return {"message": "Cliente eliminato con successo"}

# ============= JOB TYPE ROUTES =============

@api_router.post("/job-types", response_model=JobType)
async def create_job_type(job_type: JobTypeCreate, current_user: str = Depends(get_current_user)):
    job_type_dict = job_type.model_dump()
    job_type_dict['user_id'] = current_user
    job_type_obj = JobType(**job_type_dict)
    
    doc = job_type_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.job_types.insert_one(doc)
    return job_type_obj

@api_router.get("/job-types", response_model=List[JobType])
async def get_job_types(current_user: str = Depends(get_current_user)):
    job_types = await db.job_types.find({"user_id": current_user}, {"_id": 0}).sort("name", 1).to_list(1000)
    for job_type in job_types:
        if isinstance(job_type['created_at'], str):
            job_type['created_at'] = datetime.fromisoformat(job_type['created_at'])
    return job_types

@api_router.get("/job-types/{job_type_id}", response_model=JobType)
async def get_job_type(job_type_id: str, current_user: str = Depends(get_current_user)):
    job_type = await db.job_types.find_one({"id": job_type_id, "user_id": current_user}, {"_id": 0})
    if not job_type:
        raise HTTPException(status_code=404, detail="Tipo di lavoro non trovato")
    if isinstance(job_type['created_at'], str):
        job_type['created_at'] = datetime.fromisoformat(job_type['created_at'])
    return job_type

@api_router.put("/job-types/{job_type_id}", response_model=JobType)
async def update_job_type(job_type_id: str, job_type_update: JobTypeUpdate, current_user: str = Depends(get_current_user)):
    update_dict = {k: v for k, v in job_type_update.model_dump().items() if v is not None}
    if not update_dict:
        raise HTTPException(status_code=400, detail="Nessun campo da aggiornare")
        
    result = await db.job_types.update_one(
        {"id": job_type_id, "user_id": current_user},
        {"$set": update_dict}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Tipo di lavoro non trovato")
        
    job_type = await db.job_types.find_one({"id": job_type_id}, {"_id": 0})
    if isinstance(job_type['created_at'], str):
        job_type['created_at'] = datetime.fromisoformat(job_type['created_at'])
    return job_type

@api_router.delete("/job-types/{job_type_id}")
async def delete_job_type(job_type_id: str, current_user: str = Depends(get_current_user)):
    result = await db.job_types.delete_one({"id": job_type_id, "user_id": current_user})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Tipo di lavoro non trovato")
    return {"message": "Tipo di lavoro eliminato con successo"}

# ============= QUOTE ROUTES =============

@api_router.post("/quotes", response_model=Quote)
async def create_quote(quote_create: QuoteCreate, current_user: str = Depends(get_current_user)):
    customer = await db.customers.find_one({"id": quote_create.customer_id, "user_id": current_user}, {"_id": 0})
    if not customer:
        raise HTTPException(status_code=404, detail="Cliente non trovato")
    
    subtotal = sum(item.total for item in quote_create.line_items)
    iva = subtotal * 0.22
    total = subtotal + iva
    
    count = await db.quotes.count_documents({"user_id": current_user}) + 1
    quote_number = f"PRV-{datetime.now(timezone.utc).year}-{count:04d}"
    
    quote_obj = Quote(
        user_id=current_user,
        quote_number=quote_number,
        customer_id=quote_create.customer_id,
        customer_name=customer['name'],
        customer_phone=customer['phone'],
        customer_address=customer['address'],
        line_items=quote_create.line_items,
        subtotal=subtotal,
        iva=iva,
        total=total
    )
    
    doc = quote_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.quotes.insert_one(doc)
    return quote_obj

@api_router.get("/quotes", response_model=List[Quote])
async def get_quotes(customer_id: Optional[str] = None, search: Optional[str] = None, current_user: str = Depends(get_current_user)):
    query = {"user_id": current_user}
    if customer_id:
        query["customer_id"] = customer_id
    if search:
        query["$or"] = [
            {"customer_name": {"$regex": search, "$options": "i"}},
            {"quote_number": {"$regex": search, "$options": "i"}}
        ]
    
    quotes = await db.quotes.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    for quote in quotes:
        if isinstance(quote['created_at'], str):
            quote['created_at'] = datetime.fromisoformat(quote['created_at'])
    return quotes

@api_router.get("/quotes/{quote_id}", response_model=Quote)
async def get_quote(quote_id: str, current_user: str = Depends(get_current_user)):
    quote = await db.quotes.find_one({"id": quote_id, "user_id": current_user}, {"_id": 0})
    if not quote:
        raise HTTPException(status_code=404, detail="Preventivo non trovato")
    if isinstance(quote['created_at'], str):
        quote['created_at'] = datetime.fromisoformat(quote['created_at'])
    return quote

@api_router.get("/quotes/{quote_id}/pdf")
async def download_quote_pdf(quote_id: str, current_user: str = Depends(get_current_user)):
    quote = await db.quotes.find_one({"id": quote_id, "user_id": current_user}, {"_id": 0})
    if not quote:
        raise HTTPException(status_code=404, detail="Preventivo non trovato")
    if isinstance(quote['created_at'], str):
        quote['created_at'] = datetime.fromisoformat(quote['created_at'])
    
    company_settings = await db.company_settings.find_one({"id": "company_settings", "user_id": current_user}, {"_id": 0})
    if not company_settings:
        company_settings = {
            "company_name": "Configura le Impostazioni Aziendali",
            "owner_name": "Titolare",
            "vat_number": "IT00000000000",
            "tax_code": "XXXXXXXXXXX",
            "address": "Indirizzo",
            "phone": "+39 000 0000000",
            "email": "info@example.com",
            "logo_base64": None
        }
    
    context = {
        "quote_number": quote['quote_number'],
        "quote_date": datetime.fromisoformat(quote['created_at']).strftime("%d/%m/%Y") if isinstance(quote['created_at'], str) else quote['created_at'].strftime("%d/%m/%Y"),
        "customer_name": quote['customer_name'],
        "customer_address": quote['customer_address'],
        "customer_phone": quote['customer_phone'],
        "line_items": quote['line_items'],
        "subtotal": f"{quote['subtotal']:.2f}",
        "iva": f"{quote['iva']:.2f}",
        "total": f"{quote['total']:.2f}",
        "company": company_settings
    }
    
    template = template_env.get_template('quote.html')
    html_content = template.render(**context)
    pdf_bytes = await html_to_pdf(html_content, base_url=str(ROOT_DIR / 'templates'))
    
    filename = f"Preventivo_{quote['quote_number']}.pdf"
    return StreamingResponse(
        BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=\"{filename}\""}
    )

@api_router.delete("/quotes/{quote_id}")
async def delete_quote(quote_id: str, current_user: str = Depends(get_current_user)):
    result = await db.quotes.delete_one({"id": quote_id, "user_id": current_user})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Preventivo non trovato")
    return {"message": "Preventivo eliminato con successo"}

# ============= WORK REPORT ROUTES =============

@api_router.post("/work-reports", response_model=WorkReport)
async def create_work_report(report_create: WorkReportCreate, current_user: str = Depends(get_current_user)):
    customer = await db.customers.find_one({"id": report_create.customer_id, "user_id": current_user}, {"_id": 0})
    if not customer:
        raise HTTPException(status_code=404, detail="Cliente non trovato")
    
    hourly_rate = report_create.earned_amount / report_create.hours_worked
    
    report_obj = WorkReport(
        user_id=current_user,
        work_date=report_create.work_date,
        customer_id=report_create.customer_id,
        customer_name=customer['name'],
        job_site=report_create.job_site,
        job_description=report_create.job_description,
        hours_worked=report_create.hours_worked,
        earned_amount=report_create.earned_amount,
        hourly_rate=hourly_rate,
        notes=report_create.notes
    )
    
    doc = report_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['work_date'] = doc['work_date'].isoformat()
    
    await db.work_reports.insert_one(doc)
    return report_obj

@api_router.get("/work-reports", response_model=List[WorkReport])
async def get_work_reports(month: Optional[int] = None, year: Optional[int] = None, current_user: str = Depends(get_current_user)):
    query = {"user_id": current_user}
    if month and year:
        start_date = date(year, month, 1)
        end_date = date(year + 1, 1, 1) if month == 12 else date(year, month + 1, 1)
        query["work_date"] = {"$gte": start_date.isoformat(), "$lt": end_date.isoformat()}
    
    reports = await db.work_reports.find(query, {"_id": 0}).sort("work_date", -1).to_list(1000)
    for report in reports:
        if isinstance(report['created_at'], str):
            report['created_at'] = datetime.fromisoformat(report['created_at'])
        if isinstance(report['work_date'], str):
            report['work_date'] = date.fromisoformat(report['work_date'])
    return reports

@api_router.get("/work-reports/{report_id}", response_model=WorkReport)
async def get_work_report(report_id: str, current_user: str = Depends(get_current_user)):
    report = await db.work_reports.find_one({"id": report_id, "user_id": current_user}, {"_id": 0})
    if not report:
        raise HTTPException(status_code=404, detail="Report non trovato")
    if isinstance(report['created_at'], str):
        report['created_at'] = datetime.fromisoformat(report['created_at'])
    if isinstance(report['work_date'], str):
        report['work_date'] = date.fromisoformat(report['work_date'])
    return report

@api_router.put("/work-reports/{report_id}", response_model=WorkReport)
async def update_work_report(report_id: str, report_update: WorkReportUpdate, current_user: str = Depends(get_current_user)):
    update_dict = {k: v for k, v in report_update.model_dump().items() if v is not None}
    if not update_dict:
        raise HTTPException(status_code=400, detail="Nessun campo da aggiornare")
    
    if 'hours_worked' in update_dict or 'earned_amount' in update_dict:
        report = await db.work_reports.find_one({"id": report_id, "user_id": current_user}, {"_id": 0})
        if not report:
            raise HTTPException(status_code=404, detail="Report non trovato")
        hours = update_dict.get('hours_worked', report['hours_worked'])
        amount = update_dict.get('earned_amount', report['earned_amount'])
        update_dict['hourly_rate'] = amount / hours
    
    if 'customer_id' in update_dict:
        customer = await db.customers.find_one({"id": update_dict['customer_id'], "user_id": current_user}, {"_id": 0})
        if not customer:
            raise HTTPException(status_code=404, detail="Cliente non trovato")
        update_dict['customer_name'] = customer['name']
    
    if 'work_date' in update_dict:
        update_dict['work_date'] = update_dict['work_date'].isoformat()
    
    result = await db.work_reports.update_one(
        {"id": report_id, "user_id": current_user},
        {"$set": update_dict}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Report non trovato")
        
    report = await db.work_reports.find_one({"id": report_id}, {"_id": 0})
    if isinstance(report['created_at'], str):
        report['created_at'] = datetime.fromisoformat(report['created_at'])
    if isinstance(report['work_date'], str):
        report['work_date'] = date.fromisoformat(report['work_date'])
    return report

@api_router.delete("/work-reports/{report_id}")
async def delete_work_report(report_id: str, current_user: str = Depends(get_current_user)):
    result = await db.work_reports.delete_one({"id": report_id, "user_id": current_user})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Report non trovato")
    return {"message": "Report eliminato con successo"}

@api_router.get("/work-reports/summary/monthly")
async def get_monthly_summary(month: Optional[int] = None, year: Optional[int] = None, current_user: str = Depends(get_current_user)):
    if not month or not year:
        today = date.today()
        month, year = today.month, today.year
    
    start_date = date(year, month, 1)
    end_date = date(year + 1, 1, 1) if month == 12 else date(year, month + 1, 1)
    
    query = {
        "user_id": current_user,
        "work_date": {"$gte": start_date.isoformat(), "$lt": end_date.isoformat()}
    }
    reports = await db.work_reports.find(query, {"_id": 0}).to_list(1000)
    
    total_hours = sum(report['hours_worked'] for report in reports)
    total_earnings = sum(report['earned_amount'] for report in reports)
    average_hourly = total_earnings / total_hours if total_hours > 0 else 0
    
    return {
        "month": month,
        "year": year,
        "total_hours": round(total_hours, 2),
        "total_earnings": round(total_earnings, 2),
        "average_hourly_rate": round(average_hourly, 2),
        "reports_count": len(reports)
    }

@api_router.get("/work-reports/export/excel")
async def export_work_reports_excel(month: Optional[int] = None, year: Optional[int] = None, current_user: str = Depends(get_current_user)):
    if not month or not year:
        today = date.today()
        month, year = today.month, today.year
    
    start_date = date(year, month, 1)
    end_date = date(year + 1, 1, 1) if month == 12 else date(year, month + 1, 1)
    
    query = {
        "user_id": current_user,
        "work_date": {"$gte": start_date.isoformat(), "$lt": end_date.isoformat()}
    }
    reports = await db.work_reports.find(query, {"_id": 0}).sort("work_date", -1).to_list(1000)
    
    total_hours = sum(report['hours_worked'] for report in reports)
    total_earnings = sum(report['earned_amount'] for report in reports)
    average_hourly = total_earnings / total_hours if total_hours > 0 else 0
    
    wb = Workbook()
    ws = wb.active
    ws.title = f"Report {month:02d}-{year}"
    
    header_fill = PatternFill(start_color="1B3A24", end_color="1B3A24", fill_type="solid")
    header_font = Font(bold=True, color="FFFFFF", size=12)
    border = Border(left=Side(style='thin'), right=Side(style='thin'), top=Side(style='thin'), bottom=Side(style='thin'))
    
    ws.merge_cells('A1:H1')
    ws['A1'] = f"REPORT ORE - {month:02d}/{year}"
    ws['A1'].font = Font(bold=True, size=14)
    ws['A1'].alignment = Alignment(horizontal='center', vertical='center')
    
    headers = ["Data", "Cliente", "Indirizzo", "Descrizione", "Ore", "Importo", "€/Ora", "Note"]
    for col, header in enumerate(headers, start=1):
        cell = ws.cell(row=8, column=col)
        cell.value = header
        cell.font = header_font
        cell.fill = header_fill
        cell.alignment = Alignment(horizontal='center', vertical='center')
        cell.border = border
    
    row = 9
    for report in reports:
        if isinstance(report['work_date'], str):
            report_date = date.fromisoformat(report['work_date'])
        else:
            report_date = report['work_date']
            
        ws.cell(row=row, column=1, value=report_date.strftime('%d/%m/%Y'))
        ws.cell(row=row, column=2, value=report['customer_name'])
        ws.cell(row=row, column=3, value=report['job_site'])
        ws.cell(row=row, column=4, value=report['job_description'])
        ws.cell(row=row, column=5, value=report['hours_worked']).number_format = '0.00'
        ws.cell(row=row, column=6, value=report['earned_amount']).number_format = '€#,##0.00'
        ws.cell(row=row, column=7, value=report['hourly_rate']).number_format = '€#,##0.00'
        ws.cell(row=row, column=8, value=report.get('notes', ''))
        
        for col in range(1, 9):
            ws.cell(row=row, column=col).border = border
        row += 1
        
    excel_file = BytesIO()
    wb.save(excel_file)
    excel_file.seek(0)
    
    filename = f"Report_Ore_{month:02d}_{year}.xlsx"
    return StreamingResponse(
        excel_file,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename=\"{filename}\""}
    )

# ============= COMPANY SETTINGS ROUTES =============

@api_router.get("/company-settings", response_model=CompanySettings)
async def get_company_settings(current_user: str = Depends(get_current_user)):
    settings = await db.company_settings.find_one({"id": "company_settings", "user_id": current_user}, {"_id": 0})
    if not settings:
        return CompanySettings(
            user_id=current_user,
            company_name="Nome Azienda",
            owner_name="Nome Titolare",
            vat_number="IT00000000000",
            tax_code="XXXXXXXXXXX",
            address="Via Esempio 1, 00000 Città",
            phone="+39 000 0000000",
            email="info@azienda.it"
        )
    if isinstance(settings['updated_at'], str):
        settings['updated_at'] = datetime.fromisoformat(settings['updated_at'])
    return settings

@api_router.put("/company-settings", response_model=CompanySettings)
async def update_company_settings(settings_update: CompanySettingsUpdate, current_user: str = Depends(get_current_user)):
    existing = await db.company_settings.find_one({"id": "company_settings", "user_id": current_user}, {"_id": 0})
    
    if existing:
        update_dict = {k: v for k, v in settings_update.model_dump().items() if v is not None}
        update_dict['updated_at'] = datetime.now(timezone.utc).isoformat()
        
        await db.company_settings.update_one(
            {"id": "company_settings", "user_id": current_user},
            {"$set": update_dict}
        )
        settings = await db.company_settings.find_one({"id": "company_settings", "user_id": current_user}, {"_id": 0})
    else:
        settings_dict = settings_update.model_dump(exclude_unset=True)
        settings_dict['user_id'] = current_user
        settings_obj = CompanySettings(**settings_dict)
        doc = settings_obj.model_dump()
        doc['updated_at'] = doc['updated_at'].isoformat()
        
        await db.company_settings.insert_one(doc)
        settings = doc
    
    if isinstance(settings['updated_at'], str):
        settings['updated_at'] = datetime.fromisoformat(settings['updated_at'])
    return settings

# ============= MAIN =============

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
