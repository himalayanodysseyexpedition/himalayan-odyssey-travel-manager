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

const MAX_HOTEL_PHOTO_SIZE = 5 * 1024 * 1024;
const MAX_CAB_PHOTO_SIZE = 5 * 1024 * 1024;
const MAX_PDF_SIZE = 10 * 1024 * 1024;

let db;
let D = {};

let editingItineraryId = null;
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
  if ($("msg")) {
    $("msg").textContent = text;
  }
}

function setText(id, value) {
  if ($(id)) {
    $(id).textContent = value ?? "";
  }
}

function setHTML(id, value) {
  if ($(id)) {
    $(id).innerHTML = value ?? "";
  }
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

    if (!data.user) {
      throw new Error("Login could not be completed.");
    }

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

  // Fallback for tables without created_at.
  if (result.error && result.error.code === "42703") {
    result = await db
      .from(table)
      .select("*");
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
    "cabs"
  ];

  for (const table of tables) {
    D[table] = await rows(table);
  }

  render();
}


async function save(table, obj) {
  const { error } = await db
    .from(table)
    .insert(obj);

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

        h1 {
          font-size: 22px;
        }

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
          button {
            display: none;
          }
        }
      </style>
    </head>

    <body>
      <h1>HIMALAYAN ODYSSEY EXPEDITION</h1>
      <h2>${esc(title)}</h2>

      ${content}

      <p>Thank you for choosing Himalayan Odyssey Expedition.</p>

      <button onclick="window.print()">
        Print / Save as PDF
      </button>
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
    .reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    );

  const expenses = transactions
    .filter(item => item.transaction_type === "Expense")
    .reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    );

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
    (D.packages || []).map(item =>
      card(
        item.name,
        [
          esc(item.destination || ""),
          esc(item.duration || ""),
          cash(item.price_per_person),
          esc(item.itinerary || "")
        ],
        del("packages", item.id)
      )
    ).join("") || "No packages yet."
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

          <button data-confirm="${esc(item.id)}">
            Confirm
          </button>

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
          `Total ${cash(total)} • Paid ${cash(paid)} • Balance ${cash(balance)}`
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

          <button data-invoice="${esc(item.id)}">
            Invoice PDF
          </button>

          <button data-pay="${esc(item.id)}">
            Add payment
          </button>

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


  /* FINANCE */

  setHTML(
    "financeList",
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
    ).join("") || "No transactions yet."
  );


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
}


/* =========================================
   HOTEL MANAGEMENT
========================================= */

function hotelPhotosFor(hotelId) {
  return (D.hotel_photos || [])
    .filter(
      photo => String(photo.hotel_id) === String(hotelId)
    )
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
        style="
          width:75px;
          height:65px;
          object-fit:cover;
          border-radius:6px;
          margin:3px;
        "
      >
    `).join("");

    return `
      <article>
        <div style="flex:1;min-width:220px">
          <b>${esc(hotel.name)}</b>

          <p>${esc(hotel.location)}</p>

          <p>
            ${esc(hotel.description || "No description added.")}
          </p>

          <p>
            <b>Facilities:</b>
            ${esc(facilities || "Not added")}
          </p>

          <p><b>Photographs:</b> ${photos.length}</p>

          <p class="hotel-status">
            ${hotel.published
              ? "Published on website"
              : "Draft / Not published"}
          </p>

          <div>${photoPreview}</div>
        </div>

        <div>
          <button data-edit-hotel="${esc(hotel.id)}">
            Edit
          </button>

          <button data-toggle-hotel="${esc(hotel.id)}">
            ${hotel.published ? "Unpublish" : "Publish"}
          </button>

          <button
            class="danger"
            data-delete-hotel="${esc(hotel.id)}">
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
    setHTML(
      "hotelExistingPhotos",
      "<p>No photographs uploaded yet.</p>"
    );
    return;
  }

  setHTML(
    "hotelExistingPhotos",
    `
      <h4>Existing photographs</h4>

      <div class="hotel-photo-grid">
        ${photos.map(photo => `
          <div class="hotel-photo">
            <img
              src="${esc(photo.photo_url)}"
              alt="Property photograph"
            >

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
        throw new Error(
          "Only JPG, PNG and WebP photographs are allowed."
        );
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
        throw new Error(
          "Could not create a public photograph URL."
        );
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
      await db.storage
        .from(HOTEL_BUCKET)
        .remove(uploadedPaths);
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
      throw new Error(
        "Your admin session has expired. Please log in again."
      );
    }

    const name = $("hotelName").value.trim();
    const location = $("hotelLocation").value.trim();

    if (!name || !location) {
      throw new Error(
        "Hotel name and location are required."
      );
    }

    const facilities = $("hotelFacilities").value
      .split(",")
      .map(item => item.trim())
      .filter(Boolean);

    const hotel = {
      name,
      location,
      description:
        $("hotelDescription").value.trim() || null,
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

    const files = Array.from(
      $("hotelPhotos").files || []
    );

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

  if (!confirm(
    "Are you sure you want to " +
    action + " " + hotel.name + "?"
  )) {
    return;
  }

  try {
    const { error } = await db
      .from("hotels")
      .update({ published: newStatus })
      .eq("id", id);

    if (error) throw error;

    await load();

    message(
      "Property " +
      (newStatus ? "published" : "unpublished") +
      "."
    );

  } catch (error) {
    alert("Could not update property: " + error.message);
  }
}


