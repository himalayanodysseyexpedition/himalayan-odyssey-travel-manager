/* Opens the admin-managed day-wise package itinerary in a mobile modal.
   Desktop keeps the existing itinerary-page link unchanged. */
(function () {
  "use strict";

  var MOBILE_QUERY = "(max-width:760px)";
  var dialog = null;
  var titleNode = null;
  var metaNode = null;
  var bodyNode = null;

  function isMobile() {
    return window.matchMedia && window.matchMedia(MOBILE_QUERY).matches;
  }

  function textNode(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    node.textContent = text || "";
    return node;
  }

  function parsePackageItinerary(value) {
    var raw = String(value || "").replace(/\r\n?/g, "\n").trim();
    if (!raw) return [];

    var blocks = raw.split(/\n\s*\n/).map(function (block) {
      return block.trim();
    }).filter(Boolean);

    return blocks.map(function (block, index) {
      var lines = block.split("\n");
      var first = (lines.shift() || "").trim();
      var day = /^Day\s*\d+/i.test(first) ? first : "Day " + (index + 1);
      var stayIndex = lines.findIndex(function (line) {
        return /^Stay:/i.test(line.trim());
      });
      var descriptionIndex = lines.findIndex(function (line) {
        return /^Description:/i.test(line.trim());
      });
      var stay = stayIndex >= 0
        ? lines[stayIndex].trim().replace(/^Stay:\s*/i, "").trim()
        : "";
      var description = "";

      if (descriptionIndex >= 0) {
        description = [
          lines[descriptionIndex].trim().replace(/^Description:\s*/i, ""),
          ...lines.slice(descriptionIndex + 1)
        ].join("\n").trim();
      } else {
        description = lines.filter(function (line, lineIndex) {
          return lineIndex !== stayIndex;
        }).join("\n").trim();
      }

      if (!/^Day\s*\d+/i.test(first) && !stay && !description) {
        description = first;
      }

      return { day: day, stay: stay, description: description };
    }).filter(function (item) {
      return item.stay || item.description || item.day;
    });
  }

  function createDialog() {
    if (dialog) return;

    dialog = document.createElement("dialog");
    dialog.className = "hoe-package-itinerary-modal";
    dialog.setAttribute("aria-modal", "true");
    dialog.setAttribute("aria-labelledby", "hoePackageItineraryTitle");

    var head = textNode("header", "hoe-package-itinerary-head", "");
    head.appendChild(textNode("span", "hoe-package-itinerary-kicker", "Your journey at a glance"));

    titleNode = textNode("h2", "hoe-package-itinerary-title", "Travel Itinerary");
    titleNode.id = "hoePackageItineraryTitle";
    head.appendChild(titleNode);

    metaNode = textNode("p", "hoe-package-itinerary-meta", "");
    head.appendChild(metaNode);

    var close = textNode("button", "hoe-package-itinerary-close", "×");
    close.type = "button";
    close.setAttribute("aria-label", "Close itinerary");
    close.addEventListener("click", function () {
      dialog.close();
    });
    head.appendChild(close);

    bodyNode = textNode("div", "hoe-package-itinerary-body", "");
    bodyNode.setAttribute("tabindex", "0");

    dialog.appendChild(head);
    dialog.appendChild(bodyNode);

    dialog.addEventListener("click", function (event) {
      if (event.target === dialog) dialog.close();
    });

    document.body.appendChild(dialog);
  }

  function addDayCard(item, index) {
    var card = textNode("article", "hoe-package-day-card", "");
    card.appendChild(textNode("span", "hoe-package-day-label", "DAY " + String(index + 1).padStart(2, "0")));
    card.appendChild(textNode("h3", "hoe-package-day-title", item.day || ("Day " + (index + 1))));

    if (item.stay) {
      var stayField = textNode("div", "hoe-package-day-field", "");
      stayField.appendChild(textNode("span", "hoe-package-day-field-label", "Overnight stay"));
      stayField.appendChild(textNode("p", "hoe-package-day-stay", item.stay));
      card.appendChild(stayField);
    }

    if (item.description) {
      var descriptionField = textNode("div", "hoe-package-day-field", "");
      descriptionField.appendChild(textNode("span", "hoe-package-day-field-label", "Day plan"));
      descriptionField.appendChild(textNode("p", "hoe-package-day-description", item.description));
      card.appendChild(descriptionField);
    }

    bodyNode.appendChild(card);
  }

  function openItinerary(packageRecord) {
    createDialog();

    var packageName = packageRecord.name || packageRecord.destination || "Travel Package";
    var meta = [
      packageRecord.destination || "",
      packageRecord.duration || ""
    ].filter(Boolean).join("  ·  ");

    titleNode.textContent = packageName;
    metaNode.textContent = meta;

    bodyNode.replaceChildren();
    bodyNode.appendChild(textNode(
      "p",
      "hoe-package-itinerary-intro",
      "Your package itinerary, day by day."
    ));

    var days = parsePackageItinerary(packageRecord.itinerary);
    if (!days.length) {
      bodyNode.appendChild(textNode(
        "p",
        "hoe-package-itinerary-empty",
        "The day-wise itinerary for this package has not been added yet. Please contact us for the latest route details."
      ));
    } else {
      days.forEach(addDayCard);
    }

    if (!dialog.open) dialog.showModal();
    var closeButton = dialog.querySelector(".hoe-package-itinerary-close");
    if (closeButton) closeButton.focus();
  }

  document.addEventListener("click", function (event) {
    var link = event.target.closest && event.target.closest("a.package-itinerary-link");
    if (!link || !isMobile()) return;

    var card = link.closest(".package-slide[data-package-id]");
    if (!card) return;

    var packageId = card.getAttribute("data-package-id");
    var records = Array.isArray(window.hoePackageRecords) ? window.hoePackageRecords : [];
    var packageRecord = records.find(function (item) {
      return String(item.id) === String(packageId);
    });

    if (!packageRecord) return;

    event.preventDefault();
    openItinerary(packageRecord);
  });
})();
