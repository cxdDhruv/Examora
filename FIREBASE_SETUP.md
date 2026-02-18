# Firebase Setup Guide for Examora

Examora uses **Firebase** for two critical features:
1.  **Real-Time Results**: Allows teachers to see student submissions instantly without refreshing.
2.  **Cross-Device Sync**: Ensures data is accessible across different devices (e.g., student on phone, teacher on laptop).

## Step 1: Create a Firebase Project
1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Click **"Add project"**.
3.  Enter a name (e.g., `Examora-YourName`).
4.  Disable "Google Analytics" (optional, simpler without it).
5.  Click **"Create project"**.

## Step 2: Register the Web App
1.  Once the project is created, click the **Web icon (`</>`)** on the dashboard.
2.  Enter an App nickname (e.g., `Examora-Web`).
3.  Click **"Register app"**.
4.  **Copy the `firebaseConfig` code block**. You will need the values inside it (apiKey, authDomain, etc.).

## Step 3: Enable Firestore Database
Exams and results are stored in Firestore.
1.  In the left sidebar, go to **Build** → **Firestore Database**.
2.  Click **"Create database"**.
3.  **Important**: Choose **Start in Test Mode**.
    *   *Why?* This allows anyone with the app link to read/write data without complex authentication rules setup.
    *   *For Production:* You would later switch to "Production Mode" and add strict security rules.
4.  Choose a location (e.g., `nam5 (us-central)`).
5.  Click **"Enable"**.

## Step 4: Configure the Application
1.  Open the `.env` file in the project root.
2.  Fill in the keys from Step 2:
    ```env
    VITE_FIREBASE_API_KEY=your_api_key
    VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
    VITE_FIREBASE_PROJECT_ID=your_project_id
    VITE_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
    VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
    VITE_FIREBASE_APP_ID=your_app_id
    ```
3.  Save the file.
4.  If deploying to GitHub Pages, you must commit this file (or set secrets in GitHub Actions).

## Troubleshooting
*   **Permissions Error?** Check if Firestore Rules are in "Test Mode" (`allow read, write: if true;`).
*   **Duplicate Data?** The app currently merges local and cloud data. Clearing browser cache (`localStorage`) usually fixes sync weirdness during development.
