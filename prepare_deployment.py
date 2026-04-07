#!/usr/bin/env python3
"""
Quick deployment preparation script.
Generates secrets and environment variables needed for deployment.
"""

import secrets
import os
from pathlib import Path

def generate_secret_key():
    """Generate a secure 32-character SECRET_KEY for JWT."""
    return secrets.token_urlsafe(32)

def create_env_file():
    """Create .env file template."""
    secret_key = generate_secret_key()
    
    env_content = f"""# Mortality Predictor - Backend Environment Variables
# Generated for deployment on {__import__('datetime').datetime.now().isoformat()}

# Database URL (from Supabase)
# Format: postgresql://user:password@host:5432/database_name
DATABASE_URL=postgresql://postgres.YOUR_PROJECT_ID:YOUR_PASSWORD@aws-1-eu-north-1.pooler.supabase.com:5432/postgres

# JWT Configuration - REPLACE WITH YOUR OWN SECRET KEY
SECRET_KEY={secret_key}
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS Settings (for production)
ALLOWED_ORIGINS=https://your-vercel-domain.vercel.app,https://yourdomain.com
"""
    
    backend_path = Path("mortality_backend")
    env_file = backend_path / ".env"
    
    if env_file.exists():
        print(f"⚠️  .env file already exists at {env_file}")
        print("   To regenerate, delete it first and run this script again")
    else:
        env_file.write_text(env_content)
        print(f"✅ Created {env_file}")
        print(f"   SECRET_KEY: {secret_key}")
        print(f"   ⚠️  Update DATABASE_URL with your Supabase credentials")
    
    return secret_key

def print_deployment_commands():
    """Print the commands needed for deployment."""
    print("\n" + "="*60)
    print(" DEPLOYMENT QUICK REFERENCE")
    print("="*60)
    
    print("""
1️⃣  PREPARE LOCAL REPOSITORY
    git init
    git add .
    git commit -m "Initial commit: Mortality predictor deployment"
    git remote add origin https://github.com/YOUR_USERNAME/mortality-predictor.git
    git branch -M main
    git push -u origin main

2️⃣  CREATE PYTHON SECRET KEY (for .env)
    python -c "import secrets; print(secrets.token_urlsafe(32))"

3️⃣  DEPLOY BACKEND (Render)
    - Go to: https://dashboard.render.com
    - Click: "New +" → "Web Service"
    - Connect GitHub repository
    - Build: pip install -r mortality_backend/requirements.txt
    - Start: cd mortality_backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT
    - Add env vars from .env file
    - Deploy!

4️⃣  DEPLOY FRONTEND (Vercel)
    - Go to: https://vercel.com/dashboard
    - Click: "Add New" → "Project"  
    - Import repository
    - Framework: Vite ✅ (auto-detected)
    - Add env var: VITE_API_URL=<YOUR_RENDER_URL>
    - Deploy!

5️⃣  TEST DEPLOYMENT
    - Frontend: https://your-app.vercel.app
    - API Docs: https://your-api.onrender.com/docs
    - Try: Register → Login → Make Prediction → View History

📚 Full guide: DEPLOYMENT_GUIDE.md
✅ Checklist: DEPLOYMENT_CHECKLIST.md
""")

if __name__ == "__main__":
    print("🚀 Mortality Predictor - Deployment Preparation")
    print("="*60)
    
    create_env_file()
    print_deployment_commands()
    
    print("\n" + "="*60)
    print("✅ Preparation complete!")
    print("="*60)
