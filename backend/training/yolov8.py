from ultralytics import YOLO
from roboflow import Roboflow
import os


rf = Roboflow(api_key="SAjIDoHyinT3LPVcslpx")
project = rf.workspace("france-7awpa").project("voltguard-svtev")
version = project.version(3)
dataset = version.download("yolov8")
                
                

# The dataset variable now holds the folder path, like '/content/voltguard-svtev-1'
data_yaml = os.path.join(dataset.location, "data.yaml")

# --- Step 2: Train YOLOv8 model ---
# Option 1 (Recommended): use Python API
model = YOLO("yolov8n.pt")
model.train(data=data_yaml, epochs=200, imgsz=640, batch=16, project="runs/train", name="voltguard")

# Option 2 (Colab-style magic command)
# !yolo task=detect mode=train model=yolov8n.pt data={data_yaml} epochs=100 imgsz=640
