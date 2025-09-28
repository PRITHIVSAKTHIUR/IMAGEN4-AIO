# **IMAGEN4-AIO**

| ![Screenshot 1](https://github.com/user-attachments/assets/7437ed08-0c47-4188-a47a-5e7a684b684d) | ![Screenshot 2](https://github.com/user-attachments/assets/988d4f75-d333-4959-a225-63628fc5514b) |
|---|---|

> IMAGEN4-AIO is a modern, full-featured image generation web app powered by the Google Gemini API and the latest Imagen 4 models, designed to create high-quality AI-generated images from text prompts with ease. It features an intuitive interface where users can customize settings such as model type, aspect ratio, number of images, and person generation policy, while also handling advanced scenarios like API rate-limit errors gracefully. The app supports downloading individual images or all results as a ZIP archive, includes real-time loading states, and offers a responsive design for seamless use across devices — making it a powerful, all-in-one tool for creative image generation.

# Gemini App Proxy Server

This nodejs proxy server lets you run your AI Studio Gemini application unmodified, without exposing your API key in the frontend code.


## Instructions

**Prerequisites**:
- [Google Cloud SDK / gcloud CLI](https://cloud.google.com/sdk/docs/install)
- (Optional) Gemini API Key

1. Download or copy the files of your AI Studio app into this directory at the root level.
2. If your app calls the Gemini API, create a Secret for your API key:
     ```
     echo -n "${GEMINI_API_KEY}" | gcloud secrets create gemini_api_key --data-file=-
     ```

3.  Deploy to Cloud Run (optionally including API key):
    ```
    gcloud run deploy my-app --source=. --update-secrets=GEMINI_API_KEY=gemini_api_key:latest
    ```
