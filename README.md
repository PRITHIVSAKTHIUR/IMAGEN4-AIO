# **IMAGEN4-AIO**

<img width="1120" height="830" alt="Screenshot 2025-09-28 at 15-56-02 IMAGEN4 AIO" src="https://github.com/user-attachments/assets/7437ed08-0c47-4188-a47a-5e7a684b684d" />
<img width="1186" height="826" alt="Screenshot 2025-09-28 at 15-51-53 IMAGEN4 AIO" src="https://github.com/user-attachments/assets/988d4f75-d333-4959-a225-63628fc5514b" />

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
