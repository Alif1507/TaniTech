from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, ai, marketplace, weather, content
from routers.content import ensure_initial_content
from config import logger, settings

app = FastAPI(
    title="TaniTech Backend API",
    description="REST API for TaniTech - AI & IoT-based agriculture platform & marketplace",
    version="1.0"
)

# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(ai.router)
app.include_router(marketplace.router)
app.include_router(weather.router)
app.include_router(content.router)

@app.on_event("startup")
def startup_event():
    logger.info("TaniTech Backend is starting up...")
    # Pre-populate static content (articles, faqs, categories) on boot
    ensure_initial_content()

@app.get("/")
def read_root():
    return {
        "app": "TaniTech Backend API",
        "version": "1.0",
        "documentation": "/docs",
        "status": "healthy"
    }

if __name__ == "__main__":
    import uvicorn
    # Use default port 8000
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
