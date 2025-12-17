/**
 * Swiss Mobile Menu - Vanilla JavaScript Implementation
 * No dependencies, CSP-safe, production-ready
 */

class SwissMobileMenu {
  constructor() {
    this.isOpen = false;
    this.menuButton = null;
    this.menuOverlay = null;
    this.menuLinks = [];

    this.init();
  }

  init() {
    // Wait for DOM to be ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.setup());
    } else {
      this.setup();
    }
  }

  setup() {
    // Get DOM elements
    this.menuButton = document.querySelector('[data-testid="mobile-menu-button"]');
    this.menuOverlay = document.getElementById("mobile-menu");
    this.menuLinks = this.menuOverlay ? Array.from(this.menuOverlay.querySelectorAll("a")) : [];

    if (!this.menuButton || !this.menuOverlay) {
      console.warn("Mobile menu elements not found");
      return;
    }

    // Bind event listeners
    this.menuButton.addEventListener("click", () => this.toggle());
    this.menuOverlay.addEventListener("click", (e) => {
      if (e.target === this.menuOverlay) {
        this.close();
      }
    });

    // Close on menu link click
    this.menuLinks.forEach((link) => {
      link.addEventListener("click", () => {
        // Close menu immediately
        this.close();
      });
    });

    // Close on escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.isOpen) {
        this.close();
      }
    });

    // Close on browser back button
    window.addEventListener("popstate", () => {
      if (this.isOpen) {
        this.close();
      }
    });

    // Initialize ARIA attributes
    this.updateARIA();
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    this.isOpen = true;
    this.menuOverlay.classList.remove("hidden");
    this.menuOverlay.style.display = "block";
    this.menuButton.classList.add("is-open");

    // Lock scroll
    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = this.getScrollbarWidth() + "px";

    // Update ARIA
    this.updateARIA();

    // Trigger animation
    requestAnimationFrame(() => {
      this.menuOverlay.style.opacity = "1";
    });
  }

  close() {
    this.isOpen = false;
    this.menuButton.classList.remove("is-open");

    // Unlock scroll immediately
    document.body.style.overflow = "";
    document.body.style.paddingRight = "";

    // Fade out overlay
    this.menuOverlay.style.opacity = "0";

    // Wait for animation before hiding
    setTimeout(() => {
      this.menuOverlay.style.display = "none";
      this.menuOverlay.classList.add("hidden");
    }, 300);

    // Update ARIA
    this.updateARIA();
  }

  updateARIA() {
    this.menuButton.setAttribute("aria-expanded", this.isOpen.toString());
  }

  getScrollbarWidth() {
    return window.innerWidth - document.documentElement.clientWidth;
  }
}

// Initialize menu when script loads
new SwissMobileMenu();
