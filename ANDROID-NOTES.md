# Android Studio (Java WebView) notes

This ZIP contains the **GitHub Pages website source**, not Android Studio code or a signed APK/AAB.

1. Publish the site on GitHub Pages via HTTPS.
2. Create an Android Studio Java app, e.g. `com.hajribanao.app` (choose your Play Console package ID before registration).
3. Include `android.permission.INTERNET` in the manifest. Use an appropriate Android theme compatible with your Activity base class.
4. Set up `WebView`, enable `javaScriptEnabled` and `domStorageEnabled`, and load the published HTTPS URL.
5. `setAllowFileAccess(false)` and `WebSettings.MIXED_CONTENT_NEVER_ALLOW` are recommended for a hosted HTTPS page. Restrict external URLs and file access as appropriate.
6. Use `WebChromeClient.onShowFileChooser` and Android Activity Result APIs for JSON restore file upload.
7. IMPORTANT: CSV/JSON downloads in the site are created from a Blob; the default Android `DownloadManager` listener alone cannot download `blob:` URLs. Implement a safe JavaScript bridge or other native export flow if Play Store support for downloads is needed. Do not grant a broad `addJavascriptInterface` to untrusted websites.
8. Native Android WebView needs printing integration (PrintManager/createPrintDocumentAdapter) for salary slip printing. `window.print()` works in supporting desktop/mobile browsers but may not work inside standard WebView.
9. Enable WebView debugging only in debug builds. Check status bar/keyboard insets and back navigation on actual phones.
10. Cleartext HTTP is not needed. Confirm Play Console privacy/data-safety claims against the **final** APK including any extra SDKs.

Suggested URL: `https://YOUR_USERNAME.github.io/HajriBanao/` (example only; replace it).
