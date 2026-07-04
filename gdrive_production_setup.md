# Google Drive Sync: Production Deployment & Verification Guide

This guide walks you through the step-by-step process of transitioning the decentralized Google Drive app storage from a local testing state to a fully-verified production state hosted on **GitHub Pages**.

---

## Step 1: Create a Privacy Policy (Required by Google)

Google will not verify any app requesting access to Google Drive scopes without a public Privacy Policy hosted on the same domain.

1. Create a new file in your repository root named `privacy.html`.
2. Copy and paste the template below (modify the bracketed terms as needed):

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Privacy Policy - Micro Apps</title>
    <style>
        body { font-family: sans-serif; line-height: 1.6; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #333; }
        h1 { border-bottom: 1px solid #eee; padding-bottom: 10px; }
    </style>
</head>
<body>
    <h1>Privacy Policy</h1>
    <p>Last updated: July 2026</p>
    <p>This Privacy Policy describes how <strong>Micro Apps</strong> ("we", "our", "us") handles user data. Our apps are static client-side applications designed to run entirely in your web browser.</p>
    
    <h2>1. Data Collection and Storage</h2>
    <p>We do not run any backend servers and do not collect, monitor, or store your personal information or application data. All configurations, layouts, and files are stored directly on your local device (via browser local storage) or inside your personal Google Drive account.</p>
    
    <h2>2. Google User Data (Google Drive API)</h2>
    <p>When you use the Google Drive Sync feature, the application requests access to the <code>drive.appdata</code> scope. This is a secure, hidden application storage folder in your own Google Drive. This permission is used solely to:</p>
    <ul>
        <li>Save your floor plans and configuration files.</li>
        <li>Load previously saved plans back into the browser.</li>
        <li>Delete files you select from your personal app storage folder.</li>
    </ul>
    <p>We do not transfer or share your Google user data with any third party, nor do we access any other files on your Google Drive.</p>
    
    <h2>3. Security</h2>
    <p>The authentication process is handled securely by Google Identity Services. The access token remains entirely in your browser memory and is never transmitted to us or any external server.</p>
</body>
</html>
```
3. Commit and push `privacy.html` to your `main` branch. It will be hosted at `https://jorgegarciairazabal.github.io/micro-apps/privacy.html`.

---

## Step 2: Update Google Cloud Console Credentials

Prepare your Google Cloud project for GitHub Pages.

1. Open the [Google Cloud Console](https://console.cloud.google.com/).
2. Navigate to **APIs & Services** > **Credentials**.
3. Edit your OAuth 2.0 Client ID (Web Application).
4. Update the **Authorized JavaScript origins**:
   * Keep `http://localhost:8000` (for local development).
   * Add `https://jorgegarciairazabal.github.io` (for production).
5. Leave the **Authorized redirect URIs** blank (the GIS popup token flow does not require redirect URIs).
6. Click **Save**.

---

## Step 3: Configure the OAuth Consent Screen

1. Go to **APIs & Services** > **OAuth consent screen**.
2. Under **App information**:
   * Add your **App homepage link**: `https://jorgegarciairazabal.github.io/micro-apps/`
   * Add your **App privacy policy link**: `https://jorgegarciairazabal.github.io/micro-apps/privacy.html`
3. Under **Authorized domains**:
   * Click **Add Domain** and enter `github.io`.
4. Click **Save and Continue**.

---

## Step 4: Publish Your Application

1. On the OAuth Consent Screen settings page, locate the **Publishing status** section.
2. Click **Publish App** and confirm. 
   *(This shifts your app status from "Testing" to "In Production", allowing non-whitelisted users to proceed, but they will see a warning screen until verification completes).*

---

## Step 5: Record the Google Verification Demo Video

Google will review your submission and ask for a short walkthrough video (you can host it as an **unlisted YouTube video**).

### Video Requirements Checklist:
* [ ] **Show the OAuth Client ID:** Open the app and click "Connect Google Account". When the Google sign-in window pops up, **expand the window and zoom in on the URL address bar**. Google's review team must clearly read the `client_id=xxxx` parameter in the URL.
* [ ] **Show the Consent Flow:** Walk through the sign-in, select your account, **check the checkbox next to the Drive Permission**, and click "Continue".
* [ ] **Show the Functionality:** Create a simple wall, click **Save to Drive**, reload the modal, verify the file shows in the list, delete the local wall, and click **Load** on the Drive file to restore it. This proves to Google exactly what the requested permission is used for.

---

## Step 6: Submit for Verification

1. Click **Submit for verification** at the top of the OAuth Consent Screen configuration.
2. Provide your YouTube video link and a brief explanation:
   > *"Micro Apps is a static client-side floor plan designer. We request the drive.appdata scope so users can securely save, list, load, and delete their saved house layouts directly inside their own personal Google Drive app storage, eliminating the need for us to operate a centralized database."*
3. Check your developer contact email daily. Google's trust and safety team will email you within 3–7 business days to confirm verification or request policy adjustments.

---

## Step 7: Finalize Code Default ID

Once your OAuth flow is set up, update the hardcoded Client ID in the codebase so users don't need to manually configure it:

1. Open [GoogleDriveModal.jsx](file:///home/jgarcairaza/code/micro-apps/apps/house-designer/src/components/GoogleDriveModal.jsx).
2. Find this line:
   ```javascript
   const DEFAULT_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com'
   ```
3. Replace `'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com'` with your actual, full Client ID:
   ```javascript
   const DEFAULT_CLIENT_ID = '31314617400-6scr8gn50rtpfes4123fcq0n0hb79paf.apps.googleusercontent.com'
   ```
4. Commit, build, and deploy.
