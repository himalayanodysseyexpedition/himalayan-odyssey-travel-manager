
"use strict";

/* =========================================
   HIMALAYAN ODYSSEY EXPEDITION
   ADMIN DASHBOARD - COMPLETE APP.JS
========================================= */

/* SUPABASE CONFIGURATION */

const SUPABASE_URL = "https://ynkoiuyjevclypumnyes.supabase.co";
const SUPABASE_KEY = "sb_publishable_Y4JRhHCbljrd5catiUimJw_tr10Qvk-";

const HOTEL_BUCKET = "hotel-photos";
const CAB_BUCKET = "cab-photos";
const ITINERARY_BUCKET = "itinerary-pdfs";
const ITINERARY_PHOTO_BUCKET = "itinerary-photos";
const PACKAGE_BUCKET = "package-posters";

const MAX_HOTEL_PHOTO_SIZE = 5 * 1024 * 1024;
const MAX_CAB_PHOTO_SIZE = 5 * 1024 * 1024;
const MAX_PACKAGE_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_PDF_SIZE = 10 * 1024 * 1024;
const MAX_ITINERARY_PHOTO_SIZE = 5 * 1024 * 1024;

let db;
let D = {};

let editingPackageId = null;
let editingItineraryId = null;
let itineraryGalleryImages = [];
let editingHotelId = null;
let editingCabId = null;

const $ = id => document.getElementById(id);


/* =========================================
   COMMON HELPERS
========================================= */

const cash = amount =>
  "₹" + (Number(amount) || 0).toLocaleString("en-IN");

const esc = value =>
  String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[character]));

function message(text) {
  if ($("msg")) $("msg").textContent = text;
}

function setText(id, value) {
  if ($(id)) $(id).textContent = value ?? "";
}

function setHTML(id, value) {
  if ($(id)) $(id).innerHTML = value ?? "";
}

function show(id) {
  const dialog = $(id);

  if (dialog && typeof dialog.showModal === "function") {
    dialog.showModal();
  }
}

function safeFileName(name) {
  return String(name || "photo")
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(-90) || "photo";
}

function getBooking(id) {
  return (D.bookings || []).find(
    item => String(item.id) === String(id)
  );
}

function getCustomer(booking) {
  return (D.customers || []).find(
    item => String(item.id) === String(booking?.customer_id)
  ) || {};
}


/* =========================================
   LOGIN / LOGOUT
========================================= */

async function login() {
  const email = $("email")?.value.trim();
  const password = $("password")?.value;

  if (!email || !password) {
    message("Please enter your email and password.");
    return;
  }

  const button = $("login");
  if (button) button.disabled = true;

  message("Signing in...");

  try {
    const { data, error } = await db.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    if (!data.user) throw new Error("Login could not be completed.");

    await start();

  } catch (error) {
    console.error("Login error:", error);
    message("Login failed: " + error.message);

  } finally {
    if (button) button.disabled = false;
  }
}


async function logout() {
  try {
    const { error } = await db.auth.signOut();
    if (error) throw error;

    if ($("app")) $("app").hidden = true;
    if ($("auth")) $("auth").hidden = false;
    if ($("logout")) $("logout").hidden = true;

    message("You have been logged out.");

  } catch (error) {
    message("Logout error: " + error.message);
  }
}


async function start() {
  try {
    message("Loading dashboard...");

    if ($("auth")) $("auth").hidden = true;
    if ($("app")) $("app").hidden = false;
    if ($("logout")) $("logout").hidden = false;

    await load();

    message("Dashboard ready.");

  } catch (error) {
    console.error("Dashboard error:", error);
    message("Dashboard error: " + error.message);

    if ($("app")) $("app").hidden = true;
    if ($("auth")) $("auth").hidden = false;
  }
}


/* =========================================
   DATABASE
========================================= */

async function rows(table) {
  let result = await db
    .from(table)
    .select("*")
    .order("created_at", { ascending: false });

  if (result.error && result.error.code === "42703") {
    result = await db.from(table).select("*");
  }

  if (result.error) {
    throw new Error(
      "Could not load " + table + ": " + result.error.message
    );
  }

  return result.data || [];
}


async function load() {
  const tables = [
    "packages",
    "customers",
    "leads",
    "bookings",
    "vendors",
    "transactions",
    "itineraries",
    "itinerary_days",
    "hotels",
    "hotel_photos",
    "cabs",
    "supplier_profiles",
    "supplier_listings",
    "supplier_submissions",
    "supplier_enquiries",
    "supplier_payment_entries"
  ];

  for (const table of tables) {
    D[table] = await rows(table);
  }

  render();
}


async function save(table, obj) {
  const { error } = await db.from(table).insert(obj);
  if (error) throw error;
  await load();
}


/* =========================================
   COMMON HTML CARDS
========================================= */

function card(title, lines, buttons = "") {
  return `
    <article>
      <div>
        <b>${esc(title)}</b>
        ${lines.map(line => `<p>${line}</p>`).join("")}
      </div>
      <div>${buttons}</div>
    </article>
  `;
}


function del(table, id) {
  return `
    <button
      type="button"
      class="danger"
      data-del="${esc(table)}"
      data-id="${esc(id)}">
      Delete
    </button>
  `;
}


/* =========================================
   PACKAGE POSTER MANAGEMENT
========================================= */

function resetPackageForm() {
  editingPackageId = null;

  $("packageF")?.reset();

  setText("packageDialogTitle", "Add Travel Package");
  setText("packageSave", "Save Package");

  setHTML(
    "packageImagePreview",
    "<small>No poster selected</small>"
  );
}


function openNewPackage() {
  resetPackageForm();
  show("packageDialog");
}


function openEditPackage(id) {
  const item = (D.packages || []).find(
    pkg => String(pkg.id) === String(id)
  );

  if (!item) return;

  editingPackageId = item.id;

  const form = $("packageF");
  if (!form) return;

  form.elements.name.value = item.name || "";
  form.elements.destination.value = item.destination || "";
  form.elements.duration.value = item.duration || "";
  form.elements.departure_dates.value = item.departure_dates || "";
  form.elements.price_per_person.value =
    item.price_per_person ?? "";
  form.elements.itinerary.value = item.itinerary || "";

  $("packageImage").value = "";

  setText("packageDialogTitle", "Edit Travel Package");
  setText("packageSave", "Update Package");

  if (item.image_url) {
    setHTML(
      "packageImagePreview",
      `
        <p><b>Current package poster</b></p>
        <img
          class="package-preview"
          src="${esc(item.image_url)}"
          alt="${esc(item.name)} poster"
        >
        <small>
          Choose a new image above if you want to replace this poster.
        </small>
      `
    );
  } else {
    setHTML(
      "packageImagePreview",
      "<small>No poster uploaded for this package yet.</small>"
    );
  }

  show("packageDialog");
}


function previewPackageImage() {
  const file = $("packageImage")?.files?.[0];

  if (!file) {
    const current = editingPackageId
      ? (D.packages || []).find(
          item => String(item.id) === String(editingPackageId)
        )
      : null;

    if (current?.image_url) {
      setHTML(
        "packageImagePreview",
        `
          <p><b>Current package poster</b></p>
          <img
            class="package-preview"
            src="${esc(current.image_url)}"
            alt="Current package poster"
          >
        `
      );
    } else {
      setHTML(
        "packageImagePreview",
        "<small>No poster selected</small>"
      );
    }

    return;
  }

  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    setHTML(
      "packageImagePreview",
      "<p style='color:#a83232'>Only JPG, PNG and WebP images are allowed.</p>"
    );
    $("packageImage").value = "";
    return;
  }

  if (file.size > MAX_PACKAGE_IMAGE_SIZE) {
    setHTML(
      "packageImagePreview",
      "<p style='color:#a83232'>Image is larger than 5 MB.</p>"
    );
    $("packageImage").value = "";
    return;
  }

  const reader = new FileReader();

  reader.onload = () => {
    setHTML(
      "packageImagePreview",
      `
        <p><b>Poster preview</b></p>
        <img
          class="package-preview"
          src="${reader.result}"
          alt="Package poster preview"
        >
      `
    );
  };

  reader.onerror = () => {
    message("Could not preview this image.");
  };

  reader.readAsDataURL(file);
}


async function uploadPackageImage(packageId, file) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    throw new Error(
      "Only JPG, PNG and WebP package posters are allowed."
    );
  }

  if (file.size > MAX_PACKAGE_IMAGE_SIZE) {
    throw new Error("Package poster must be smaller than 5 MB.");
  }

  const path =
    packageId + "/" +
    Date.now() + "-" +
    Math.random().toString(36).slice(2, 9) + "-" +
    safeFileName(file.name);

  message("Uploading package poster...");

  const { error: uploadError } = await db.storage
    .from(PACKAGE_BUCKET)
    .upload(path, file, {
      contentType: file.type,
      upsert: false
    });

  if (uploadError) throw uploadError;

  const { data } = db.storage
    .from(PACKAGE_BUCKET)
    .getPublicUrl(path);

  if (!data?.publicUrl) {
    await db.storage
      .from(PACKAGE_BUCKET)
      .remove([path]);

    throw new Error("Could not create a public package poster URL.");
  }

  return {
    image_url: data.publicUrl,
    storage_path: path
  };
}


