#!/bin/bash

# JusticeAlly Cloud Run Deployment Script
# This script builds and deploys the application to Google Cloud Run

set -e  # Exit on any error

echo "🚀 Starting JusticeAlly deployment..."

# Configuration
PROJECT_ID="${PROJECT_ID:-778149047860}"
SERVICE_NAME="${SERVICE_NAME:-justiceally}"
REGION="${REGION:-us-west1}"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

echo "📋 Deployment Configuration:"
echo "   Project: ${PROJECT_ID}"
echo "   Service: ${SERVICE_NAME}"
echo "   Region: ${REGION}"
echo ""

# Check if gcloud is authenticated
echo "🔐 Checking authentication..."
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo "❌ Not authenticated with gcloud. Please run:"
    echo "   gcloud auth login"
    exit 1
fi

# Set the project
echo "📦 Setting project..."
gcloud config set project ${PROJECT_ID}

# Enable required APIs (if not already enabled)
echo "🔌 Ensuring required APIs are enabled..."
gcloud services enable run.googleapis.com --quiet || true
gcloud services enable containerregistry.googleapis.com --quiet || true

# Build the Docker image
echo "🏗️  Building Docker image..."
gcloud builds submit --tag ${IMAGE_NAME} .

# Deploy to Cloud Run
echo "🚢 Deploying to Cloud Run..."
gcloud run deploy ${SERVICE_NAME} \
    --image ${IMAGE_NAME} \
    --platform managed \
    --region ${REGION} \
    --allow-unauthenticated \
    --set-env-vars "VITE_GEMINI_API_KEY=${VITE_GEMINI_API_KEY}" \
    --memory 512Mi \
    --cpu 1 \
    --max-instances 10 \
    --timeout 60

# Get the service URL
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} --region=${REGION} --format='value(status.url)')

echo ""
echo "✅ Deployment successful!"
echo "🌐 Service URL: ${SERVICE_URL}"
echo ""
echo "📝 To view logs:"
echo "   gcloud logs read --service=${SERVICE_NAME} --region=${REGION} --limit=50"
