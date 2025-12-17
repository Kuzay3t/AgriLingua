import modal
from modal import NetworkFileSystem
import os

# Set HF mirror endpoint to improve reliability

# Define the container image with vLLM and dependencies
vllm_image = (
    modal.Image.debian_slim(python_version="3.11")
    .pip_install(
        "vllm==0.6.6.post1",  # Latest stable version
        "torch==2.5.1",  # Compatible with vLLM 0.6.6.post1
        "huggingface_hub[hf_transfer]",
        "fastapi",
        "httpx",
    )
    .env({
        "HF_HUB_ENABLE_HF_TRANSFER": "1",
        "HF_ENDPOINT": "https://hf-mirror.com"  # Added HF mirror endpoint
    })
)

# Model configuration
MODEL_NAME = "NCAIR1/N-ATLaS"
SERVED_MODEL_NAME = "N-ATLaS"

# Persistent volumes for caching - ADD THESE OUTSIDE CLASS DEFINITION
hf_cache_vol = modal.Volume.from_name("huggingface-cache", create_if_missing=True)
vllm_cache_vol = modal.Volume.from_name("vllm-cache", create_if_missing=True)

# Add near your volumes
cache_volume = modal.Volume.from_name("natlas-cache", create_if_missing=True)
network_file_system = NetworkFileSystem.from_name("natlas-nfs", create_if_missing=True)

# Import the Hugging Face secret
hf_secret = modal.Secret.from_name("hf-token-secret")

app = modal.App("natlas-vllm-inference")


# Web server endpoint (OpenAI-compatible API) - FIXED VERSION
@app.function(
    image=vllm_image,
    gpu="A100",  # Changed from H100 to A100 as requested
    timeout=3600,  # Increased timeout to 1 hour
    volumes={
        "/root/.cache/huggingface": hf_cache_vol,
        "/root/.cache/vllm": vllm_cache_vol,
        "/root/.cache": cache_volume,  # Added cache volume
    },
    network_file_systems={"/cache": network_file_system},  # Added network file system
    secrets=[hf_secret],  # Added Hugging Face secret
    scaledown_window=300,  # Keep container warm for 5 minutes
)
@modal.asgi_app()
def serve():
    # Import the vLLM OpenAI API server directly
    from vllm.entrypoints.openai.api_server import app
    return app


# Alternative: Direct inference class (simpler, no OpenAI API)
@app.cls(
    image=vllm_image,
    gpu="A100",  # Changed from H100 to A100 as requested
    volumes={
        "/root/.cache/huggingface": hf_cache_vol,
        "/root/.cache/vllm": vllm_cache_vol,
        "/root/.cache": cache_volume,  # Added cache volume
    },
    network_file_systems={"/cache": network_file_system},  # Added network file system
    secrets=[hf_secret],  # Added Hugging Face secret
    scaledown_window=300,
)
class VLLMModel:
    @modal.enter()
    def start(self):  # Changed from __enter__ to @modal.enter()
        from vllm import LLM
        
        print(f"Loading model: {MODEL_NAME}")
        self.llm = LLM(
            model=MODEL_NAME,
            max_model_len=8192,
            dtype="auto",
            gpu_memory_utilization=0.9,
            trust_remote_code=True,
        )
        print("✓ Model loaded successfully!")

    @modal.method()
    def generate(self, prompt: str, max_tokens: int = 512, temperature: float = 0.7):
        from vllm import SamplingParams
        
        params = SamplingParams(
            temperature=temperature,
            max_tokens=max_tokens,
            top_p=0.9,
        )
        
        outputs = self.llm.generate([prompt], params)
        return outputs[0].outputs[0].text

    @modal.method()
    def batch_generate(self, prompts: list[str], max_tokens: int = 512, temperature: float = 0.7):
        from vllm import SamplingParams
        
        params = SamplingParams(
            temperature=temperature,
            max_tokens=max_tokens,
            top_p=0.9,
        )
        
        outputs = self.llm.generate(prompts, params)
        return [output.outputs[0].text for output in outputs]


# Local test functions
@app.local_entrypoint()
def test_direct():
    """Test the direct inference method"""
    print("Testing direct inference...")
    model = VLLMModel()
    
    test_prompt = "Translate to Yoruba: Good morning, how are you today?"
    result = model.generate.remote(test_prompt, max_tokens=100)
    
    print(f"\nPrompt: {test_prompt}")
    print(f"Response: {result}")


@app.local_entrypoint()
def test_api():
    """Test the OpenAI-compatible API endpoint"""
    print("Deploy the app first with: modal deploy natlas_vllm.py")
    print("Then you can test the API endpoint that will be provided.")


# Entry point for CLI commands
@app.local_entrypoint()
def deploy():
    """Deploy the application to Modal"""
    import subprocess
    print("Deploying to Modal...")
    subprocess.run(["modal", "deploy", __file__])