async function savePackageForm(event) {
  event.preventDefault();

  const button = $("packageSave");
  if (button) button.disabled = true;

  let newImagePath = null;

  try {
    const { data: userData, error: userError } =
      await db.auth.getUser();

    if (userError || !userData.user) {
      throw new Error(
        "Your admin session has expired. Please log in again."
      );
    }

    const form = $("packageF");

    const name = form.elements.name.value.trim();

    if (!name) {
      throw new Error("Please enter a package name.");
    }

    const packageData = {
      name,
      destination:
        form.elements.destination.value.trim() || null,
      duration:
        form.elements.duration.value.trim() || null,
      price_per_person:
        form.elements.price_per_person.value.trim() === "" ? null : Number(form.elements.price_per_person.value),
      departure_dates:
        form.elements.departure_dates.value.trim() || null,
      itinerary:
        form.elements.itinerary.value.trim() || null
    };

    const file = $("packageImage")?.files?.[0];

    if (file) {
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        throw new Error("Please select a JPG, PNG or WebP poster.");
      }

      if (file.size > MAX_PACKAGE_IMAGE_SIZE) {
        throw new Error("Package poster must be smaller than 5 MB.");
      }
    }

    let packageId = editingPackageId;
    let oldStoragePath = null;

    if (packageId) {
      const oldPackage = (D.packages || []).find(
        item => String(item.id) === String(packageId)
      );

      oldStoragePath = oldPackage?.storage_path || null;
    }

    message("Saving package details...");

    if (packageId) {
      const { error } = await db
        .from("packages")
        .update(packageData)
        .eq("id", packageId);

      if (error) throw error;

    } else {
      const { data, error } = await db
        .from("packages")
        .insert(packageData)
        .select("id")
        .single();

      if (error) throw error;

      packageId = data.id;
    }

    if (file) {
      const image = await uploadPackageImage(packageId, file);
      newImagePath = image.storage_path;

      const { error: updateError } = await db
        .from("packages")
        .update(image)
        .eq("id", packageId);

      if (updateError) {
        await db.storage
          .from(PACKAGE_BUCKET)
          .remove([newImagePath]);

        newImagePath = null;
        throw updateError;
      }

      if (
        oldStoragePath &&
        oldStoragePath !== image.storage_path
      ) {
        const { error: removeError } = await db.storage
          .from(PACKAGE_BUCKET)
          .remove([oldStoragePath]);

        if (removeError) {
          console.warn(
            "Old package poster could not be removed:",
            removeError
          );
        }
      }
    }

    $("packageDialog")?.close();
    resetPackageForm();

    await load();

    message(
      file
        ? "Package and poster saved successfully."
        : "Package saved successfully."
    );

    alert(
      file
        ? "Package and poster saved successfully."
        : "Package saved successfully."
    );

  } catch (error) {
    console.error("Package save error:", error);

    if (newImagePath) {
      await db.storage
        .from(PACKAGE_BUCKET)
        .remove([newImagePath]);
    }

    message("Package save error: " + error.message);
    alert("Package save error: " + error.message);

  } finally {
    if (button) button.disabled = false;
  }
}


async function deletePackage(id) {
  const item = (D.packages || []).find(
    pkg => String(pkg.id) === String(id)
  );

  if (!item) return;

  if (!confirm(
    "Delete package '" + item.name +
    "' permanently? This cannot be undone."
  )) {
    return;
  }

  try {
    if (item.storage_path) {
      const { error: storageError } = await db.storage
        .from(PACKAGE_BUCKET)
        .remove([item.storage_path]);

      if (storageError) {
        throw new Error(
          "Package poster could not be removed. " +
          "Package was not deleted. " +
          storageError.message
        );
      }
    }

    const { error } = await db
      .from("packages")
      .delete()
      .eq("id", id);

    if (error) throw error;

    await load();

    message("Package and its poster deleted.");

  } catch (error) {
    console.error(error);
    alert("Package delete error: " + error.message);
  }
}


/* =========================================
   WHATSAPP
========================================= */

function openCustomerWhatsApp(phone, text) {
  let number = String(phone || "").replace(/\D/g, "");

  if (number.startsWith("0")) {
    number = number.slice(1);
  }

  if (number.length === 10) {
    number = "91" + number;
  }

  if (number.length < 11 || number.length > 13) {
    alert("Please check the mobile number.");
    return;
  }

  window.open(
    "https://wa.me/" + number + "?text=" + encodeURIComponent(text),
    "_blank"
  );
}


/* =========================================
   PDF GENERATION
========================================= */

