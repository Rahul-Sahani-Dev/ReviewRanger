# Validation Steps

Before deploying or submitting, perform these manual QA steps to ensure the offline/PWA and accessibility behaviors work as expected.

## 1. Content Validation
Run the content validation script to check content integrity:
```bash
node scripts/validate-content.mjs
```
The output should report the number of validated themes, puzzles, and findings, and confirm that all checks passed.

## 2. Accessibility (VoiceOver/Screen Readers)
- Start a local server (e.g., `npx serve .`) and open the app.
- Use a screen reader (e.g., VoiceOver on Mac or NVDA on Windows) to navigate the app.
- Verify focus states are visible and logical.
- Ensure all buttons and interactive elements announce their purpose.

## 3. Offline Mode & PWA
- Open Developer Tools in your browser (e.g., Chrome).
- Go to the Network tab and select "Offline".
- Reload the page. The app should load from the Service Worker cache.
- Verify that you can still navigate themes and complete puzzles offline.
