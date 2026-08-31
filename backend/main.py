from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from scraper import scrape_telegram_channel

app = FastAPI(title="Telegram Portfolio Generator API")

# Enable CORS so your vanilla frontend can talk to the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/portfolio/{The.Hijabi Coder()}")
def get_portfolio(channel_name: str):
    data = scrape_telegram_channel(channel_name)
    if "error" in data:
        raise HTTPException(status_code=404, detail=data["error"])
    return data