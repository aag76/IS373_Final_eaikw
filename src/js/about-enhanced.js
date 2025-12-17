/**
 * Swiss Design About Page Enhancement
 * Gold Standard: Intersection Observer + Advanced Interactions
 */

class SwissAboutEnhanced {
  constructor() {
    this.observer = null;
    this.init();
  }

  init() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.setup());
    } else {
      this.setup();
    }
  }

  setup() {
    // Setup scroll-triggered animations
    this.setupScrollAnimations();

    // Setup skill card interactions
    this.setupSkillCards();

    // Setup contact link interactions
    this.setupContactLinks();
  }

  /**
   * Intersection Observer for scroll-triggered fade-ins
   */
  setupScrollAnimations() {
    const targets = [
      document.querySelector("[data-intro-section]"),
      document.querySelector("[data-contact-section]"),
    ].filter(Boolean);

    if (!targets.length) {
      return;
    }

    const options = {
      root: null,
      rootMargin: "0px",
      threshold: 0.1,
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0)";
          this.observer.unobserve(entry.target);
        }
      });
    }, options);

    targets.forEach((target) => this.observer.observe(target));
  }

  /**
   * Skill card hover interactions
   */
  setupSkillCards() {
    const cards = document.querySelectorAll("[data-skill-card]");

    cards.forEach((card) => {
      const number = card.querySelector(".skill-number");
      const accent = card.querySelector(".skill-accent");
      const items = card.querySelectorAll(".skill-item");

      card.addEventListener("mouseenter", () => {
        // Card elevation
        card.style.transform = "translateY(-4px)";
        card.style.boxShadow = "0 10px 30px -10px rgba(0, 0, 0, 0.2)";

        // Number color change
        if (number) {
          number.style.color = "var(--swiss-red)";
          number.style.transform = "scale(1.1) rotate(-5deg)";
        }

        // Accent bar extension
        if (accent) {
          accent.style.width = "60px";
        }

        // Staggered item animation
        items.forEach((item, index) => {
          setTimeout(() => {
            item.style.paddingLeft = "var(--space-sm)";
            item.style.borderBottomColor = "var(--swiss-black)";
          }, index * 30);
        });
      });

      card.addEventListener("mouseleave", () => {
        card.style.transform = "translateY(0)";
        card.style.boxShadow = "none";

        if (number) {
          number.style.color = "var(--swiss-gray-100)";
          number.style.transform = "scale(1) rotate(0deg)";
        }

        if (accent) {
          accent.style.width = "40px";
        }

        items.forEach((item) => {
          item.style.paddingLeft = "0";
          item.style.borderBottomColor = "var(--swiss-gray-200)";
        });
      });
    });
  }

  /**
   * Contact link interactions with geometric slide effect
   */
  setupContactLinks() {
    const links = document.querySelectorAll("[data-contact-link]");

    links.forEach((link, index) => {
      // Create geometric background element
      const bg = document.createElement("div");
      bg.style.cssText = `
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background-color: var(--swiss-black);
        transition: left 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        z-index: 0;
      `;
      link.insertBefore(bg, link.firstChild);

      // Make text and icon relative
      const span = link.querySelector("span");
      const svg = link.querySelector("svg");
      if (span) {
        span.style.position = "relative";
        span.style.zIndex = "1";
        span.style.transition = "color 0.4s ease";
      }
      if (svg) {
        svg.style.position = "relative";
        svg.style.zIndex = "1";
        svg.style.transition = "all 0.4s ease";
      }

      // Staggered entrance animation
      setTimeout(
        () => {
          link.style.opacity = "1";
          link.style.transform = "translateX(0)";
        },
        300 + index * 100
      );

      // Initial state
      link.style.opacity = "0";
      link.style.transform = "translateX(-20px)";

      // Hover interactions
      link.addEventListener("mouseenter", () => {
        // Slide background in
        bg.style.left = "0";

        // Invert colors
        if (span) {
          span.style.color = "var(--swiss-white)";
        }
        if (svg) {
          svg.style.stroke = "var(--swiss-white)";
          svg.style.transform = "rotate(45deg) scale(1.1)";
        }

        // Border color
        link.style.borderColor = "var(--swiss-black)";
      });

      link.addEventListener("mouseleave", () => {
        // Slide background out
        bg.style.left = "-100%";

        // Reset colors
        if (span) {
          span.style.color = "var(--swiss-black)";
        }
        if (svg) {
          svg.style.stroke = "var(--swiss-black)";
          svg.style.transform = "rotate(0deg) scale(1)";
        }

        link.style.borderColor = "var(--swiss-black)";
      });

      // Click feedback
      link.addEventListener("click", () => {
        link.style.transform = "scale(0.95)";
        setTimeout(() => {
          link.style.transform = "scale(1)";
        }, 150);
      });
    });
  }

  /**
   * Clean up
   */
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

// Initialize on about page
if (document.querySelector("[data-skill-card]") || document.querySelector("[data-contact-link]")) {
  new SwissAboutEnhanced();
}

// Export for module usage
if (typeof module !== "undefined" && module.exports) {
  module.exports = SwissAboutEnhanced;
}
