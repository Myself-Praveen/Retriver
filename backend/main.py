from fastapi import FastAPI

app = FastAPI(title="Retriever API")

@app.get("/")
async def root():
    return {"message": "Welcome to the Retriever API"}