async function deleteHotelPhoto(id) {
  const photo = (D.hotel_photos || []).find(
    item => String(item.id) === String(id)
  );

  if (!photo) return;

  if (!confirm("Remove this photograph permanently?")) {
    return;
  }

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
  )) {
    return;
  }

  try {
    const photos = hotelPhotosFor(id);

    const paths = photos
      .map(photo => photo.storage_path)
      .filter(Boolean);

    if (paths.length) {
      const { error: storageError } = await db.storage
        .from(HOTEL_BUCKET)
        .remove(paths);

      if (storageError) {
        throw new Error(
          "Photographs could not be removed from storage. " +
          "Hotel was not deleted. " +
          storageError.message
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

        <p>
          <b>Passengers:</b>
          ${esc(cab.seating_capacity)}
        </p>

        <p>
          <b>Daily price:</b>
          ${cash(cab.daily_price)}
        </p>

        <p>
          ${esc(cab.description || "No description added.")}
        </p>

        <p class="hotel-status">
          ${cab.published
            ? "Published on website"
            : "Draft / Not published"}
        </p>

        ${
          cab.image_url
            ? `
              <img
                class="cab-preview"
                src="${esc(cab.image_url)}"
                alt="${esc(cab.name)}"
              >
            `
            : "<small>No cab photograph uploaded.</small>"
        }
      </div>

      <div>
        <button data-edit-cab="${esc(cab.id)}">
          Edit
        </button>

        <button data-toggle-cab="${esc(cab.id)}">
          ${cab.published ? "Unpublish" : "Publish"}
        </button>

        <button
          class="danger"
          data-delete-cab="${esc(cab.id)}">
          Delete
        </button>
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

        <img
          class="cab-preview"
          src="${esc(cab.image_url)}"
          alt="${esc(cab.name)}"
        >

        <p>
          <small>
            Upload a new photograph above if you want to replace this one.
          </small>
        </p>
      `
    );

  } else {
    setHTML(
      "cabExistingPhoto",
      "<p>No photograph uploaded yet.</p>"
    );
  }

  show("cabDialog");
}


async function uploadCabPhoto(cabId, file) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    throw new Error(
      "Only JPG, PNG and WebP cab photographs are allowed."
    );
  }

  if (file.size > MAX_CAB_PHOTO_SIZE) {
    throw new Error(
      "Cab photograph must be smaller than 5 MB."
    );
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
    await db.storage
      .from(CAB_BUCKET)
      .remove([path]);

    throw new Error(
      "Could not create a public cab photograph URL."
    );
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
      throw new Error(
        "Your admin session has expired. Please log in again."
      );
    }

    const name = $("cabName").value.trim();
    const model = $("cabModel").value.trim();
    const seats = Number($("cabSeats").value);
    const price = Number($("cabPrice").value);
    const description = $("cabDescription").value.trim();
    const published = $("cabPublished").checked;
    const file = $("cabPhoto").files[0];

    if (!name) {
      throw new Error("Please enter the cab type or name.");
    }

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
        await db.storage
          .from(CAB_BUCKET)
          .remove([photo.storage_path]);

        throw error;
      }

      if (
        oldStoragePath &&
        oldStoragePath !== photo.storage_path
      ) {
        const { error: removeError } = await db.storage
          .from(CAB_BUCKET)
          .remove([oldStoragePath]);

        if (removeError) {
          console.warn(
            "Old cab photo could not be removed:",
            removeError
          );
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

  if (!confirm(
    "Are you sure you want to " +
    action + " " + cab.name + "?"
  )) {
    return;
  }

  try {
    const { error } = await db
      .from("cabs")
      .update({ published: newStatus })
      .eq("id", id);

    if (error) throw error;

    await load();

    message(
      "Cab " +
      (newStatus ? "published" : "unpublished") +
      "."
    );

  } catch (error) {
    alert("Could not update cab: " + error.message);
  }
}


async function deleteCab(id) {
  const cab = (D.cabs || []).find(
    item => String(item.id) === String(id)
  );

  if (!cab) return;

  if (!confirm(
    "Delete " + cab.name +
    " permanently? This cannot be undone."
  )) {
    return;
  }

  try {
    if (cab.storage_path) {
      const { error: storageError } = await db.storage
        .from(CAB_BUCKET)
        .remove([cab.storage_path]);

      if (storageError) {
        throw new Error(
          "Cab photograph could not be removed. " +
          "Cab was not deleted. " +
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
      .filter(
        day => String(day.itinerary_id) === String(it.id)
      )
      .sort(
        (a, b) => Number(a.day_number) - Number(b.day_number)
      );

    return card(
      it.title,
      [
        `${esc(it.destination || "")} • ${esc(it.duration_days || "—")} days / ${esc(it.duration_nights ?? "—")} nights`,
        `Price: ${esc(it.price || "On request")} • ${it.published ? "Published" : "Draft"}`,
        esc(it.summary || ""),
        `${days.length} day(s) added • ${it.pdf_url ? "PDF attached ✓" : "No PDF"}`
      ],
      `
        <button data-edit-itinerary="${esc(it.id)}">
          Edit
        </button>

        <button data-itinerary-wa="${esc(it.id)}">
          WhatsApp enquiry
        </button>

        ${del("itineraries", it.id)}
      `
    );

  }).join("") ||
    "No itineraries yet. Select Add itinerary to create your first one.";
}


function addDayRow(day = {}) {
  const wrap = $("dayEditor");

  if (!wrap) return;

  const number =
    wrap.querySelectorAll(".day-entry").length + 1;

  const row = document.createElement("div");

  row.className = "day-entry card";

  row.innerHTML = `
    <h4>
      Day <span class="day-label">${number}</span>
    </h4>

    <label>
      Day number

      <input
        class="day-number"
        type="number"
        min="1"
        value="${esc(day.day_number || number)}"
        required
      >
    </label>

    <label>
      Day title

      <input
        class="day-title"
        value="${esc(day.title || "")}"
        placeholder="e.g. Delhi to Narkanda"
      >
    </label>

    <label>
      Day description

      <textarea
        class="day-description"
        rows="3"
        placeholder="Route, sightseeing and activities"
      >${esc(day.description || "")}</textarea>
    </label>

    <label>
      Overnight location

      <input
        class="day-overnight"
        value="${esc(day.overnight_location || "")}"
        placeholder="e.g. Narkanda"
      >
    </label>

    <button
      type="button"
      class="danger remove-day">
      Remove this day
    </button>
  `;

  row.querySelector(".remove-day").addEventListener(
    "click",
    () => {
      row.remove();
      renumberDayLabels();
    }
  );

  wrap.appendChild(row);

  renumberDayLabels();
}


function renumberDayLabels() {
  document
    .querySelectorAll("#dayEditor .day-entry")
    .forEach((row, index) => {
      row.querySelector(".day-label").textContent = index + 1;
    });
}


function resetItineraryForm() {
  editingItineraryId = null;

  $("itineraryF")?.reset();

  setHTML("itineraryPdfCurrent", "");

  if ($("dayEditor")) {
    $("dayEditor").innerHTML = "";
  }

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
  $("itineraryPublished").checked = !!it.published;

  setHTML(
    "itineraryPdfCurrent",
    it.pdf_url
      ? `
        ✓ PDF attached —
        <a
          href="${esc(it.pdf_url)}"
          target="_blank"
          rel="noopener">
          view
        </a>.
        Choose a new file to replace it.
      `
      : ""
  );

  $("dayEditor").innerHTML = "";

  const days = (D.itinerary_days || [])
    .filter(
      day => String(day.itinerary_id) === String(it.id)
    )
    .sort(
      (a, b) => Number(a.day_number) - Number(b.day_number)
    );

  days.forEach(addDayRow);

  if (!days.length) {
    addDayRow();
  }

  show("itineraryForm");
}


async function uploadItineraryPdf(file, title) {
  if (file.type !== "application/pdf") {
    throw new Error("Please select a PDF file.");
  }

  if (file.size > MAX_PDF_SIZE) {
    throw new Error("PDF must be under 10 MB.");
  }

  const safeName = String(title || "itinerary")
    .replace(/[^a-z0-9]+/gi, "-")
    .slice(0, 50);

  const path =
    Date.now() + "-" + safeName + ".pdf";

  const { error } = await db.storage
    .from(ITINERARY_BUCKET)
    .upload(path, file, {
      contentType: "application/pdf",
      upsert: false
    });

  if (error) throw error;

  const { data } = db.storage
    .from(ITINERARY_BUCKET)
    .getPublicUrl(path);

  if (!data?.publicUrl) {
    await db.storage
      .from(ITINERARY_BUCKET)
      .remove([path]);

    throw new Error("Could not create the PDF URL.");
  }

  return data.publicUrl;
}


function bindItineraryForm() {
  if (!$("itineraryF")) return;

  $("addItineraryDay")?.addEventListener(
    "click",
    () => addDayRow()
  );

  $("itineraryF").addEventListener(
    "submit",
    async event => {
      event.preventDefault();

      try {
        const { data: userData, error: userError } =
          await db.auth.getUser();

        if (userError || !userData.user) {
          throw new Error(
            userError?.message || "Please sign in again."
          );
        }

        const itinerary = {
          owner_id: userData.user.id,
          title: $("itineraryTitle").value.trim(),
          destination:
            $("itineraryDestination").value.trim() || null,
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

        const pdfFile = $("itineraryPdf").files[0];

        if (pdfFile) {
          message("Uploading PDF...");

          itinerary.pdf_url =
            await uploadItineraryPdf(
              pdfFile,
              itinerary.title
            );
        }

        const days = [
          ...document.querySelectorAll(
            "#dayEditor .day-entry"
          )
        ].map(row => ({
          owner_id: userData.user.id,
          day_number: Number(
            row.querySelector(".day-number").value
          ),
          title:
            row.querySelector(".day-title").value.trim() || null,
          description:
            row.querySelector(".day-description").value.trim() || null,
          overnight_location:
            row.querySelector(".day-overnight").value.trim() || null
        })).filter(day => day.day_number > 0);

        if (!days.length) {
          throw new Error(
            "Please add at least one itinerary day."
          );
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

        const result = await db
          .from("itinerary_days")
          .insert(
            days.map(day => ({
              ...day,
              itinerary_id: id
            }))
          );

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
    }
  );
}


/* =========================================
   PAGE BUTTONS
========================================= */

function bindPageButtons() {
  document.querySelectorAll("[data-open]").forEach(button => {
    button.addEventListener("click", () => {
      show(button.dataset.open);
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
        panel.classList.toggle(
          "active",
          panel.id === button.dataset.tab
        );
      });

      document.querySelectorAll("nav button").forEach(navButton => {
        navButton.classList.toggle(
          "active",
          navButton === button
        );
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

    const obj = Object.fromEntries(
      new FormData(form)
    );

    Object.keys(obj).forEach(key => {
      if (obj[key] === "") {
        obj[key] = null;
      }
    });

    try {
      await save(
        table,
        transform ? transform(obj) : obj
      );

      form.closest("dialog")?.close();

      form.reset();

    } catch (error) {
      alert("Error: " + error.message);
    }
  });
}


function bindForms() {
  bindForm(
    "packageF",
    "packages",
    obj => ({
      ...obj,
      price_per_person: Number(obj.price_per_person) || 0
    })
  );

  bindForm(
    "vendorF",
    "vendors",
    obj => ({
      ...obj,
      rates: obj.rates ? Number(obj.rates) : null
    })
  );

  bindForm(
    "financeF",
    "transactions",
    obj => ({
      ...obj,
      amount: Number(obj.amount),
      booking_id: obj.booking_id || null
    })
  );


  /* LEAD FORM */

  const leadForm = $("leadF");

  if (leadForm) {
    leadForm.addEventListener("submit", async event => {
      event.preventDefault();

      const form = event.target;
      const obj = Object.fromEntries(
        new FormData(form)
      );

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

  bindItineraryForm();

  $("hotelF")?.addEventListener(
    "submit",
    saveHotelForm
  );

  $("cabF")?.addEventListener(
    "submit",
    saveCabForm
  );
}


/* =========================================
   DASHBOARD ACTIONS
========================================= */

function bindActions() {
  document.addEventListener("click", async event => {
    const target = event.target;

    if (!(target instanceof Element)) return;

    let button;


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
        item => String(item.id) ===
          String(button.dataset.itineraryWa)
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

    button = target.closest(
      "[data-confirm-wa], [data-remind]"
    );

    if (button) {
      const id =
        button.dataset.confirmWa ||
        button.dataset.remind;

      const booking = getBooking(id);

      if (!booking) return;

      const customer = getCustomer(booking);

      const total = Number(booking.total_amount || 0);
      const paid = Number(booking.amount_paid || 0);
      const balance = Math.max(0, total - paid);

      const reminder =
        button.dataset.remind !== undefined;

      const text = reminder
        ? `Hello ${customer.name || ""}, this is a friendly payment reminder from Himalayan Odyssey Expedition. Your ${booking.destination || "trip"} booking has a pending balance of ${cash(balance)}. Thank you.`
        : `Hello ${customer.name || ""}, your ${booking.destination || "trip"} booking is confirmed with Himalayan Odyssey Expedition. Travel date: ${booking.start_date || "—"}. Total: ${cash(total)}. Received: ${cash(paid)}. Balance: ${cash(balance)}. Thank you!`;

      openCustomerWhatsApp(customer.phone, text);

      return;
    }


    /* DELETE RECORD */

    button = target.closest("[data-del]");

    if (button) {
      if (!confirm("Delete this record?")) return;

      try {
        const { error } = await db
          .from(button.dataset.del)
          .delete()
          .eq("id", button.dataset.id);

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
        item => String(item.id) ===
          String(button.dataset.confirm)
      );

      if (!lead) return;

      const total = prompt(
        "Total booking amount ₹",
        lead.budget || "0"
      );

      if (total === null) return;

      const paid = prompt(
        "Advance received ₹",
        "0"
      );

      if (paid === null) return;

      try {
        const { error } = await db
          .from("bookings")
          .insert({
            customer_id: lead.customer_id,
            destination: lead.destination,
            start_date: lead.travel_date,
            travellers: lead.travellers,
            total_amount: Number(total) || 0,
            amount_paid: Number(paid) || 0,
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
        item => String(item.id) ===
          String(button.dataset.pay)
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
          Number(booking.amount_paid || 0) +
          Number(amount);

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

    if (
      !SUPABASE_KEY ||
      SUPABASE_KEY.includes("PASTE_YOUR")
    ) {
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

    $("newHotel")?.addEventListener(
      "click",
      openNewHotel
    );


    /* NEW CAB */

    $("newCab")?.addEventListener(
      "click",
      openNewCab
    );


    /* LOGIN */

    $("login")?.addEventListener(
      "click",
      login
    );


    /* LOGOUT */

    $("logout")?.addEventListener(
      "click",
      logout
    );


    /* REFRESH */

    $("refresh")?.addEventListener(
      "click",
      async () => {
        try {
          await load();
          message("Dashboard refreshed.");

        } catch (error) {
          message("Refresh error: " + error.message);
        }
      }
    );


    /* ENTER KEY LOGIN */

    $("password")?.addEventListener(
      "keydown",
      event => {
        if (event.key === "Enter") {
          login();
        }
      }
    );


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
