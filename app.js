/**
 * CareConnect Demo Site - Rebrandly Conversion Tracking Events
 *
 * Events tracked:
 * 1. "cta_click"            — User clicks any CTA leading to signup (all pages)
 * 2. "pricing_viewed"       — User lands on the pricing page (high-intent signal)
 * 3. "specialty_selected"   — User selects a specialty in the signup form dropdown
 * 4. "signup"               — User submits the signup form
 * 5. "purchase"             — Paid plan confirmation on thank-you page with revenue
 *
 * Page views are tracked automatically by the Rebrandly SDK snippet.
 */

(function () {
  "use strict";

  var PLAN_PRICES = {
    clinic: 0,
    practice: 149.0,
    enterprise: 0,
  };

  // Helper: safely call trackConversion if the SDK has loaded
  function track(eventName, revenue, currency, properties) {
    if (typeof trackConversion === "function") {
      var payload = { eventName: eventName };
      if (revenue != null) payload.revenue = revenue;
      if (currency) payload.currency = currency;
      if (properties) payload.properties = properties;
      trackConversion(payload);
    }
    console.log("[Rebrandly CT]", eventName, { revenue: revenue, currency: currency, properties: properties });
  }

  // -----------------------------------------------------------
  // 1. CTA Click tracking (all pages)
  //    Fires when a user clicks any primary CTA leading to signup
  // -----------------------------------------------------------
  document.addEventListener("click", function (e) {
    var link = e.target.closest('a[href="signup.html"]');
    if (!link) return;

    var ctaText = link.textContent.trim();
    var page = window.location.pathname.split("/").pop() || "index.html";

    track("cta_click", null, null, {
      ctaText: ctaText,
      sourcePage: page,
    });
  });

  // -----------------------------------------------------------
  // 2. Pricing page viewed (pricing.html)
  //    High-intent signal — user is evaluating plans
  // -----------------------------------------------------------
  if (window.location.pathname.includes("pricing")) {
    track("pricing_viewed", null, null, {
      referrer: document.referrer || "direct",
    });
  }

  // -----------------------------------------------------------
  // 3. Specialty selected (signup.html)
  //    Fires when user changes the specialty dropdown
  // -----------------------------------------------------------
  var specialtySelect = document.getElementById("specialty");
  if (specialtySelect) {
    specialtySelect.addEventListener("change", function () {
      var specialty = specialtySelect.value;
      track("specialty_selected", null, null, {
        specialty: specialty,
      });
    });
  }

  // -----------------------------------------------------------
  // 4. Signup event (signup.html)
  //    Fires on form submission with plan and practice details
  // -----------------------------------------------------------
  var signupForm = document.getElementById("signup-form");
  if (signupForm) {
    signupForm.addEventListener("submit", function (e) {
      e.preventDefault();

      var planSelect = document.getElementById("plan");
      var plan = planSelect ? planSelect.value : "practice";
      var specialty = specialtySelect ? specialtySelect.value : "";
      var practiceName = document.getElementById("practice-name")
        ? document.getElementById("practice-name").value
        : "";

      track("signup", null, null, {
        plan: plan,
        specialty: specialty,
        practiceName: practiceName,
      });

      // Navigate to thank-you page with plan info
      window.location.href = "thank-you.html?plan=" + encodeURIComponent(plan);
    });
  }

  // -----------------------------------------------------------
  // 5. Purchase event (thank-you.html)
  //    Fires for paid plans with revenue attribution
  // -----------------------------------------------------------
  if (window.location.pathname.includes("thank-you")) {
    var params = new URLSearchParams(window.location.search);
    var plan = params.get("plan");

    if (plan && plan !== "clinic") {
      var revenue = PLAN_PRICES[plan] || 0;

      track("purchase", revenue, "USD", {
        plan: plan,
        billingCycle: "monthly",
      });
    }
  }
})();
