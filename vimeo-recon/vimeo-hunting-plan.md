# Vimeo Hunting Plan

## Objective
Execute a systematic security assessment of Vimeo, focusing on high-impact vulnerabilities identified in the Knowledge Base.

## Prerequisites
- [ ] **Accounts**:
    -   `aynorica+vimeo1@wearehackerone.com` (Attacker)
    -   `aynorica+vimeo2@wearehackerone.com` (Victim)
- [ ] **Tools**: Burp Suite Pro, Postman (optional), `ffuf` (for API discovery).
- [ ] **Scope**: `*.vimeo.com`, `api.vimeo.com`, `*.vhx.tv`.

## Phase 1: Authentication & Authorization (IDOR)
**Goal**: Access private data of the Victim account using the Attacker account.

1.  **Video Privacy IDOR**:
    *   **Setup**: Victim uploads a video, sets privacy to "Only Me".
    *   **Action**: Attacker attempts to:
        *   `GET /videos/{victim_video_id}`
        *   `GET /videos/{victim_video_id}/config` (Player config often leaks data)
        *   `POST /videos/{victim_video_id}/likes`
        *   `POST /videos/{victim_video_id}/comments`
        *   `GET /videos/{victim_video_id}/download`
2.  **Folder/Showcase IDOR**:
    *   **Setup**: Victim creates a private Showcase/Folder.
    *   **Action**: Attacker tries to add their own videos to Victim's folder or view contents.
3.  **User Settings IDOR**:
    *   **Action**: Attacker tries to modify Victim's profile settings (`PUT /users/{victim_id}`).

## Phase 2: Server-Side Request Forgery (SSRF)
**Goal**: Force Vimeo servers to communicate with internal infrastructure or external attacker-controlled servers.

1.  **Upload from URL**:
    *   **Endpoint**: `/upload/link` (or similar API).
    *   **Payloads**:
        *   `http://127.0.0.1`
        *   `http://169.254.169.254`
        *   `http://[::1]`
        *   DNS Rebinding domains (e.g., `rbndr.us`).
        *   Redirects to internal IPs.
2.  **Social Import**:
    *   **Feature**: Import from Dropbox/Google Drive.
    *   **Test**: Can we manipulate the callback URLs or the file source URLs?
3.  **Webhooks**:
    *   **Feature**: Developer API webhooks.
    *   **Test**: Do they verify the destination? Can we point it to `localhost`?

## Phase 3: Business Logic & OTT
**Goal**: Access paid features for free or manipulate subscription states.

1.  **VHX (OTT) Testing**:
    *   **Focus**: This is a separate platform (`vhx.tv`).
    *   **Test**: Create a site. Test the "Subscriber" management. Can you add a subscriber without payment?
2.  **Feature Persistence**:
    *   **Action**: Activate a Pro feature (e.g., 4K upload, custom player logo).
    *   **Action**: Downgrade account.
    *   **Check**: Does the feature remain active?

## Phase 4: API Fuzzing
**Goal**: Discover hidden or undocumented endpoints.

1.  **Tool**: `ffuf` or Burp Intruder.
2.  **Target**: `api.vimeo.com`.
3.  **Wordlist**: API-specific wordlists (kiterunner, etc.).
4.  **Focus**: Look for `/admin`, `/internal`, `/debug`, `/v1`, `/v2` variations.

## Execution Log
*Use this section to track progress.*

| Date | Phase | Target | Status | Findings |
| :--- | :--- | :--- | :--- | :--- |
|      |       |        |        |          |
