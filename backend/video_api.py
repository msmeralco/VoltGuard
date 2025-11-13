from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import socketio
import sys
from pathlib import Path
import uvicorn
import signal
import base64

sys.path.insert(0, str(Path(__file__).parent.parent))
from model.check import get_frame as get_video_frame, stats

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create Socket.IO server
sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins='*'
)

# Wrap with ASGI app
socket_app = socketio.ASGIApp(sio, app)

@sio.event
async def connect(sid, environ):
    print(f"Client connected: {sid}")

@sio.event
async def disconnect(sid):
    print(f"Client disconnected: {sid}")

@sio.event
async def get_frame(sid, data):
    frame_bytes, current_stats = get_video_frame()
    
    if frame_bytes:
        frame_b64 = base64.b64encode(frame_bytes).decode('utf-8')
        await sio.emit('frame', {
            'image': frame_b64,
            'stats': current_stats
        }, room=sid)
    else:
        await sio.emit('error', {'message': 'Failed to grab frame'}, room=sid)

@app.get("/stats")
def get_stats():
    return stats

@app.on_event("shutdown")
def shutdown_event():
    """Cleanup on shutdown"""
    print("Shutting down VoltGuard API...")
    from model.check import camera
    if camera:
        camera.release()
    import cv2
    cv2.destroyAllWindows()

if __name__ == "__main__":
    def signal_handler(sig, frame):
        print("\nReceived termination signal. Shutting down gracefully...")
        sys.exit(0)
    
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    print("Starting VoltGuard API on http://0.0.0.0:8000")
    print("Press Ctrl+C to stop")
    
    uvicorn.run(socket_app, host="0.0.0.0", port=8000, log_level="info")