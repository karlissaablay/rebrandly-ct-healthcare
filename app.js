/**
 * CareConnect Health - Rebrandly Conversion Tracking Events
 *
 * Events tracked (patient journey):
 * 1. "cta_click"                — Patient clicks "Book Appointment" or "Create Account" CTA
 * 2. "doctor_directory_viewed"  — Patient lands on the doctors page (high-intent signal)
 * 3. "insurance_selected"       — Patient selects an insurance provider on signup
 * 4. "patient_registration"     — Patient submits the registration form
 * 5. "registration_complete"    — Patient reaches the thank-you page (full conversion)
 *
 * Page views are tracked automatically by the Rebrandly SDK snippet.
 */

(function () {
  "use strict";

  // Helper: call rbly.track() — the SDK exposes window.rbly globally
  function track(eventName, revenue, currency, properties) {
    if (typeof rbly !== "undefined" && typeof rbly.track === "function") {
      var payload = { eventName: eventName };
      if (revenue != null) payload.revenue = revenue;
      if (currency) payload.currency = currency;
      if (properties) payload.properties = properties;
      rbly.track(payload);
      console.log("[Rebrandly CT] Sent:", eventName, payload);
    } else {
      console.warn("[Rebrandly CT] SDK not loaded, skipping:", eventName);
    }
  }

  // -----------------------------------------------------------
  // 1. CTA Click tracking (all pages)
  //    Fires when a patient clicks "Book Appointment" or signup CTAs
  // -----------------------------------------------------------
  document.addEventListener("click", function (e) {
    var link = e.target.closest('a[href="signup.html"], a[href="doctors.html"]');
    if (!link) return;

    // Only track buttons/CTAs, not regular nav links
    if (!link.classList.contains("btn") && !link.closest(".cta-banner") && !link.closest(".hero") && !link.closest(".doctor-card") && !link.closest(".success-actions")) return;

    var ctaText = link.textContent.trim();
    var page = window.location.pathname.split("/").pop() || "index.html";

    track("cta_click", null, null, {
      ctaText: ctaText,
      sourcePage: page,
    });
  });

  // -----------------------------------------------------------
  // 2. Doctor directory viewed (doctors.html)
  //    High-intent signal — patient is browsing providers
  // -----------------------------------------------------------
  if (window.location.pathname.includes("doctors")) {
    track("doctor_directory_viewed", null, null, {
      referrer: document.referrer || "direct",
    });
  }

  // -----------------------------------------------------------
  // 3. Insurance selected (signup.html)
  //    Fires when patient picks an insurance provider
  // -----------------------------------------------------------
  var insuranceSelect = document.getElementById("insurance");
  if (insuranceSelect) {
    insuranceSelect.addEventListener("change", function () {
      var provider = insuranceSelect.value;
      if (provider) {
        track("insurance_selected", null, null, {
          provider: provider,
        });
      }
    });
  }

  // -----------------------------------------------------------
  // 4. Patient registration (signup.html)
  //    Fires on form submission with insurance and location data
  // -----------------------------------------------------------
  var signupForm = document.getElementById("signup-form");
  if (signupForm) {
    signupForm.addEventListener("submit", function (e) {
      e.preventDefault();

      var insurance = insuranceSelect ? insuranceSelect.value : "";
      var locationSelect = document.getElementById("location");
      var location = locationSelect ? locationSelect.value : "";

      track("patient_registration", null, null, {
        insuranceProvider: insurance,
        preferredLocation: location,
      });

      // Navigate to thank-you page with context
      window.location.href =
        "thank-you.html?insurance=" + encodeURIComponent(insurance) +
        "&location=" + encodeURIComponent(location);
    });
  }

  // -----------------------------------------------------------
  // 5. Registration complete (thank-you.html)
  //    Final conversion — patient acquisition fully attributed
  // -----------------------------------------------------------
  if (window.location.pathname.includes("thank-you")) {
    var params = new URLSearchParams(window.location.search);
    var insurance = params.get("insurance") || "";
    var location = params.get("location") || "";

    track("registration_complete", 0, "USD", {
      insuranceProvider: insurance,
      location: location,
    });
  }

  // -----------------------------------------------------------
  // Doctor filter functionality (doctors.html)
  // -----------------------------------------------------------
  var filterBar = document.getElementById("doctor-filters");
  var doctorsGrid = document.getElementById("doctors-grid");

  if (filterBar && doctorsGrid) {
    filterBar.addEventListener("click", function (e) {
      var btn = e.target.closest(".filter-btn");
      if (!btn) return;

      // Update active state
      filterBar.querySelectorAll(".filter-btn").forEach(function (b) {
        b.classList.remove("active");
      });
      btn.classList.add("active");

      var filter = btn.getAttribute("data-filter");
      var cards = doctorsGrid.querySelectorAll(".doctor-card");

      cards.forEach(function (card) {
        if (filter === "all" || card.getAttribute("data-specialty") === filter) {
          card.style.display = "";
        } else {
          card.style.display = "none";
        }
      });
    });
  }
})();
