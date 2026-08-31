from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from scraper import scrape_telegram_channel
from database import SessionLocal, PortfolioBoost
import datetime

app = FastAPI(title="Telegram Portfolio Ecosystem API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/api/portfolio/{channel_name}")
def get_portfolio(channel_name: str, db: Session = Depends(get_db)):
    data = scrape_telegram_channel(channel_name)
    if "error" in data:
        raise HTTPException(status_code=404, detail=data["error"])
    
    # Calculate streak/heatmap activity based on post dates
    # (For MVP, we simulate contribution dates from scraped posts)
    projects = data["projects"]
    
    # Attach boost counts from DB
    for idx, proj in enumerate(projects):
        proj_id = f"{channel_name}_{idx}"
        proj['project_id'] = proj_id
        boost_record = db.query(PortfolioBoost).filter(PortfolioBoost.project_id == proj_id).first()
        proj['boosts'] = boost_record.count if boost_record else 0

    data["streak"] = len(projects) * 2  # Simulated streak metric based on activity
    return data

@app.post("/api/boost/{channel_name}/{project_id}")
def boost_project(channel_name: str, project_id: str, db: Session = Depends(get_db)):
    boost_record = db.query(PortfolioBoost).filter(PortfolioBoost.project_id == project_id).first()
    if not boost_record:
        boost_record = PortfolioBoost(channel_name=channel_name, project_id=project_id, count=1)
        db.add(boost_record)
    else:
        boost_record.count += 1
    db.commit()
    return {"success": True, "new_count": boost_record.count}

@app.post("/api/chat/{channel_name}")
def ask_portfolio(channel_name: str, query_data: dict):
    # Lightweight keyword-based RAG matching against channel posts
    question = query_data.get("question", "").lower()
    data = scrape_telegram_channel(channel_name)
    
    if "error" in data:
        raise HTTPException(status_code=404, detail="Channel not found")
        
    matching_posts = []
    for proj in data["projects"]:
        if any(word in proj["text"].lower() for word in question.split()):
            matching_posts.append(proj["text"][:200] + "...")
            
    if not matching_posts:
        return {"answer": f"I couldn't find any specific mentions regarding '{question}' in @{channel_name}'s recent history."}
        
    return {"answer": f"Found {len(matching_posts)} relevant update(s): " + " | ".join(matching_posts[:2])}