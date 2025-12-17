import modal

# Minimal image with just what we need
image = modal.Image.debian_slim(python_version="3.11").pip_install(
    "vllm==0.6.6.post1",
    "torch==2.5.1",
    "fastapi",
    "pydantic",
)

app = modal.App("natlas-test")

# SIMPLEST endpoint possible
@app.function(image=image)
@modal.fastapi_endpoint()
def hello():
    return {"message": "Hello from N-ATLaS API"}

# Model class without volumes first
@app.cls(image=image, gpu="A100", scaledown_window=300)
class SimpleModel:
    @modal.enter()
    def load(self):
        print("Model would load here")
    
    @modal.method()
    def generate(self, prompt: str):
        return f"Mock response to: {prompt}"

@app.local_entrypoint()
def deploy():
    print("Deploying minimal test...")