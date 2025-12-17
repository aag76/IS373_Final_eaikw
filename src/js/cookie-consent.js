/**
 * GDPR-Compliant Cookie Consent Manager
 * Handles cookie consent, preferences, and analytics loading
 */

class CookieConsentManager {
  constructor() {
    this.consentKey = "cookieConsent";
    this.preferencesKey = "cookiePreferences";
    this.bannerShown = false;
    this.analyticsLoaded = false;

    this.defaultPreferences = {
      essential: true, // Always required
      analytics: false,
      marketing: false,
      functional: false,
    };

    this.init();
  }

  init() {
    // Check existing consent on page load
    const consent = this.getConsent();

    if (consent === null) {
      // No consent given yet, show banner
      this.showBanner();
    } else if (consent === true) {
      // Consent given, load based on preferences
      this.loadScriptsBasedOnPreferences();
    }
    // If consent === false, do nothing (only essential cookies)
  }

  getConsent() {
    try {
      const consent = localStorage.getItem(this.consentKey);
      return consent ? JSON.parse(consent) : null;
    } catch {
      return null;
    }
  }

  setConsent(accepted) {
    try {
      localStorage.setItem(this.consentKey, JSON.stringify(accepted));
    } catch (error) {
      // localStorage may be disabled or full
      console.error("Failed to save consent:", error);
    }
  }

  getPreferences() {
    try {
      const prefs = localStorage.getItem(this.preferencesKey);
      return prefs ? JSON.parse(prefs) : this.defaultPreferences;
    } catch {
      return this.defaultPreferences;
    }
  }

  setPreferences(preferences) {
    try {
      localStorage.setItem(this.preferencesKey, JSON.stringify(preferences));
    } catch (error) {
      console.error("Failed to save preferences:", error);
    }
  }

  showBanner() {
    if (this.bannerShown) {
      return;
    }

    const banner = this.createBanner();
    document.body.appendChild(banner);
    this.bannerShown = true;

    // Add backdrop blur effect
    document.body.style.overflow = "hidden";
  }

  hideBanner() {
    const banner = document.getElementById("cookie-consent-banner");
    if (banner) {
      banner.remove();
      this.bannerShown = false;
      document.body.style.overflow = "";
    }
  }