function makePDF(title, content) {
  const win = window.open("", "_blank");

  if (!win) {
    alert("Please allow pop-ups and try again.");
    return;
  }

  win.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${esc(title)}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 30px;
          color: #173c36;
        }
        h1 { font-size: 22px; }
        .box {
          border: 1px solid #ccc;
          padding: 15px;
          margin: 20px 0;
          line-height: 1.8;
        }
        button {
          padding: 12px;
          background: #173c36;
          color: white;
          border: 0;
          cursor: pointer;
        }
        @media print {
          button { display: none; }
        }
      </style>
    </head>
    <body>
      <h1>HIMALAYAN ODYSSEY EXPEDITION</h1>
      <h2>${esc(title)}</h2>
      ${content}
      <p>Thank you for choosing Himalayan Odyssey Expedition.</p>
      <button onclick="window.print()">Print / Save as PDF</button>
    </body>
    </html>
  `);

  win.document.close();
}


function bookingPDF(id) {
  const booking = getBooking(id);
  if (!booking) return;

  const customer = getCustomer(booking);

  const total = Number(booking.total_amount || 0);
  const paid = Number(booking.amount_paid || 0);
  const balance = Math.max(0, total - paid);

  makePDF(
    "Booking Invoice",
    `
      <div class="box">
        Customer: ${esc(customer.name)}<br>
        Phone: ${esc(customer.phone)}<br>
        Destination: ${esc(booking.destination)}<br>
        Travel date: ${esc(booking.start_date)}<br>
        Travellers: ${esc(booking.travellers)}
      </div>
      <div class="box">
        Total amount: ${cash(total)}<br>
        Amount received: ${cash(paid)}<br>
        Balance due: <b>${cash(balance)}</b>
      </div>
      <p>Booking reference: ${esc(booking.id)}</p>
    `
  );
}


function paymentPDF(id) {
  const transaction = (D.transactions || []).find(
    item => String(item.id) === String(id)
  );

  if (!transaction) return;

  const booking = getBooking(transaction.booking_id);
  const customer = getCustomer(booking);

  makePDF(
    "Payment Receipt",
    `
      <div class="box">
        Customer: ${esc(customer.name)}<br>
        Destination: ${esc(booking?.destination)}<br>
        Payment date: ${esc(transaction.transaction_date)}<br>
        Payment method: ${esc(transaction.payment_method)}<br>
        Receipt reference: ${esc(transaction.id)}
      </div>
      <h2>Amount received: ${cash(transaction.amount)}</h2>
      <p>${esc(transaction.description || "Booking payment")}</p>
    `
  );
}


/* =========================================
   DASHBOARD RENDERING
========================================= */

function render() {
  const customers = Object.fromEntries(
    (D.customers || []).map(item => [item.id, item])
  );

  const leads = (D.leads || []).map(item => ({
    ...item,
    c: customers[item.customer_id] || {}
  }));

  const bookings = (D.bookings || []).map(item => ({
    ...item,
    c: customers[item.customer_id] || {}
  }));

  const transactions = D.transactions || [];

  const income = transactions
    .filter(item => item.transaction_type === "Payment")
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const expenses = transactions
    .filter(item => item.transaction_type === "Expense")
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const pending = (D.bookings || []).reduce(
    (sum, item) =>
      sum + Math.max(
        0,
        Number(item.total_amount || 0) -
        Number(item.amount_paid || 0)
      ),
    0
  );

  setText("nLeads", leads.length);
  setText("nBookings", bookings.length);
  setText("nPaid", cash(income));
  setText("nPending", cash(pending));

  setText("received", cash(income));
  setText("expenses", cash(expenses));
  setText("net", cash(income - expenses));


  /* PACKAGES */

  setHTML(
    "packageList",
    (D.packages || []).map(item => `
      <article>
        <div style="flex:1;min-width:220px">
          ${
            item.image_url
              ? `
                <img
                  class="package-card-image"
                  src="${esc(item.image_url)}"
                  alt="${esc(item.name)} poster"
                  loading="lazy"
                >
              `
              : "<small>No package poster uploaded.</small>"
          }

          <p><b>${esc(item.name)}</b></p>
          <p>${esc(item.destination || "")}</p>
          <p>${esc(item.duration || "")}</p>
          <p><b>${cash(item.price_per_person)} per person</b></p>
          <p>${esc(item.itinerary || "")}</p>
        </div>

        <div>
          <button
            type="button"
            data-edit-package="${esc(item.id)}">
            Edit
          </button>

          ${del("packages", item.id)}
        </div>
      </article>
    `).join("") || "No packages yet."
  );


  /* LEADS */

  setHTML(
    "leadList",
    leads.map(item =>
      card(
        item.c.name || "Lead",
        [
          esc(item.c.phone || ""),
          esc(item.destination || ""),
          esc(item.travel_date || ""),
          "Budget " + cash(item.budget)
        ],
        `
          ${
            item.c.phone
              ? `<button data-wa="${esc(item.c.phone)}">WhatsApp</button>`
              : ""
          }
          <button data-confirm="${esc(item.id)}">Confirm</button>
          ${del("leads", item.id)}
        `
      )
    ).join("") || "No leads yet."
  );


  /* BOOKINGS */

  setHTML(
    "bookingList",
    bookings.map(item => {
      const total = Number(item.total_amount || 0);
      const paid = Number(item.amount_paid || 0);
      const balance = Math.max(0, total - paid);

      return card(
        item.c.name || "Booking",
        [
          esc(item.destination || ""),
          esc(item.start_date || ""),
          `${Math.max(1, Number(item.package_quantity || 1))} package(s) • Total ${cash(total)} • Advance ${cash(paid)} • Balance ${cash(balance)}`
        ],
        `
          ${
            item.c.phone
              ? `
                <button data-confirm-wa="${esc(item.id)}">
                  Booking WhatsApp
                </button>
                <button data-remind="${esc(item.id)}">
                  Payment reminder
                </button>
              `
              : ""
          }
          <button data-invoice="${esc(item.id)}">Invoice PDF</button>
          <button data-pay="${esc(item.id)}">Add payment</button>
          ${del("bookings", item.id)}
        `
      );
    }).join("") || "No bookings yet."
  );


  /* RECENT BOOKINGS */

  setHTML(
    "recent",
    bookings.slice(0, 4).map(item =>
      card(
        item.c.name || "Booking",
        [
          esc(item.destination || ""),
          cash(item.total_amount)
        ]
      )
    ).join("") || "No bookings yet."
  );


  /* VENDORS */

  setHTML(
    "vendorList",
    (D.vendors || []).map(item =>
      card(
        item.name,
        [
          esc(item.category || ""),
          esc(item.phone || ""),
          esc(item.location || ""),
          esc(item.details || "")
        ],
        `
          ${
            item.phone
              ? `<a href="tel:${encodeURIComponent(item.phone)}">Call</a>`
              : ""
          }
          ${del("vendors", item.id)}
        `
      )
    ).join("") || "No vendor contacts yet."
  );


  /* CUSTOMER-WISE PACKAGE FINANCE LEDGER */

  const financeBookings = bookings;
  const packageUnits = financeBookings.reduce((sum, item) => sum + Math.max(1, Number(item.package_quantity || 1)), 0);
  const packageSales = financeBookings.reduce((sum, item) => sum + Number(item.total_amount || 0), 0);
  const supplierCosts = financeBookings.reduce((sum, item) => sum + (item.supplier_cost_per_package == null ? 0 : Number(item.supplier_cost_per_package || 0) * Math.max(1, Number(item.package_quantity || 1))), 0);
  const costedBookings = financeBookings.filter(item => item.supplier_cost_per_package !== null && item.supplier_cost_per_package !== undefined);
  const calculatedProfit = costedBookings.reduce((sum, item) => sum + Number(item.package_profit || 0), 0);
  const advances = financeBookings.reduce((sum, item) => sum + Number(item.amount_paid || 0), 0);
  const outstanding = financeBookings.reduce((sum, item) => sum + Math.max(0, Number(item.total_amount || 0) - Number(item.amount_paid || 0)), 0);

  setText("financePackagesSold", packageUnits);
  setText("financeSales", cash(packageSales));
  setText("financeSupplierCosts", cash(supplierCosts));
  setText("financeProfit", cash(calculatedProfit));
  setText("financeProfitNote", costedBookings.length === financeBookings.length ? "All bookings costed" : (financeBookings.length - costedBookings.length) + " booking(s) awaiting supplier cost");
  setText("financeAdvance", cash(advances));
  setText("financeBalance", cash(outstanding));

  setHTML("financeList", financeBookings.map(item => {
    const qty = Math.max(1, Number(item.package_quantity || 1));
    const salePerPackage = Number(item.total_amount || 0) / qty;
    const supplierPerPackage = item.supplier_cost_per_package == null ? null : Number(item.supplier_cost_per_package || 0);
    const supplierTotal = supplierPerPackage == null ? null : supplierPerPackage * qty;
    const balance = Math.max(0, Number(item.total_amount || 0) - Number(item.amount_paid || 0));
    const customer = item.c || {};
    const profit = item.package_profit == null ? null : Number(item.package_profit);
    return `
      <article class="finance-entry">
        <div class="finance-entry-head">
          <div>
            <b>${esc(customer.name || "Customer")}</b>
            <p>${esc(customer.phone || "No phone")} · ${esc(item.destination || "Package booking")} · ${esc(item.start_date || "Date not set")}</p>
          </div>
          <span class="finance-quantity">${qty} ${qty === 1 ? "PACKAGE" : "PACKAGES"}</span>
        </div>
        <div class="finance-breakdown">
          <div><small>Selling price / package</small><strong>${cash(salePerPackage)}</strong></div>
          <div><small>Total package revenue</small><strong>${cash(item.total_amount)}</strong></div>
          <div><small>Supplier cost / package</small><strong>${supplierPerPackage == null ? "Not entered" : cash(supplierPerPackage)}</strong></div>
          <div><small>Total supplier cost</small><strong>${supplierTotal == null ? "Awaiting cost" : cash(supplierTotal)}</strong></div>
          <div><small>Advance received</small><strong>${cash(item.amount_paid)}</strong></div>
          <div><small>Left to collect</small><strong>${cash(balance)}</strong></div>
        </div>
        <div class="finance-profit-line">
          <span>Calculated package profit <small>(revenue − supplier cost; advance excluded)</small></span>
          <strong>${profit == null ? "Enter supplier cost" : cash(profit)}</strong>
        </div>
        ${item.supplier_details ? `<p class="finance-supplier-notes"><b>Supplier services:</b> ${esc(item.supplier_details)}</p>` : ""}
        <div class="finance-actions">
          <button data-edit-booking-finance="${esc(item.id)}">Edit package & supplier costs</button>
          <button data-pay="${esc(item.id)}">Record advance / payment</button>
        </div>
      </article>
    `;
  }).join("") || "No customer bookings yet. Confirm a lead to create the first finance entry.");

  /* OTHER TRANSACTIONS AND RECEIPTS */
  setHTML(
    "financeTransactions",
    transactions.map(item =>
      card(
        item.transaction_type + " • " + cash(item.amount),
        [
          esc(item.transaction_date || ""),
          esc(item.payment_method || ""),
          esc(item.category || ""),
          esc(item.description || "")
        ],
        `
          ${
            item.transaction_type === "Payment" && item.booking_id
              ? `<button data-receipt="${esc(item.id)}">Payment receipt PDF</button>`
              : ""
          }
          ${del("transactions", item.id)}
        `
      )
    ).join("") || "No other transactions yet."
  );


  /* SERVICE PROVIDER PAYMENT LEDGER */
  const providerEntries = D.supplier_payment_entries || [];
  const providerGroups = Object.values(providerEntries.reduce((groups, entry) => {
    const key = entry.group_id || entry.id;
    if (!groups[key]) groups[key] = [];
    groups[key].push(entry);
    return groups;
  }, {}));
  const providerAgreed = providerGroups.reduce((sum, group) => sum + Math.max(0, ...group.map(row => Number(row.agreed_total || 0))), 0);
  const providerPaid = providerEntries.reduce((sum, row) => sum + Number(row.amount || 0), 0);
  const providerDue = providerGroups.reduce((sum, group) => {
    const agreed = Math.max(0, ...group.map(row => Number(row.agreed_total || 0)));
    return sum + Math.max(0, agreed - group.reduce((paid, row) => paid + Number(row.amount || 0), 0));
  }, 0);
  setText("providerPaymentGroups", providerGroups.length);
  setText("providerAgreedTotal", cash(providerAgreed));
  setText("providerPaidTotal", cash(providerPaid));
  setText("providerDueTotal", cash(providerDue));
  const providerById = Object.fromEntries((D.vendors || []).map(v => [v.id, v]));
  const bookingById = Object.fromEntries(bookings.map(b => [b.id, b]));
  setHTML("providerPaymentList", providerGroups.map(group => {
    const ordered = group.slice().sort((a,b) => new Date(a.payment_date || a.created_at) - new Date(b.payment_date || b.created_at));
    const first = ordered[0];
    const totalAgreed = Math.max(0, ...group.map(row => Number(row.agreed_total || 0)));
    const totalPaid = group.reduce((sum,row) => sum + Number(row.amount || 0),0);
    const due = Math.max(0,totalAgreed-totalPaid);
    const booking = bookingById[first.booking_id] || {};
    const customer = booking.c || {};
    return `<article class="provider-payment-group">
      <h4>${esc(first.supplier_name || providerById[first.vendor_id]?.name || "Service Provider")}</h4>
      <p class="provider-payment-meta">${esc(first.service_name || "Service not specified")} · ${esc(booking.destination || "No package linked")} ${customer.name ? "· " + esc(customer.name) : ""}</p>
      <div class="provider-payment-totals">
        <div><small>Agreed amount</small><strong>${cash(totalAgreed)}</strong></div>
        <div><small>Total paid</small><strong>${cash(totalPaid)}</strong></div>
        <div><small>Balance due</small><strong>${cash(due)}</strong></div>
      </div>
      <p class="provider-payment-linked">${group.length} LINKED PAYMENT ${group.length === 1 ? "ENTRY" : "ENTRIES"}</p>
      ${ordered.map(row => `<div class="provider-payment-row"><div><b>${esc(row.payment_stage)}</b> · ${esc(row.payment_date || "")}<small>${esc(row.payment_method || "Method not set")} · ${esc(row.description || "No note")}</small>${row.linked_entry_id ? '<small class="provider-payment-linked">CONNECTED TO AN EARLIER ENTRY</small>' : ""}</div><strong>${cash(row.amount)}</strong></div>`).join("")}
    </article>`;
  }).join("") || "No service provider payments recorded yet. Add an advance or full payment to start a provider ledger.");
  setHTML("providerVendorSelect", '<option value="">Enter provider manually</option>' + (D.vendors || []).map(v => `<option value="${esc(v.id)}">${esc(v.name)} · ${esc(v.category || "Vendor")}</option>`).join(""));
  setHTML("providerBookingSelect", '<option value="">No linked booking</option>' + bookings.map(item => `<option value="${esc(item.id)}">${esc(item.c.name || "Customer")} — ${esc(item.destination || "Trip")}</option>`).join(""));
  setHTML("providerLinkedEntry", '<option value="">Create a new payment group</option>' + providerEntries.map(row => `<option value="${esc(row.id)}">${esc(row.supplier_name)} · ${esc(row.service_name || "Service")} · ${cash(row.amount)} · ${esc(row.payment_date || "")}</option>`).join(""));

  /* BOOKING SELECT */

  setHTML(
    "bookingSelect",
    `
      <option value="">No linked booking</option>
      ${
        bookings.map(item => `
          <option value="${esc(item.id)}">
            ${esc(item.c.name || "Customer")} —
            ${esc(item.destination || "Trip")}
          </option>
        `).join("")
      }
    `
  );

  renderItineraries();
  renderHotels();
  renderCabs();
  renderSupplierNetwork();
}


/* =========================================
   HOTEL MANAGEMENT
========================================= */

function hotelPhotosFor(hotelId) {
  return (D.hotel_photos || [])
    .filter(photo => String(photo.hotel_id) === String(hotelId))
    .sort(
      (a, b) => Number(a.sort_order || 0) -
                Number(b.sort_order || 0)
    );
}


function renderHotels() {
  const el = $("hotelList");
  if (!el) return;

  const hotels = D.hotels || [];

  if (!hotels.length) {
    el.innerHTML =
      "No properties added yet. Select Add Hotel to create your first property.";
    return;
  }

  el.innerHTML = hotels.map(hotel => {
    const photos = hotelPhotosFor(hotel.id);

    const facilities = Array.isArray(hotel.facilities)
      ? hotel.facilities.join(", ")
      : "";

    const photoPreview = photos.slice(0, 4).map(photo => `
      <img
        src="${esc(photo.photo_url)}"
        alt="${esc(hotel.name)}"
        loading="lazy"
        style="width:75px;height:65px;object-fit:cover;border-radius:6px;margin:3px"
      >
    `).join("");

    return `
      <article>
        <div style="flex:1;min-width:220px">
          <b>${esc(hotel.name)}</b>
          <p>${esc(hotel.location)}</p>
          <p>${esc(hotel.description || "No description added.")}</p>
          <p><b>Facilities:</b> ${esc(facilities || "Not added")}</p>
          <p><b>Photographs:</b> ${photos.length}</p>
          <p class="hotel-status">
            ${hotel.published ? "Published on website" : "Draft / Not published"}
          </p>
          <div>${photoPreview}</div>
        </div>
        <div>
          <button data-edit-hotel="${esc(hotel.id)}">Edit</button>
          <button data-toggle-hotel="${esc(hotel.id)}">
            ${hotel.published ? "Unpublish" : "Publish"}
          </button>
          <button class="danger" data-delete-hotel="${esc(hotel.id)}">
            Delete
          </button>
        </div>
      </article>
    `;
  }).join("");
}


function resetHotelForm() {
  editingHotelId = null;
  $("hotelF")?.reset();
  setText("hotelDialogTitle", "Add Hotel / Property");
  setText("hotelSave", "Save Property");
  setHTML("hotelExistingPhotos", "");
}


function openNewHotel() {
  resetHotelForm();
  show("hotelDialog");
}


function openEditHotel(id) {
  const hotel = (D.hotels || []).find(
    item => String(item.id) === String(id)
  );

  if (!hotel) return;

  editingHotelId = hotel.id;

  setText("hotelDialogTitle", "Edit Hotel / Property");
  setText("hotelSave", "Update Property");

  $("hotelName").value = hotel.name || "";
  $("hotelLocation").value = hotel.location || "";
  $("hotelDescription").value = hotel.description || "";

  $("hotelFacilities").value = Array.isArray(hotel.facilities)
    ? hotel.facilities.join(", ")
    : "";

  $("hotelPublished").checked = !!hotel.published;
  $("hotelPhotos").value = "";

  renderHotelExistingPhotos(id);
  show("hotelDialog");
}


function renderHotelExistingPhotos(hotelId) {
  const photos = hotelPhotosFor(hotelId);

  if (!photos.length) {
    setHTML("hotelExistingPhotos", "<p>No photographs uploaded yet.</p>");
    return;
  }

  setHTML(
    "hotelExistingPhotos",
    `
      <h4>Existing photographs</h4>
      <div class="hotel-photo-grid">
        ${photos.map(photo => `
          <div class="hotel-photo">
            <img src="${esc(photo.photo_url)}" alt="Property photograph">
            <button
              type="button"
              class="danger"
              data-delete-hotel-photo="${esc(photo.id)}">
              Remove photo
            </button>
          </div>
        `).join("")}
      </div>
    `
  );
}


async function uploadHotelPhotos(hotelId, files) {
  const uploadedPaths = [];
  const photoRows = [];

  try {
    for (const file of files) {
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        throw new Error("Only JPG, PNG and WebP photographs are allowed.");
      }

      if (file.size > MAX_HOTEL_PHOTO_SIZE) {
        throw new Error(file.name + " is larger than 5 MB.");
      }

      const path =
        hotelId + "/" +
        Date.now() + "-" +
        Math.random().toString(36).slice(2, 9) + "-" +
        safeFileName(file.name);

      message("Uploading " + file.name + "...");

      const { error: uploadError } = await db.storage
        .from(HOTEL_BUCKET)
        .upload(path, file, {
          contentType: file.type,
          upsert: false
        });

      if (uploadError) throw uploadError;

      uploadedPaths.push(path);

      const { data } = db.storage
        .from(HOTEL_BUCKET)
        .getPublicUrl(path);

      if (!data?.publicUrl) {
        throw new Error("Could not create a public photograph URL.");
      }

      photoRows.push({
        hotel_id: hotelId,
        photo_url: data.publicUrl,
        storage_path: path,
        caption: file.name,
        sort_order: photoRows.length
      });
    }

    if (photoRows.length) {
      const { error: insertError } = await db
        .from("hotel_photos")
        .insert(photoRows);

      if (insertError) throw insertError;
    }

  } catch (error) {
    if (uploadedPaths.length) {
      await db.storage.from(HOTEL_BUCKET).remove(uploadedPaths);
    }
    throw error;
  }
}


async function saveHotelForm(event) {
  event.preventDefault();

  const button = $("hotelSave");
  if (button) button.disabled = true;

  try {
    const { data: userData, error: userError } =
      await db.auth.getUser();

    if (userError || !userData.user) {
      throw new Error("Your admin session has expired. Please log in again.");
    }

    const name = $("hotelName").value.trim();
    const location = $("hotelLocation").value.trim();

    if (!name || !location) {
      throw new Error("Hotel name and location are required.");
    }

    const facilities = $("hotelFacilities").value
      .split(",")
      .map(item => item.trim())
      .filter(Boolean);

    const hotel = {
      name,
      location,
      description: $("hotelDescription").value.trim() || null,
      facilities,
      published: $("hotelPublished").checked
    };

    let hotelId = editingHotelId;

    message("Saving property details...");

    if (hotelId) {
      const { error } = await db
        .from("hotels")
        .update(hotel)
        .eq("id", hotelId);

      if (error) throw error;

    } else {
      const { data, error } = await db
        .from("hotels")
        .insert(hotel)
        .select("id")
        .single();

      if (error) throw error;
      hotelId = data.id;
    }

    const files = Array.from($("hotelPhotos").files || []);

    if (files.length) {
      await uploadHotelPhotos(hotelId, files);
    }

    $("hotelDialog").close();
    resetHotelForm();
    await load();

    message("Property saved successfully.");
    alert("Property saved successfully.");

  } catch (error) {
    console.error(error);
    alert("Hotel save error: " + error.message);
    message("Hotel save error: " + error.message);

  } finally {
    if (button) button.disabled = false;
  }
}


async function toggleHotelPublished(id) {
  const hotel = (D.hotels || []).find(
    item => String(item.id) === String(id)
  );

  if (!hotel) return;

  const newStatus = !hotel.published;
  const action = newStatus ? "publish" : "unpublish";

  if (!confirm("Are you sure you want to " + action + " " + hotel.name + "?")) {
    return;
  }

  try {
    const { error } = await db
      .from("hotels")
      .update({ published: newStatus })
      .eq("id", id);

    if (error) throw error;

    await load();
    message("Property " + (newStatus ? "published" : "unpublished") + ".");

  } catch (error) {
    alert("Could not update property: " + error.message);
  }
}


async function deleteHotelPhoto(id) {
  const photo = (D.hotel_photos || []).find(
    item => String(item.id) === String(id)
  );

  if (!photo) return;
  if (!confirm("Remove this photograph permanently?")) return;

  try {
    if (photo.storage_path) {
      const { error: storageError } = await db.storage
        .from(HOTEL_BUCKET)
        .remove([photo.storage_path]);

      if (storageError) throw storageError;
    }

    const { error } = await db
      .from("hotel_photos")
      .delete()
      .eq("id", id);

    if (error) throw error;

    await load();

    if (editingHotelId) {
      renderHotelExistingPhotos(editingHotelId);
    }

    message("Photograph removed.");

  } catch (error) {
    alert("Could not remove photograph: " + error.message);
  }
}


async function deleteHotel(id) {
  const hotel = (D.hotels || []).find(
    item => String(item.id) === String(id)
  );

  if (!hotel) return;

  if (!confirm(
    "Delete " + hotel.name +
    " and all its photographs? This cannot be undone."
  )) return;

  try {
    const photos = hotelPhotosFor(id);
    const paths = photos.map(photo => photo.storage_path).filter(Boolean);

    if (paths.length) {
      const { error: storageError } = await db.storage
        .from(HOTEL_BUCKET)
        .remove(paths);

      if (storageError) {
        throw new Error(
          "Photographs could not be removed from storage. " +
          "Hotel was not deleted. " + storageError.message
        );
      }
    }

    const { error } = await db
      .from("hotels")
      .delete()
      .eq("id", id);

    if (error) throw error;

    await load();
    message("Property and its photographs deleted.");

  } catch (error) {
    alert("Delete error: " + error.message);
  }
}


/* =========================================
   CAB MANAGEMENT
========================================= */

function renderCabs() {
  const el = $("cabList");
  if (!el) return;

  const cabs = D.cabs || [];

  if (!cabs.length) {
    el.innerHTML =
      "No cabs added yet. Select Add Cab to add your first vehicle.";
    return;
  }

  el.innerHTML = cabs.map(cab => `
    <article>
      <div style="flex:1;min-width:220px">
        <b>${esc(cab.name)}</b>
        <p>${esc(cab.model || "Model not specified")}</p>
        <p><b>Passengers:</b> ${esc(cab.seating_capacity)}</p>
        <p><b>Daily price:</b> ${cash(cab.daily_price)}</p>
        <p>${esc(cab.description || "No description added.")}</p>
        <p class="hotel-status">
          ${cab.published ? "Published on website" : "Draft / Not published"}
        </p>
        ${
          cab.image_url
            ? `<img class="cab-preview" src="${esc(cab.image_url)}" alt="${esc(cab.name)}">`
            : "<small>No cab photograph uploaded.</small>"
        }
      </div>
      <div>
        <button data-edit-cab="${esc(cab.id)}">Edit</button>
        <button data-toggle-cab="${esc(cab.id)}">
          ${cab.published ? "Unpublish" : "Publish"}
        </button>
        <button class="danger" data-delete-cab="${esc(cab.id)}">Delete</button>
      </div>
    </article>
  `).join("");
}


function resetCabForm() {
  editingCabId = null;
  $("cabF")?.reset();
  setText("cabDialogTitle", "Add Cab");
  setText("cabSave", "Save Cab");
  setHTML("cabExistingPhoto", "");
}


function openNewCab() {
  resetCabForm();
  show("cabDialog");
}


function openEditCab(id) {
  const cab = (D.cabs || []).find(
    item => String(item.id) === String(id)
  );

  if (!cab) return;

  editingCabId = cab.id;

  setText("cabDialogTitle", "Edit Cab");
  setText("cabSave", "Update Cab");

  $("cabName").value = cab.name || "";
  $("cabModel").value = cab.model || "";
  $("cabSeats").value = cab.seating_capacity ?? "";
  $("cabPrice").value = cab.daily_price ?? "";
  $("cabDescription").value = cab.description || "";
  $("cabPublished").checked = !!cab.published;
  $("cabPhoto").value = "";

  if (cab.image_url) {
    setHTML(
      "cabExistingPhoto",
      `
        <h4>Current cab photograph</h4>
        <img class="cab-preview" src="${esc(cab.image_url)}" alt="${esc(cab.name)}">
        <p><small>Upload a new photograph above if you want to replace this one.</small></p>
      `
    );
  } else {
    setHTML("cabExistingPhoto", "<p>No photograph uploaded yet.</p>");
  }

  show("cabDialog");
}


async function uploadCabPhoto(cabId, file) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    throw new Error("Only JPG, PNG and WebP cab photographs are allowed.");
  }

  if (file.size > MAX_CAB_PHOTO_SIZE) {
    throw new Error("Cab photograph must be smaller than 5 MB.");
  }

  const path =
    cabId + "/" +
    Date.now() + "-" +
    Math.random().toString(36).slice(2, 9) + "-" +
    safeFileName(file.name);

  message("Uploading cab photograph...");

  const { error } = await db.storage
    .from(CAB_BUCKET)
    .upload(path, file, {
      contentType: file.type,
      upsert: false
    });

  if (error) throw error;

  const { data } = db.storage
    .from(CAB_BUCKET)
    .getPublicUrl(path);

  if (!data?.publicUrl) {
    await db.storage.from(CAB_BUCKET).remove([path]);
    throw new Error("Could not create a public cab photograph URL.");
  }

  return {
    image_url: data.publicUrl,
    storage_path: path
  };
}


async function saveCabForm(event) {
  event.preventDefault();

  const button = $("cabSave");
  if (button) button.disabled = true;

  try {
    const { data: userData, error: userError } =
      await db.auth.getUser();

    if (userError || !userData.user) {
      throw new Error("Your admin session has expired. Please log in again.");
    }

    const name = $("cabName").value.trim();
    const model = $("cabModel").value.trim();
    const seats = Number($("cabSeats").value);
    const price = Number($("cabPrice").value);
    const description = $("cabDescription").value.trim();
    const published = $("cabPublished").checked;
    const file = $("cabPhoto").files[0];

    if (!name) throw new Error("Please enter the cab type or name.");
    if (!Number.isInteger(seats) || seats < 1) {
      throw new Error("Please enter a valid passenger capacity.");
    }
    if (!Number.isFinite(price) || price < 0) {
      throw new Error("Please enter a valid daily rental price.");
    }

    const cabData = {
      name,
      model: model || null,
      seating_capacity: seats,
      daily_price: price,
      description: description || null,
      published
    };

    let cabId = editingCabId;
    let oldStoragePath = null;

    if (cabId) {
      const oldCab = (D.cabs || []).find(
        item => String(item.id) === String(cabId)
      );
      oldStoragePath = oldCab?.storage_path || null;
    }

    message("Saving cab details...");

    if (!cabId) {
      const { data, error } = await db
        .from("cabs")
        .insert(cabData)
        .select("id")
        .single();

      if (error) throw error;
      cabId = data.id;

    } else {
      const { error } = await db
        .from("cabs")
        .update(cabData)
        .eq("id", cabId);

      if (error) throw error;
    }

    if (file) {
      const photo = await uploadCabPhoto(cabId, file);

      const { error } = await db
        .from("cabs")
        .update(photo)
        .eq("id", cabId);

      if (error) {
        await db.storage.from(CAB_BUCKET).remove([photo.storage_path]);
        throw error;
      }

      if (oldStoragePath && oldStoragePath !== photo.storage_path) {
        const { error: removeError } = await db.storage
          .from(CAB_BUCKET)
          .remove([oldStoragePath]);

        if (removeError) {
          console.warn("Old cab photo could not be removed:", removeError);
        }
      }
    }

    $("cabDialog").close();
    resetCabForm();
    await load();

    message("Cab saved successfully.");
    alert("Cab saved successfully.");

  } catch (error) {
    console.error(error);
    message("Cab save error: " + error.message);
    alert("Cab save error: " + error.message);

  } finally {
    if (button) button.disabled = false;
  }
}


async function toggleCabPublished(id) {
  const cab = (D.cabs || []).find(
    item => String(item.id) === String(id)
  );

  if (!cab) return;

  const newStatus = !cab.published;
  const action = newStatus ? "publish" : "unpublish";

  if (!confirm("Are you sure you want to " + action + " " + cab.name + "?")) {
    return;
  }

  try {
    const { error } = await db
      .from("cabs")
      .update({ published: newStatus })
      .eq("id", id);

    if (error) throw error;

    await load();
    message("Cab " + (newStatus ? "published" : "unpublished") + ".");

  } catch (error) {
    alert("Could not update cab: " + error.message);
  }
}


async function deleteCab(id) {
  const cab = (D.cabs || []).find(
    item => String(item.id) === String(id)
  );

  if (!cab) return;

  if (!confirm("Delete " + cab.name + " permanently? This cannot be undone.")) {
    return;
  }

  try {
    if (cab.storage_path) {
      const { error: storageError } = await db.storage
        .from(CAB_BUCKET)
        .remove([cab.storage_path]);

      if (storageError) {
        throw new Error(
          "Cab photograph could not be removed. Cab was not deleted. " +
          storageError.message
        );
      }
    }

    const { error } = await db
      .from("cabs")
      .delete()
      .eq("id", id);

    if (error) throw error;

    await load();
    message("Cab and its photograph deleted.");

  } catch (error) {
    alert("Cab delete error: " + error.message);
  }
}


/* =========================================
   ITINERARIES
========================================= */

function renderItineraries() {
  const el = $("itineraryList");
  if (!el) return;

  el.innerHTML = (D.itineraries || []).map(it => {
    const days = (D.itinerary_days || [])
      .filter(day => String(day.itinerary_id) === String(it.id))
      .sort((a, b) => Number(a.day_number) - Number(b.day_number));

    return card(
      it.title,
      [
        `${esc(it.destination || "")} • ${esc(it.duration_days || "—")} days / ${esc(it.duration_nights ?? "—")} nights`,
        `Price: ${esc(it.price || "On request")} • ${it.published ? "Published" : "Draft"}`,
        esc(it.summary || ""),
        `${days.length} day(s) added • ${Array.isArray(it.gallery_images) ? it.gallery_images.length : 0} photo(s) • ${it.pdf_url ? "PDF attached ✓" : "No PDF"}`
      ],
      `
        <button data-edit-itinerary="${esc(it.id)}">Edit</button>
        <button data-itinerary-wa="${esc(it.id)}">WhatsApp enquiry</button>
        ${del("itineraries", it.id)}
      `
    );
  }).join("") ||
    "No itineraries yet. Select Add itinerary to create your first one.";
}


function addDayRow(day = {}) {
  const wrap = $("dayEditor");
  if (!wrap) return;

  const number = wrap.querySelectorAll(".day-entry").length + 1;
  const row = document.createElement("div");

  row.className = "day-entry card";

  row.innerHTML = `
    <h4>Day <span class="day-label">${number}</span></h4>

    <label>Day number
      <input class="day-number" type="number" min="1"
        value="${esc(day.day_number || number)}" required>
    </label>

    <label>Day title
      <input class="day-title" value="${esc(day.title || "")}"
        placeholder="e.g. Delhi to Narkanda">
    </label>

    <label>Day description
      <textarea class="day-description" rows="3"
        placeholder="Route, sightseeing and activities">${esc(day.description || "")}</textarea>
    </label>

    <label>Overnight location
      <input class="day-overnight" value="${esc(day.overnight_location || "")}"
        placeholder="e.g. Narkanda">
    </label>

    <button type="button" class="danger remove-day">Remove this day</button>
  `;

  row.querySelector(".remove-day").addEventListener("click", () => {
    row.remove();
    renumberDayLabels();
  });

  wrap.appendChild(row);
  renumberDayLabels();
}


function renumberDayLabels() {
  document.querySelectorAll("#dayEditor .day-entry").forEach((row, index) => {
    row.querySelector(".day-label").textContent = index + 1;
  });
}


function populateItineraryPackageOptions(selectedId = "") {
  const select = $("itineraryPackage");
  if (!select) return;

  const linkedElsewhere = new Set(
    (D.itineraries || [])
      .filter(it =>
        it.package_id &&
        String(it.id) !== String(editingItineraryId)
      )
      .map(it => String(it.package_id))
  );

  select.innerHTML =
    '<option value="">No linked package</option>' +
    (D.packages || []).map(pkg => {
      const id = String(pkg.id);
      const alreadyLinked = linkedElsewhere.has(id);
      const selected = id === String(selectedId) ? " selected" : "";
      const disabled = alreadyLinked ? " disabled" : "";
      const suffix = alreadyLinked ? " (already linked)" : "";

      return `<option value="${esc(id)}"${selected}${disabled}>${esc(pkg.name)}${suffix}</option>`;
    }).join("");
}


function resetItineraryForm() {
  editingItineraryId = null;
  $("itineraryF")?.reset();

  populateItineraryPackageOptions("");
  itineraryGalleryImages = [];
  if ($("itineraryPhotos")) $("itineraryPhotos").value = "";
  setHTML("itineraryGalleryExisting", "");

  if ($("dayEditor")) $("dayEditor").innerHTML = "";

  setText("itineraryDialogTitle", "Add itinerary");
  setText("itinerarySave", "Save itinerary");

  addDayRow();
}


function openEditItinerary(id) {
  const it = (D.itineraries || []).find(
    item => String(item.id) === String(id)
  );

  if (!it) return;

  editingItineraryId = it.id;

  setText("itineraryDialogTitle", "Edit itinerary");
  setText("itinerarySave", "Update itinerary");

  $("itineraryTitle").value = it.title || "";
  $("itineraryDestination").value = it.destination || "";
  $("itineraryDays").value = it.duration_days || "";
  $("itineraryNights").value = it.duration_nights ?? "";
  $("itineraryPrice").value = it.price || "";
  $("itineraryCover").value = it.cover_image || "";
  $("itinerarySummary").value = it.summary || "";
  itineraryGalleryImages = Array.isArray(it.gallery_images) ? [...it.gallery_images] : [];
  $("itineraryPhotos").value = "";
  renderItineraryGalleryExisting();
  $("itineraryPublished").checked = !!it.published;

  populateItineraryPackageOptions(it.package_id || "");

  $("dayEditor").innerHTML = "";

  const days = (D.itinerary_days || [])
    .filter(day => String(day.itinerary_id) === String(it.id))
    .sort((a, b) => Number(a.day_number) - Number(b.day_number));

  days.forEach(addDayRow);

  if (!days.length) addDayRow();

  show("itineraryForm");
}


function renderItineraryGalleryExisting() {
  const target = $("itineraryGalleryExisting");
  if (!target) return;
  if (!itineraryGalleryImages.length) {
    target.innerHTML = "<small>No itinerary photos added yet.</small>";
    return;
  }
  target.innerHTML = itineraryGalleryImages.map((photo, index) => `
    <div class="hotel-photo">
      <img src="${esc(photo.url)}" alt="Itinerary photo ${index + 1}">
      <small>Photo ${index + 1}</small>
      <button type="button" class="danger" data-remove-itinerary-photo="${index}">Remove photo</button>
    </div>
  `).join("");
}

async function uploadItineraryPhoto(file, itineraryId) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    throw new Error("Only JPG, PNG and WebP itinerary photos are allowed.");
  }
  if (file.size > MAX_ITINERARY_PHOTO_SIZE) {
    throw new Error("Each itinerary photo must be smaller than 5 MB.");
  }
  const path = itineraryId + "/" + Date.now() + "-" +
    Math.random().toString(36).slice(2, 8) + "-" + safeFileName(file.name);
  const { error } = await db.storage.from(ITINERARY_PHOTO_BUCKET).upload(path, file, {
    contentType: file.type,
    cacheControl: "3600",
    upsert: false
  });
  if (error) throw error;
  const { data } = db.storage.from(ITINERARY_PHOTO_BUCKET).getPublicUrl(path);
  if (!data?.publicUrl) {
    await db.storage.from(ITINERARY_PHOTO_BUCKET).remove([path]);
    throw new Error("Could not create a public itinerary photo URL.");
  }
  return { url: data.publicUrl, storage_path: path };
}

function bindItineraryForm() {
  if (!$("itineraryF")) return;

  $("addItineraryDay")?.addEventListener("click", () => addDayRow());
  $("itineraryGalleryExisting")?.addEventListener("click", event => {
    const button = event.target.closest("[data-remove-itinerary-photo]");
    if (!button) return;
    const index = Number(button.dataset.removeItineraryPhoto);
    if (!Number.isInteger(index) || index < 0 || index >= itineraryGalleryImages.length) return;
    itineraryGalleryImages.splice(index, 1);
    renderItineraryGalleryExisting();
  });

  $("itineraryF").addEventListener("submit", async event => {
    event.preventDefault();

    try {
      const { data: userData, error: userError } =
        await db.auth.getUser();

      if (userError || !userData.user) {
        throw new Error(userError?.message || "Please sign in again.");
      }

      const itinerary = {
        owner_id: userData.user.id,
        package_id: $("itineraryPackage").value || null,
        title: $("itineraryTitle").value.trim(),
        destination: $("itineraryDestination").value.trim() || null,
        duration_days: $("itineraryDays").value
          ? Number($("itineraryDays").value)
          : null,
        duration_nights: $("itineraryNights").value
          ? Number($("itineraryNights").value)
          : null,
        price: $("itineraryPrice").value.trim() || null,
        cover_image: $("itineraryCover").value.trim() || null,
        summary: $("itinerarySummary").value.trim() || null,
        published: $("itineraryPublished").checked
      };

      if (!itinerary.title) {
        throw new Error("Please enter an itinerary title.");
      }

      const photoFiles = [...($("itineraryPhotos")?.files || [])];
      for (const file of photoFiles) {
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) throw new Error("Only JPG, PNG and WebP itinerary photos are allowed.");
        if (file.size > MAX_ITINERARY_PHOTO_SIZE) throw new Error("Each itinerary photo must be smaller than 5 MB.");
      }
      const originalGallery = (D.itineraries || []).find(item => String(item.id) === String(editingItineraryId))?.gallery_images || [];

      const days = [
        ...document.querySelectorAll("#dayEditor .day-entry")
      ].map(row => ({
        owner_id: userData.user.id,
        day_number: Number(row.querySelector(".day-number").value),
        title: row.querySelector(".day-title").value.trim() || null,
        description: row.querySelector(".day-description").value.trim() || null,
        overnight_location: row.querySelector(".day-overnight").value.trim() || null
      })).filter(day => day.day_number > 0);

      if (!days.length) {
        throw new Error("Please add at least one itinerary day.");
      }

      let id = editingItineraryId;

      if (id) {
        let result = await db
          .from("itineraries")
          .update(itinerary)
          .eq("id", id);

        if (result.error) throw result.error;

        result = await db
          .from("itinerary_days")
          .delete()
          .eq("itinerary_id", id);

        if (result.error) throw result.error;

      } else {
        const result = await db
          .from("itineraries")
          .insert(itinerary)
          .select("id")
          .single();

        if (result.error) throw result.error;
        id = result.data.id;
      }

      if (photoFiles.length) {
        message("Uploading itinerary photos...");
        const uploadedPhotos = [];
        for (const file of photoFiles) uploadedPhotos.push(await uploadItineraryPhoto(file, id));
        itineraryGalleryImages = [...itineraryGalleryImages, ...uploadedPhotos];
      }

      const galleryResult = await db.from("itineraries")
        .update({ gallery_images: itineraryGalleryImages })
        .eq("id", id);
      if (galleryResult.error) throw galleryResult.error;

      const removedPhotos = originalGallery.filter(oldPhoto =>
        !itineraryGalleryImages.some(current => current.storage_path && current.storage_path === oldPhoto.storage_path)
      );
      const removedPaths = removedPhotos.map(photo => photo.storage_path).filter(Boolean);
      if (removedPaths.length) {
        const { error: removeError } = await db.storage.from(ITINERARY_PHOTO_BUCKET).remove(removedPaths);
        if (removeError) console.warn("Some removed itinerary photos remain in storage:", removeError);
      }

      const result = await db
        .from("itinerary_days")
        .insert(days.map(day => ({
          ...day,
          itinerary_id: id
        })));

      if (result.error) throw result.error;

      $("itineraryForm").close();
      resetItineraryForm();
      await load();

      message("Itinerary saved.");
      alert("Itinerary saved successfully.");

    } catch (error) {
      console.error(error);
      alert("Itinerary save error: " + error.message);
      message("Itinerary save error: " + error.message);
    }
  });
}


/* =========================================
   PAGE BUTTONS
========================================= */

function bindPageButtons() {
  document.querySelectorAll("[data-open]").forEach(button => {
    button.addEventListener("click", () => {
      const dialogId = button.dataset.open;

      if (dialogId === "packageDialog") {
        openNewPackage();
        return;
      }

      show(dialogId);
    });
  });

  document.querySelectorAll("[data-close]").forEach(button => {
    button.addEventListener("click", () => {
      button.closest("dialog")?.close();
    });
  });

  document.querySelectorAll("nav button").forEach(button => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".panel").forEach(panel => {
        panel.classList.toggle("active", panel.id === button.dataset.tab);
      });

      document.querySelectorAll("nav button").forEach(navButton => {
        navButton.classList.toggle("active", navButton === button);
      });
    });
  });
}


/* =========================================
   GENERAL FORMS
========================================= */

function bindForm(id, table, transform) {
  const form = $(id);
  if (!form) return;

  form.addEventListener("submit", async event => {
    event.preventDefault();

    const obj = Object.fromEntries(new FormData(form));

    Object.keys(obj).forEach(key => {
      if (obj[key] === "") obj[key] = null;
    });

    try {
      await save(table, transform ? transform(obj) : obj);

      form.closest("dialog")?.close();
      form.reset();

    } catch (error) {
      alert("Error: " + error.message);
    }
  });
}


function bindForms() {
  /* PACKAGE FORM - CUSTOM IMAGE HANDLER */

  $("packageF")?.addEventListener("submit", savePackageForm);

  $("packageImage")?.addEventListener(
    "change",
    previewPackageImage
  );


  /* VENDOR FORM */

  bindForm(
    "vendorF",
    "vendors",
    obj => ({
      ...obj,
      rates: obj.rates ? Number(obj.rates) : null
    })
  );


  /* FINANCE FORM */

  bindForm(
    "financeF",
    "transactions",
    obj => ({
      ...obj,
      amount: Number(obj.amount),
      booking_id: obj.booking_id || null
    })
  );

  $("providerPaymentF")?.addEventListener("submit", async event => {
    event.preventDefault();
    const form = event.currentTarget;
    const obj = Object.fromEntries(new FormData(form));
    const linked = (D.supplier_payment_entries || []).find(row => String(row.id) === String(obj.linked_entry_id || ""));
    const amount = Number(obj.amount);
    const agreed = Number(obj.agreed_total);
    if (!obj.supplier_name.trim() || !Number.isFinite(amount) || amount <= 0 || !Number.isFinite(agreed) || agreed < 0) {
      alert("Enter a provider name, a valid payment amount and agreed total.");
      return;
    }
    if (linked && linked.supplier_name && obj.supplier_name.trim().toLowerCase() !== linked.supplier_name.trim().toLowerCase()) {
      if (!confirm("The selected linked entry belongs to " + linked.supplier_name + ". Connect this payment to that same provider?")) return;
    }
    try {
      const payload = {
        supplier_name: obj.supplier_name.trim(),
        vendor_id: obj.vendor_id || linked?.vendor_id || null,
        service_name: obj.service_name.trim() || linked?.service_name || null,
        booking_id: obj.booking_id || linked?.booking_id || null,
        agreed_total: agreed,
        amount,
        payment_stage: obj.payment_stage,
        payment_date: obj.payment_date || null,
        payment_method: obj.payment_method || null,
        description: obj.description.trim() || null,
        ...(linked ? {group_id: linked.group_id, linked_entry_id: linked.id} : {})
      };
      const { error } = await db.from("supplier_payment_entries").insert(payload);
      if (error) throw error;
      form.closest("dialog")?.close();
      form.reset();
      await load();
      alert("Provider payment saved and linked successfully.");
    } catch (error) {
      alert("Could not save provider payment: " + error.message);
    }
  });




  /* LEAD FORM */

  const leadForm = $("leadF");

  if (leadForm) {
    leadForm.addEventListener("submit", async event => {
      event.preventDefault();

      const form = event.target;
      const obj = Object.fromEntries(new FormData(form));

      try {
        const { data: customer, error } = await db
          .from("customers")
          .insert({
            name: obj.name,
            phone: obj.phone || null,
            email: obj.email || null
          })
          .select("id")
          .single();

        if (error) throw error;

        const { error: leadError } = await db
          .from("leads")
          .insert({
            customer_id: customer.id,
            destination: obj.destination || null,
            travel_date: obj.travel_date || null,
            travellers: Number(obj.travellers) || 1,
            budget: Number(obj.budget) || 0,
            notes: obj.notes || null
          });

        if (leadError) throw leadError;

        form.closest("dialog")?.close();
        form.reset();
        await load();

      } catch (error) {
        alert("Error: " + error.message);
      }
    });
  }

  $("providerVendorSelect")?.addEventListener("change", event => {
    const vendor = (D.vendors || []).find(row => String(row.id) === String(event.target.value));
    if (vendor && $("providerPaymentF")?.elements.supplier_name) $("providerPaymentF").elements.supplier_name.value = vendor.name || "";
  });
  $("providerLinkedEntry")?.addEventListener("change", event => {
    const entry = (D.supplier_payment_entries || []).find(row => String(row.id) === String(event.target.value));
    if (!entry) return;
    const form = $("providerPaymentF");
    if (form) {
      form.elements.supplier_name.value = entry.supplier_name || "";
      form.elements.vendor_id.value = entry.vendor_id || "";
      form.elements.service_name.value = entry.service_name || "";
      form.elements.booking_id.value = entry.booking_id || "";
      form.elements.agreed_total.value = entry.agreed_total ?? "";
    }
  });

  bindItineraryForm();

  $("hotelF")?.addEventListener("submit", saveHotelForm);
  $("cabF")?.addEventListener("submit", saveCabForm);
}



/* =========================================
   SUPPLIER NETWORK ADMIN
========================================= */
function renderSupplierNetwork() {
  const profiles = D.supplier_profiles || [];
  const listings = D.supplier_listings || [];
  const enquiries = D.supplier_enquiries || [];
  const submissions = D.supplier_submissions || [];
  setText("supplierSubmissionCount", submissions.filter(s => s.status === "pending").length);
  setText("supplierCount", profiles.length);
  setText("supplierListingCount", listings.length);
  setText("supplierEnquiryCount", enquiries.length);
  const profileById = Object.fromEntries(profiles.map(p => [p.id,p]));
  setHTML("supplierSubmissions", submissions.map(s => card(
    s.business_name || s.title || "New service owner",
    [
      "Contact person: " + esc(s.contact_person),
      "Private mobile: " + esc(s.phone) + " · WhatsApp: " + esc(s.whatsapp),
      "Email: " + esc(s.email || "—"),
      "Category: " + esc(s.supplier_type) + " · Listing: " + esc(s.listing_type),
      "Service: " + esc(s.title) + " · " + esc(s.destination) + " · " + esc(s.location),
      "Price: " + (s.price ? cash(s.price) + " " + esc(s.price_unit || "") : "On request"),
      "Address: " + esc(s.business_address || [s.city,s.state].filter(Boolean).join(", ") || "—"),
      "Details: " + esc(s.description || "—"),
      "Submission status: <b>" + esc(s.status) + "</b>"
    ],
    (s.status === "pending" ? '<button data-submission-action="publish" data-submission-id="'+esc(s.id)+'">Approve & publish listing</button><button class="danger" data-submission-action="reject" data-submission-id="'+esc(s.id)+'">Reject</button>' : '<span class="muted">Reviewed</span>')
  )).join("") || "No new service-owner submissions yet.");
  setHTML("supplierProfiles", profiles.map(p => card(
    p.business_name || "Supplier",
    [
      "Contact: " + esc(p.contact_person),
      "Verified mobile: " + esc(p.phone),
      "Category: " + esc(p.supplier_type),
      "Location: " + esc([p.city,p.state].filter(Boolean).join(", ")),
      "Email: " + esc(p.email || "—"),
      "GST: " + esc(p.gst_number || "—"),
      "Status: <b>" + esc(p.verification_status) + "</b>"
    ],
    (p.verification_status !== "approved" ? '<button data-supplier-status="approved" data-supplier-id="'+esc(p.id)+'">Approve supplier</button>' : '<button class="secondary" data-supplier-status="suspended" data-supplier-id="'+esc(p.id)+'">Suspend</button>') +
    '<button class="danger" data-supplier-status="rejected" data-supplier-id="'+esc(p.id)+'">Reject</button>'
  )).join("") || "No supplier registrations yet.");
  setHTML("supplierListings", listings.map(l => {
    const p = profileById[l.supplier_id] || {};
    return card(l.title, [
      "Type: " + esc(l.listing_type) + " · " + esc(l.destination) + " · " + esc(l.location),
      "Supplier: " + esc(p.business_name || p.contact_person || "Unknown"),
      "Private mobile: " + esc(p.phone || "—"),
      "Price: " + (l.price ? cash(l.price) + " " + esc(l.price_unit || "") : "On request"),
      "Status: <b>" + esc(l.status) + "</b>"
    ],
    (l.status !== "approved" ? '<button data-listing-status="approved" data-listing-id="'+esc(l.id)+'">Publish listing</button>' : '<button class="secondary" data-listing-status="suspended" data-listing-id="'+esc(l.id)+'">Unpublish</button>') +
    '<button class="danger" data-listing-status="rejected" data-listing-id="'+esc(l.id)+'">Reject</button>')
  }).join("") || "No supplier listings submitted yet.");
  setHTML("supplierEnquiries", enquiries.map(e => {
    const l = listings.find(x => String(x.id) === String(e.listing_id)) || {};
    return card(e.traveller_name, [
      "Mobile: " + esc(e.traveller_phone),
      "Email: " + esc(e.traveller_email || "—"),
      "Listing: " + esc(l.title || "General enquiry"),
      "Travel date: " + esc(e.travel_date || "—") + " · Travellers/rooms: " + esc(e.travellers || "—"),
      "Message: " + esc(e.message || "—"),
      "Status: <b>" + esc(e.status) + "</b>"
    ], '<button data-enquiry-status="contacted" data-enquiry-id="'+esc(e.id)+'">Mark contacted</button><button data-enquiry-status="quoted" data-enquiry-id="'+esc(e.id)+'">Mark quoted</button><button data-enquiry-status="closed" data-enquiry-id="'+esc(e.id)+'">Close enquiry</button>')
  }).join("") || "No marketplace enquiries yet.");
}


/* =========================================
   DASHBOARD ACTIONS
========================================= */

function bindActions() {
  document.addEventListener("click", async event => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    let button;

    button = target.closest("#newProviderPayment");
    if (button) {
      $("providerPaymentF")?.reset();
      show("providerPaymentDialog");
      return;
    }

    button = target.closest("[data-submission-action]");
    if (button) {
      const submission = (D.supplier_submissions || []).find(s => String(s.id) === String(button.dataset.submissionId));
      if (!submission) { alert("This submission could not be found. Refresh the dashboard."); return; }
      button.disabled = true;
      try {
        if (button.dataset.submissionAction === "publish") {
          const { error: listingError } = await db.from("supplier_listings").insert({
            supplier_id: null,
            listing_type: submission.listing_type,
            title: submission.title,
            destination: submission.destination,
            location: submission.location,
            description: submission.description,
            price: submission.price,
            price_unit: submission.price_unit,
            vehicle_model: submission.vehicle_model,
            seating_capacity: submission.seating_capacity,
            vehicle_features: submission.vehicle_features || [],
            property_type: submission.property_type,
            room_types: submission.room_types || [],
            amenities: submission.amenities || [],
            images: [],
            status: "approved",
            is_active: true
          });
          if (listingError) throw listingError;
          const { error: updateError } = await db.from("supplier_submissions").update({status:"approved"}).eq("id", submission.id);
          if (updateError) throw updateError;
          alert("Submission approved and listing published. Owner contact details remain private in the admin dashboard.");
        } else {
          const { error } = await db.from("supplier_submissions").update({status:"rejected"}).eq("id", submission.id);
          if (error) throw error;
        }
        await load();
      } catch (error) {
        alert("Could not update supplier submission: " + error.message);
        button.disabled = false;
      }
      return;
    }

    button = target.closest("[data-supplier-status]");
    if (button) {
      const { error } = await db.from("supplier_profiles").update({verification_status:button.dataset.supplierStatus}).eq("id",button.dataset.supplierId);
      if (error) { alert("Supplier update failed: " + error.message); return; }
      await load(); return;
    }

    button = target.closest("[data-listing-status]");
    if (button) {
      const { error } = await db.from("supplier_listings").update({status:button.dataset.listingStatus}).eq("id",button.dataset.listingId);
      if (error) { alert("Listing update failed: " + error.message); return; }
      await load(); return;
    }

    button = target.closest("[data-enquiry-status]");
    if (button) {
      const { error } = await db.from("supplier_enquiries").update({status:button.dataset.enquiryStatus}).eq("id",button.dataset.enquiryId);
      if (error) { alert("Enquiry update failed: " + error.message); return; }
      await load(); return;
    }

    /* EDIT PACKAGE */

    button = target.closest("[data-edit-package]");

    if (button) {
      openEditPackage(button.dataset.editPackage);
      return;
    }


    /* EDIT PACKAGE QUANTITY, SELLING PRICE AND SUPPLIER COSTS */
    button = target.closest("[data-edit-booking-finance]");
    if (button) {
      const booking = getBooking(button.dataset.editBookingFinance);
      if (!booking) return;
      const currentQuantity = Math.max(1, Number(booking.package_quantity || 1));
      const quantityInput = prompt("Number of packages sold", String(currentQuantity));
      if (quantityInput === null) return;
      const quantity = Number(quantityInput);
      if (!Number.isInteger(quantity) || quantity < 1) { alert("Enter a whole package quantity of at least 1."); return; }

      const currentUnitPrice = Number(booking.total_amount || 0) / currentQuantity;
      const priceInput = prompt("Selling price for ONE package ₹", String(currentUnitPrice));
      if (priceInput === null) return;
      const unitPrice = Number(priceInput);
      if (!Number.isFinite(unitPrice) || unitPrice < 0) { alert("Enter a valid selling price."); return; }

      const currentSupplierCost = booking.supplier_cost_per_package == null ? "" : String(booking.supplier_cost_per_package);
      const supplierInput = prompt("Total supplier/service cost for ONE package ₹ (blank = not entered)", currentSupplierCost);
      if (supplierInput === null) return;
      const supplierCost = supplierInput.trim() === "" ? null : Number(supplierInput);
      if (supplierCost !== null && (!Number.isFinite(supplierCost) || supplierCost < 0)) { alert("Enter a valid supplier cost or leave it blank."); return; }

      const detailsInput = prompt("Supplier/service breakdown (hotel, cab, food etc.)", booking.supplier_details || "");
      if (detailsInput === null) return;

      try {
        const { error } = await db.from("bookings").update({
          package_quantity: quantity,
          total_amount: unitPrice * quantity,
          supplier_cost_per_package: supplierCost,
          supplier_details: detailsInput.trim() || null
        }).eq("id", booking.id);
        if (error) throw error;
        await load();
        alert("Package finance updated. Profit is recalculated automatically; advance received was not changed.");
      } catch (error) {
        alert("Could not update package finance: " + error.message);
      }
      return;
    }

    /* INVOICE PDF */

    button = target.closest("[data-invoice]");

    if (button) {
      bookingPDF(button.dataset.invoice);
      return;
    }


    /* PAYMENT RECEIPT */

    button = target.closest("[data-receipt]");

    if (button) {
      paymentPDF(button.dataset.receipt);
      return;
    }


    /* EDIT ITINERARY */

    button = target.closest("[data-edit-itinerary]");

    if (button) {
      openEditItinerary(button.dataset.editItinerary);
      return;
    }


    /* EDIT HOTEL */

    button = target.closest("[data-edit-hotel]");

    if (button) {
      openEditHotel(button.dataset.editHotel);
      return;
    }


    /* PUBLISH / UNPUBLISH HOTEL */

    button = target.closest("[data-toggle-hotel]");

    if (button) {
      await toggleHotelPublished(button.dataset.toggleHotel);
      return;
    }


    /* DELETE HOTEL PHOTO */

    button = target.closest("[data-delete-hotel-photo]");

    if (button) {
      await deleteHotelPhoto(button.dataset.deleteHotelPhoto);
      return;
    }


    /* DELETE HOTEL */

    button = target.closest("[data-delete-hotel]");

    if (button) {
      await deleteHotel(button.dataset.deleteHotel);
      return;
    }


    /* CAB ACTIONS */

    button = target.closest("[data-edit-cab]");

    if (button) {
      openEditCab(button.dataset.editCab);
      return;
    }

    button = target.closest("[data-toggle-cab]");

    if (button) {
      await toggleCabPublished(button.dataset.toggleCab);
      return;
    }

    button = target.closest("[data-delete-cab]");

    if (button) {
      await deleteCab(button.dataset.deleteCab);
      return;
    }


    /* ITINERARY WHATSAPP */

    button = target.closest("[data-itinerary-wa]");

    if (button) {
      const it = (D.itineraries || []).find(
        item => String(item.id) === String(button.dataset.itineraryWa)
      );

      if (it) {
        openCustomerWhatsApp(
          "9816929669",
          "Hello Himalayan Odyssey Expedition, I would like to enquire about the " +
          it.title +
          " itinerary. Please share details and availability."
        );
      }

      return;
    }


    /* BOOKING WHATSAPP / PAYMENT REMINDER */

    button = target.closest("[data-confirm-wa], [data-remind]");

    if (button) {
      const id = button.dataset.confirmWa || button.dataset.remind;
      const booking = getBooking(id);

      if (!booking) return;

      const customer = getCustomer(booking);

      const total = Number(booking.total_amount || 0);
      const paid = Number(booking.amount_paid || 0);
      const balance = Math.max(0, total - paid);

      const reminder = button.dataset.remind !== undefined;

      const text = reminder
        ? `Hello ${customer.name || ""}, this is a friendly payment reminder from Himalayan Odyssey Expedition. Your ${booking.destination || "trip"} booking has a pending balance of ${cash(balance)}. Thank you.`
        : `Hello ${customer.name || ""}, your ${booking.destination || "trip"} booking is confirmed with Himalayan Odyssey Expedition. Travel date: ${booking.start_date || "—"}. Total: ${cash(total)}. Received: ${cash(paid)}. Balance: ${cash(balance)}. Thank you!`;

      openCustomerWhatsApp(customer.phone, text);
      return;
    }


    /* DELETE RECORD */

    button = target.closest("[data-del]");

    if (button) {
      const table = button.dataset.del;
      const id = button.dataset.id;

      if (table === "packages") {
        await deletePackage(id);
        return;
      }

      if (!confirm("Delete this record?")) return;

      try {
        const { error } = await db
          .from(table)
          .delete()
          .eq("id", id);

        if (error) throw error;

        await load();

      } catch (error) {
        alert("Delete error: " + error.message);
      }

      return;
    }


    /* LEAD WHATSAPP */

    button = target.closest("[data-wa]");

    if (button) {
      openCustomerWhatsApp(
        button.dataset.wa,
        "Hello, I would like to discuss my travel enquiry."
      );
      return;
    }


    /* CONFIRM LEAD AS BOOKING */

    button = target.closest("[data-confirm]");

    if (button) {
      const lead = (D.leads || []).find(
        item => String(item.id) === String(button.dataset.confirm)
      );

      if (!lead) return;

      const quantityInput = prompt("How many packages has this customer booked?", "1");
      if (quantityInput === null) return;
      const quantity = Number(quantityInput);
      if (!Number.isInteger(quantity) || quantity < 1) {
        alert("Package quantity must be a whole number of at least 1.");
        return;
      }

      const unitPriceInput = prompt("Selling price for ONE package ₹", lead.budget || "0");
      if (unitPriceInput === null) return;
      const unitPrice = Number(unitPriceInput);
      if (!Number.isFinite(unitPrice) || unitPrice < 0) {
        alert("Please enter a valid package selling price.");
        return;
      }

      const supplierCostInput = prompt("Supplier/service cost for ONE package ₹ (leave blank if not known yet)", "");
      if (supplierCostInput === null) return;
      const supplierCost = supplierCostInput.trim() === "" ? null : Number(supplierCostInput);
      if (supplierCost !== null && (!Number.isFinite(supplierCost) || supplierCost < 0)) {
        alert("Please enter a valid supplier cost, or leave it blank.");
        return;
      }

      const supplierDetails = prompt("Supplier/service cost breakdown (hotel, cab, food etc.)", "") ;
      if (supplierDetails === null) return;

      const paid = prompt("Advance received ₹ (this reduces only the balance due, not profit)", "0");
      if (paid === null) return;
      const advance = Number(paid);
      if (!Number.isFinite(advance) || advance < 0) {
        alert("Please enter a valid advance amount.");
        return;
      }

      try {
        const { error } = await db
          .from("bookings")
          .insert({
            customer_id: lead.customer_id,
            destination: lead.destination,
            start_date: lead.travel_date,
            travellers: lead.travellers,
            package_quantity: quantity,
            total_amount: unitPrice * quantity,
            supplier_cost_per_package: supplierCost,
            supplier_details: supplierDetails.trim() || null,
            amount_paid: advance,
            notes: lead.notes
          });

        if (error) throw error;

        const { error: deleteError } = await db
          .from("leads")
          .delete()
          .eq("id", lead.id);

        if (deleteError) throw deleteError;

        await load();
        alert("Lead converted into booking successfully.");

      } catch (error) {
        alert("Booking error: " + error.message);
      }

      return;
    }


    /* ADD PAYMENT */

    button = target.closest("[data-pay]");

    if (button) {
      const booking = (D.bookings || []).find(
        item => String(item.id) === String(button.dataset.pay)
      );

      if (!booking) return;

      const amount = prompt("Payment received ₹");

      if (!amount || Number(amount) <= 0) return;

      try {
        const { error } = await db
          .from("transactions")
          .insert({
            booking_id: booking.id,
            transaction_type: "Payment",
            amount: Number(amount),
            description: "Booking payment"
          });

        if (error) throw error;

        const newPaid =
          Number(booking.amount_paid || 0) + Number(amount);

        const { error: updateError } = await db
          .from("bookings")
          .update({ amount_paid: newPaid })
          .eq("id", booking.id);

        if (updateError) throw updateError;

        await load();
        alert("Payment recorded successfully.");

      } catch (error) {
        alert("Payment error: " + error.message);
      }

      return;
    }

  });
}


/* =========================================
   STARTUP
========================================= */

async function initialize() {
  try {
    if (!window.supabase || !window.supabase.createClient) {
      throw new Error(
        "Supabase library did not load. Check your internet connection."
      );
    }

    if (!SUPABASE_KEY || SUPABASE_KEY.includes("PASTE_YOUR")) {
      throw new Error(
        "Please add your actual Supabase publishable key in app.js."
      );
    }

    db = window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_KEY
    );

    bindPageButtons();
    bindForms();
    bindActions();


    /* NEW ITINERARY */

    $("newItinerary")?.addEventListener("click", () => {
      resetItineraryForm();
      show("itineraryForm");
    });


    /* NEW HOTEL */

    $("newHotel")?.addEventListener("click", openNewHotel);


    /* NEW CAB */

    $("newCab")?.addEventListener("click", openNewCab);


    /* LOGIN */

    $("login")?.addEventListener("click", login);


    /* LOGOUT */

    $("logout")?.addEventListener("click", logout);


    /* REFRESH */

    $("refresh")?.addEventListener("click", async () => {
      try {
        await load();
        message("Dashboard refreshed.");

      } catch (error) {
        message("Refresh error: " + error.message);
      }
    });


    /* ENTER KEY LOGIN */

    $("password")?.addEventListener("keydown", event => {
      if (event.key === "Enter") login();
    });


    message("Ready. Enter your admin login details.");


    /* CHECK EXISTING SESSION */

    const { data, error } = await db.auth.getSession();

    if (error) throw error;

    if (data.session) {
      await start();
    }

  } catch (error) {
    console.error("Startup error:", error);
    message("App startup error: " + error.message);
  }
}


/* =========================================
   START APPLICATION
========================================= */

initialize();
