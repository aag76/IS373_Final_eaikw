/**
 * Swiss Design Projects Enhancement
 * Gold Standard: Advanced CSS Grid + Intersection Observer + Micro-interactions
 */

class SwissProjectsEnhanced {
  constructor() {
    this.cards = null;
    this.observer = null;
    this.init();
  }

  init() {
    // Wait for DOM
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.setup());
    } else {
      this.setup();
    }
  }

  setup() {
    this.cards = document.querySelectorAll("[data-project-card]");

    if (!this.cards.length) {
      return;
    }

    // Setup Intersection Observer for scroll-triggered animations
    this.setupScrollAnimations();

    // Setup hover interactions for each card
    this.cards.forEach((card) => this.setupCardInteractions(card));

    // Setup responsive grid adjustments
    this.setupResponsiveGrid();
  }

  /**
   * Intersection Observer for staggered fade-in animations
   */
  setupScrollAnimations() {
    const options = {
      root: null,
      rootMargin: "0px",
      threshold: 0.1,
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const card = entry.target;
          const index = parseInt(card.dataset.index) || 0;

          // Staggered animation delay based on index
          setTimeout(() => {
            card.style.opacity = "1";
            card.style.transform = "translateY(0)";
          }, index * 100); // 100ms stagger

          // Stop observing once animated
          this.observer.unobserve(card);
        }
      });
    }, options);

    this.cards.forEach((card) => this.observer.observe(card));
  }

  /**
   * Advanced hover interactions for each card
   */
  setupCardInteractions(card) {
    const number = card.querySelector(".project-number");
    // const title = card.querySelector(".project-title");
    const accentBar = card.querySelector(".project-accent-bar");
    // const cta = card.querySelector(".project-cta");
    const arrow = card.querySelector(".project-arrow");
    const overlay = card.querySelector(".project-overlay");
    const tags = card.querySelectorAll(".project-tag");
    const border = card.querySelector(".absolute.inset-0");

    // Mouse enter - Swiss geometric reveal
    card.addEventListener("mouseenter", () => {
      // Geometric overlay slides in
      if (overlay) {
        overlay.style.opacity = "0.1";
        overlay.style.transform = "translate(0, 0) rotate(45deg)";
      }

      // Number color shift
      if (number) {
        number.style.color = "var(--swiss-red)";
        number.style.transform = "translateX(-4px)";
      }

      // Accent bar extends
      if (accentBar) {
        accentBar.style.width = "80px";
      }

      // Arrow animation
      if (arrow) {
        arrow.style.transform = "translateX(4px)";
      }

      // Border effect
      if (border) {
        border.style.borderColor = "var(--swiss-black)";
      }

      // Tags hover effect
      tags.forEach((tag, index) => {
        setTimeout(() => {
          tag.style.backgroundColor = "var(--swiss-black)";
          tag.style.color = "var(--swiss-white)";
        }, index * 50);
      });
    });

    // Mouse leave - reset
    card.addEventListener("mouseleave", () => {
      if (overlay) {
        overlay.style.opacity = "0";
        overlay.style.transform = "translate(60px, -60px) rotate(45deg)";
      }

      if (number) {
        number.style.color = "var(--swiss-gray-200)";
        number.style.transform = "translateX(0)";
      }

      if (accentBar) {
        accentBar.style.width = "48px";
      }

      if (arrow) {
        arrow.style.transform = "translateX(0)";
      }

      if (border) {
        border.style.borderColor = "transparent";
      }

      tags.forEach((tag) => {
        tag.style.backgroundColor = "transparent";
        tag.style.color = "var(--swiss-black)";
      });
    });

    // Click animation - geometric pulse
    card.addEventListener("click", (e) => {
      // Don't animate if clicking a link
      if (e.target.tagName === "A" || e.target.closest("a")) {
        return;
      }

      card.style.transform = "scale(0.98)";
      setTimeout(() => {
        card.style.transform = "scale(1)";
      }, 150);
    });
  }

  /**
   * Responsive grid enhancements
   */
  setupResponsiveGrid() {
    const grid = document.getElementById("projects-grid");
    if (!grid) {
      return;
    }

    const updateGridLayout = () => {
      const width = window.innerWidth;

      // Advanced breakpoints
      if (width >= 1600) {
        // Ultra-wide: 3 columns
        grid.style.gridTemplateColumns = "repeat(3, 1fr)";
      } else if (width >= 1024) {
        // Desktop: 2 columns
        grid.style.gridTemplateColumns = "repeat(2, 1fr)";
      } else if (width >= 768) {
        // Tablet: 2 columns (tighter)
        grid.style.gridTemplateColumns = "repeat(2, 1fr)";
      } else {
        // Mobile: 1 column
        grid.style.gridTemplateColumns = "1fr";
      }
    };

    // Initial setup
    updateGridLayout();

    // Debounced resize handler
    let resizeTimeout;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(updateGridLayout, 150);
    });
  }

  /**
   * Clean up observers
   */
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

// Initialize only on projects page
if (document.querySelector("[data-project-card]")) {
  new SwissProjectsEnhanced();
}

// Export for potential module usage
if (typeof module !== "undefined" && module.exports) {
  module.exports = SwissProjectsEnhanced;
}