  createBanner() {
    const banner = document.createElement("div");
    banner.id = "cookie-consent-banner";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-labelledby", "cookie-consent-title");
    banner.setAttribute("aria-describedby", "cookie-consent-description");

    banner.innerHTML = `
            <!-- Cookie Consent Overlay -->
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.7);
                backdrop-filter: blur(4px);
                z-index: 9998;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 1rem;
            ">
                <!-- Cookie Consent Modal -->
                <div style="
                    background: var(--swiss-white);
                    border: 3px solid var(--swiss-black);
                    max-width: 500px;
                    width: 100%;
                    max-height: 90vh;
                    overflow-y: auto;
                    z-index: 9999;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                ">
                    <!-- Header -->
                    <div style="
                        background: var(--swiss-black);
                        color: var(--swiss-white);
                        padding: var(--space-lg);
                        border-bottom: 3px solid var(--swiss-red);
                    ">
                        <h2 id="cookie-consent-title" style="
                            font-family: var(--font-mono);
                            font-size: 1.25rem;
                            font-weight: bold;
                            margin: 0;
                            text-transform: uppercase;
                            letter-spacing: 0.05em;
                        ">Cookie Preferences</h2>
                    </div>

                    <!-- Content -->
                    <div style="padding: var(--space-lg);">
                        <p id="cookie-consent-description" style="
                            font-family: var(--font-sans);
                            line-height: 1.6;
                            margin-bottom: var(--space-lg);
                            color: var(--swiss-gray-700);
                        ">
                            We use cookies to enhance your experience on our site. Essential cookies are required for basic functionality, while optional cookies help us analyze usage and improve our services.
                        </p>

                        <!-- Cookie Categories -->
                        <div style="margin-bottom: var(--space-lg);">
                            <div style="margin-bottom: var(--space-md);">
                                <label style="
                                    display: flex;
                                    align-items: center;
                                    gap: 0.5rem;
                                    font-family: var(--font-sans);
                                    font-size: 0.9rem;
                                    cursor: not-allowed;
                                ">
                                    <input type="checkbox" checked disabled style="
                                        accent-color: var(--swiss-red);
                                        cursor: not-allowed;
                                    ">
                                    <span style="font-weight: 600;">Essential Cookies</span>
                                    <span style="color: var(--swiss-gray-500); font-size: 0.8rem;">(Required)</span>
                                </label>
                                <p style="
                                    font-size: 0.8rem;
                                    color: var(--swiss-gray-600);
                                    margin: 0.25rem 0 0 1.5rem;
                                    line-height: 1.4;
                                ">
                                    Necessary for basic site functionality and security.
                                </p>
                            </div>

                            <div style="margin-bottom: var(--space-md);">
                                <label style="
                                    display: flex;
                                    align-items: center;
                                    gap: 0.5rem;
                                    font-family: var(--font-sans);
                                    font-size: 0.9rem;
                                    cursor: pointer;
                                ">
                                    <input type="checkbox" id="analytics-consent" style="accent-color: var(--swiss-red);">
                                    <span style="font-weight: 600;">Analytics Cookies</span>
                                </label>
                                <p style="
                                    font-size: 0.8rem;
                                    color: var(--swiss-gray-600);
                                    margin: 0.25rem 0 0 1.5rem;
                                    line-height: 1.4;
                                ">
                                    Help us understand how visitors interact with our site.
                                </p>
                            </div>

                            <div style="margin-bottom: var(--space-md);">
                                <label style="
                                    display: flex;
                                    align-items: center;
                                    gap: 0.5rem;
                                    font-family: var(--font-sans);
                                    font-size: 0.9rem;
                                    cursor: pointer;
                                ">
                                    <input type="checkbox" id="functional-consent" style="accent-color: var(--swiss-red);">
                                    <span style="font-weight: 600;">Functional Cookies</span>
                                </label>
                                <p style="
                                    font-size: 0.8rem;
                                    color: var(--swiss-gray-600);
                                    margin: 0.25rem 0 0 1.5rem;
                                    line-height: 1.4;
                                ">
                                    Enable enhanced features like preferences and personalization.
                                </p>
                            </div>
                        </div>

                        <!-- Privacy Policy Link -->
                        <p style="
                            font-size: 0.8rem;
                            color: var(--swiss-gray-600);
                            margin-bottom: var(--space-lg);
                            line-height: 1.4;
                        ">
                            For more information, please read our 
                            <a href="/privacy-policy/" style="
                                color: var(--swiss-red);
                                text-decoration: underline;
                                font-weight: 500;
                            ">Privacy Policy</a>.
                        </p>

                        <!-- Action Buttons -->
                        <div style="
                            display: flex;
                            gap: var(--space-md);
                            flex-wrap: wrap;
                        ">
                            <button id="reject-all-cookies" style="
                                background: var(--swiss-gray-100);
                                color: var(--swiss-black);
                                border: 2px solid var(--swiss-gray-400);
                                padding: 0.75rem 1.5rem;
                                font-family: var(--font-mono);
                                font-size: 0.9rem;
                                font-weight: bold;
                                text-transform: uppercase;
                                cursor: pointer;
                                transition: all 0.2s;
                                letter-spacing: 0.05em;
                                flex: 1;
                                min-width: 120px;
                            " 
                            onmouseover="this.style.background='var(--swiss-gray-200)'"
                            onmouseout="this.style.background='var(--swiss-gray-100)'">
                                Reject All
                            </button>
                            
                            <button id="accept-selected-cookies" style="
                                background: var(--swiss-red);
                                color: var(--swiss-white);
                                border: 2px solid var(--swiss-red);
                                padding: 0.75rem 1.5rem;
                                font-family: var(--font-mono);
                                font-size: 0.9rem;
                                font-weight: bold;
                                text-transform: uppercase;
                                cursor: pointer;
                                transition: all 0.2s;
                                letter-spacing: 0.05em;
                                flex: 1;
                                min-width: 120px;
                            "
                            onmouseover="this.style.background='var(--swiss-black)'; this.style.borderColor='var(--swiss-black)'"
                            onmouseout="this.style.background='var(--swiss-red)'; this.style.borderColor='var(--swiss-red)'">
                                Accept Selected
                            </button>

                            <button id="accept-all-cookies" style="
                                background: var(--swiss-black);
                                color: var(--swiss-white);
                                border: 2px solid var(--swiss-black);
                                padding: 0.75rem 1.5rem;
                                font-family: var(--font-mono);
                                font-size: 0.9rem;
                                font-weight: bold;
                                text-transform: uppercase;
                                cursor: pointer;
                                transition: all 0.2s;
                                letter-spacing: 0.05em;
                                flex: 1;
                                min-width: 120px;
                            "
                            onmouseover="this.style.background='var(--swiss-red)'"
                            onmouseout="this.style.background='var(--swiss-black)'">
                                Accept All
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

    // Add event listeners
    this.addBannerEventListeners(banner);

    return banner;
  }

  addBannerEventListeners(banner) {
    const rejectBtn = banner.querySelector("#reject-all-cookies");
    const acceptSelectedBtn = banner.querySelector("#accept-selected-cookies");
    const acceptAllBtn = banner.querySelector("#accept-all-cookies");

    if (rejectBtn) {
      rejectBtn.addEventListener("click", () => this.handleRejectAll(), { once: true });
    }

    if (acceptSelectedBtn) {
      acceptSelectedBtn.addEventListener("click", () => this.handleAcceptSelected(), {
        once: true,
      });
    }

    if (acceptAllBtn) {
      acceptAllBtn.addEventListener("click", () => this.handleAcceptAll(), { once: true });
    }

    // Escape key handler
    const escapeHandler = (e) => {
      if (e.key === "Escape" && this.bannerShown) {
        this.handleRejectAll();
        document.removeEventListener("keydown", escapeHandler);
      }
    };
    document.addEventListener("keydown", escapeHandler);
  }

  handleRejectAll() {
    this.setConsent(false);
    this.setPreferences({
      essential: true,
      analytics: false,
      marketing: false,
      functional: false,
    });
    this.hideBanner();
    // Only essential cookies - no analytics loading
  }

  handleAcceptSelected() {
    const preferences = {
      essential: true,
      analytics: document.getElementById("analytics-consent").checked,
      marketing: false, // Not implemented in this example
      functional: document.getElementById("functional-consent").checked,
    };

    this.setConsent(true);
    this.setPreferences(preferences);
    this.hideBanner();
    this.loadScriptsBasedOnPreferences();
  }

  handleAcceptAll() {
    const preferences = {
      essential: true,
      analytics: true,
      marketing: true,
      functional: true,
    };

    this.setConsent(true);
    this.setPreferences(preferences);
    this.hideBanner();
    this.loadScriptsBasedOnPreferences();
  }

  loadScriptsBasedOnPreferences() {
    const preferences = this.getPreferences();

    // Load analytics if consented and not already loaded
    if (preferences.analytics && !this.analyticsLoaded) {
      this.loadAnalytics();
    }

    // Load functional scripts if consented
    if (preferences.functional) {
      this.loadFunctionalScripts();
    }
  }

  loadAnalytics() {
    // Update Google Analytics 4 Consent Mode
    // GA4 script is already loaded in base.njk with default consent denied
    // This method grants consent when user accepts analytics cookies

    // Check if gtag is defined (loaded via GA4 script in base.njk)
    if (typeof window.gtag === "function") {
      const gtag = window.gtag;
      // Update consent to granted for analytics
      gtag("consent", "update", {
        analytics_storage: "granted",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
      });

      this.analyticsLoaded = true;

      // Only log in development
      if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
        console.log("✓ Analytics consent granted - GA4 tracking enabled");
      }
    } else if (
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"
    ) {
      console.warn("GA4 gtag function not found. Ensure GA4 script is loaded in base.njk");
    }
  }

  loadFunctionalScripts() {
    // Load functional scripts here
    // Example: Theme preferences, language settings, etc.
    // Functional scripts loaded with user consent
  }

  // Public method to show preferences dialog
  showPreferences() {
    this.showBanner();

    // Pre-fill current preferences
    const preferences = this.getPreferences();
    setTimeout(() => {
      const analyticsCheckbox = document.getElementById("analytics-consent");
      const functionalCheckbox = document.getElementById("functional-consent");

      if (analyticsCheckbox) {
        analyticsCheckbox.checked = preferences.analytics;
      }
      if (functionalCheckbox) {
        functionalCheckbox.checked = preferences.functional;
      }
    }, 100);
  }

  // Public method to check if analytics is consented
  hasAnalyticsConsent() {
    const consent = this.getConsent();
    if (consent !== true) {
      return false;
    }

    const preferences = this.getPreferences();
    return preferences.analytics;
  }

  // Public method to check if functional is consented
  hasFunctionalConsent() {
    const consent = this.getConsent();
    if (consent !== true) {
      return false;
    }

    const preferences = this.getPreferences();
    return preferences.functional;
  }
}

// Initialize cookie consent manager
document.addEventListener("DOMContentLoaded", () => {
  window.cookieConsent = new CookieConsentManager();
});

// Export for use in other scripts
if (typeof module !== "undefined" && module.exports) {
  module.exports = CookieConsentManager;
}
