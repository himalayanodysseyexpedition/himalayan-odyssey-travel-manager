
"use strict";

/* =========================================
   HIMALAYAN ODYSSEY EXPEDITION
   ADMIN DASHBOARD
========================================= */

const SUPABASE_URL = "https://ynkoiuyjevclypumnyes.supabase.co";

// IMPORTANT: Replace this with your existing Supabase publishable key.
const SUPABASE_KEY = "sb_publishable_Y4JRhHCbljrd5catiUimJw_tr10Qvk-";

let db;
let D = {};
let editingItineraryId = null;

const $ = id => document.getElementById(id);

const cash = n =>
  "₹" + (Number(n) || 0).toLocaleString("en-IN");

const esc = s =>
  String(s ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[c]));

function message(text) {
  if ($("msg")) $("msg").textContent = text;
}

function show(id) {
  $(id)?.showModal();
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

    await load();

    message("Dashboard ready.");

  } catch (error) {
    console.error(error);
    message("Dashboard error: " + error.message);

    if ($("app")) $("app").hidden = true;
    if ($("auth")) $("auth").hidden = false;
  }
}

/* =========================================
   DATABASE
========================================= */

async function rows(table) {
  const { data, error } = await db
    .from(table)
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
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
    "itinerary_days"
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
   COMMON FUNCTIONS
========================================= */

function card(title, lines, buttons = "") {
  return `
    <article>
      <div>
        <b>${esc(title)}</b>
        ${lines.map(x => `<p>${x}</p>`).join("")}
      </div>
      <div>${buttons}</div>
    </article>
  `;
}

function del(table, id) {
  return `
    <button class="danger"
      data-del="${table}"
      data-id="${esc(id)}">
      Delete
    </button>
  `;
}

function getBooking(id) {
  return (D.bookings || []).find(
    x => String(x.id) === String(id)
  );
}

function getCustomer(booking) {
  return (D.customers || []).find(
    x => String(x.id) === String(booking?.customer_id)
  ) || {};
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
    "https://wa.me/" + number +
    "?text=" + encodeURIComponent(text),
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

  makePDF("Booking Invoice", `
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
      Balance due: <b>${cash(Math.max(0, total - paid))}</b>
    </div>
    <p>Booking reference: ${esc(booking.id)}</p>
  `);
}

function paymentPDF(id) {
  const transaction = (D.transactions || []).find(
    x => String(x.id) === String(id)
  );

  if (!transaction) return;

  const booking = getBooking(transaction.booking_id);
  const customer = getCustomer(booking);

  makePDF("Payment Receipt", `
    <div class="box">
      Customer: ${esc(customer.name)}<br>
      Destination: ${esc(booking?.destination)}<br>
      Payment date: ${esc(transaction.transaction_date)}<br>
      Payment method: ${esc(transaction.payment_method)}<br>
      Receipt reference: ${esc(transaction.id)}
    </div>
    <h2>Amount received: ${cash(transaction.amount)}</h2>
    <p>${esc(transaction.description || "Booking payment")}</p>
  `);
}

/* =========================================
   DASHBOARD RENDERING
========================================= */

function setText(id, value) {
  if ($(id)) $(id).textContent = value;
}

function setHTML(id, value) {
  if ($(id)) $(id).innerHTML = value;
}

function render() {
  const customers = Object.fromEntries(
    (D.customers || []).map(x => [x.id, x])
  );

  const leads = (D.leads || []).map(x => ({
    ...x,
    c: customers[x.customer_id] || {}
  }));

  const bookings = (D.bookings || []).map(x => ({
    ...x,
    c: customers[x.customer_id] || {}
  }));

  const transactions = D.transactions || [];

  const income = transactions
    .filter(x => x.transaction_type === "Payment")
    .reduce((s, x) => s + Number(x.amount || 0), 0);

  const expenses = transactions
    .filter(x => x.transaction_type === "Expense")
    .reduce((s, x) => s + Number(x.amount || 0), 0);

  const pending = (D.bookings || []).reduce(
    (s, x) => s + Math.max(
      0,
      Number(x.total_amount || 0) -
      Number(x.amount_paid || 0)
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

  /* Packages */

  setHTML("packageList",
    (D.packages || []).map(x =>
      card(x.name, [
        esc(x.destination || ""),
        esc(x.duration || ""),
        cash(x.price_per_person),
        esc(x.itinerary || "")
      ], del("packages", x.id))
    ).join("") || "No packages yet."
  );

  /* Leads */

  setHTML("leadList",
    leads.map(x =>
      card(x.c.name || "Lead", [
        esc(x.c.phone || ""),
        esc(x.destination || ""),
        esc(x.travel_date || ""),
        "Budget " + cash(x.budget)
      ],
      `
        ${x.c.phone
          ? `<button data-wa="${esc(x.c.phone)}">WhatsApp</button>`
          : ""}
        <button data-confirm="${esc(x.id)}">Confirm</button>
        ${del("leads", x.id)}
      `)
    ).join("") || "No leads yet."
  );

  /* Bookings */

  setHTML("bookingList",
    bookings.map(x =>
      card(x.c.name || "Booking", [
        esc(x.destination || ""),
        esc(x.start_date || ""),
        `Total ${cash(x.total_amount)} • Paid ${cash(x.amount_paid)} • Balance ${cash(
          Number(x.total_amount || 0) -
          Number(x.amount_paid || 0)
        )}`
      ],
      `
        ${x.c.phone ? `
          <button data-confirm-wa="${esc(x.id)}">
            Booking WhatsApp
          </button>
          <button data-remind="${esc(x.id)}">
            Payment reminder
          </button>
        ` : ""}
        <button data-invoice="${esc(x.id)}">Invoice PDF</button>
        <button data-pay="${esc(x.id)}">Add payment</button>
        ${del("bookings", x.id)}
      `)
    ).join("") || "No bookings yet."
  );

  /* Recent bookings */

  setHTML("recent",
    bookings.slice(0, 4).map(x =>
      card(x.c.name || "Booking", [
        esc(x.destination || ""),
        cash(x.total_amount)
      ])
    ).join("") || "No bookings yet."
  );

  /* Vendors */

  setHTML("vendorList",
    (D.vendors || []).map(x =>
      card(x.name, [
        esc(x.category || ""),
        esc(x.phone || ""),
        esc(x.location || ""),
        esc(x.details || "")
      ],
      `
        ${x.phone
          ? `<a href="tel:${encodeURIComponent(x.phone)}">Call</a>`
          : ""}
        ${del("vendors", x.id)}
      `)
    ).join("") || "No vendor contacts yet."
  );

  /* Finance */

  setHTML("financeList",
    transactions.map(x =>
      card(x.transaction_type + " • " + cash(x.amount), [
        esc(x.transaction_date || ""),
        esc(x.payment_method || ""),
        esc(x.category || ""),
        esc(x.description || "")
      ],
      `
        ${x.transaction_type === "Payment" && x.booking_id
          ? `<button data-receipt="${esc(x.id)}">Payment receipt PDF</button>`
          : ""}
        ${del("transactions", x.id)}
      `)
    ).join("") || "No transactions yet."
  );

  /* Booking selector */

  setHTML("bookingSelect",
    '<option value="">No linked booking</option>' +
    bookings.map(x =>
      `<option value="${esc(x.id)}">
        ${esc(x.c.name || "Customer")} — ${esc(x.destination || "Trip")}
      </option>`
    ).join("")
  );

  renderItineraries();
}

/* =========================================
   ITINERARIES
========================================= */

function renderItineraries() {
  const el = $("itineraryList");
  if (!el) return;

  el.innerHTML = (D.itineraries || []).map(it => {
    const days = (D.itinerary_days || [])
      .filter(d => String(d.itinerary_id) === String(it.id))
      .sort((a, b) => Number(a.day_number) - Number(b.day_number));

    return card(it.title, [
      `${esc(it.destination || "")} • ${esc(it.duration_days || "—")} days / ${esc(it.duration_nights ?? "—")} nights`,
      `Price: ${esc(it.price || "On request")} • ${it.published ? "Published" : "Draft"}`,
      esc(it.summary || ""),
      `${days.length} day(s) added`
    ],
    `
      <button data-edit-itinerary="${esc(it.id)}">Edit</button>
      <button data-itinerary-wa="${esc(it.id)}">WhatsApp enquiry</button>
      ${del("itineraries", it.id)}
    `);
  }).join("") || "No itineraries yet. Select Add itinerary to create your first one.";
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
      <input class="day-overnight"
        value="${esc(day.overnight_location || "")}"
        placeholder="e.g. Narkanda">
    </label>

    <button type="button" class="danger remove-day">
      Remove this day
    </button>
  `;

  row.querySelector(".remove-day").addEventListener("click", () => {
    row.remove();
    renumberDayLabels();
  });

  wrap.appendChild(row);
  renumberDayLabels();
}

function renumberDayLabels() {
  document.querySelectorAll("#dayEditor .day-entry").forEach((row, i) => {
    row.querySelector(".day-label").textContent = i + 1;
  });
}

function resetItineraryForm() {
  editingItineraryId = null;

  $("itineraryF")?.reset();

  if ($("dayEditor")) {
    $("dayEditor").innerHTML = "";
  }

  setText("itineraryDialogTitle", "Add itinerary");
  setText("itinerarySave", "Save itinerary");

  addDayRow();
}

function openEditItinerary(id) {
  const it = (D.itineraries || []).find(
    x => String(x.id) === String(id)
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

  $("dayEditor").innerHTML = "";

  const days = (D.itinerary_days || [])
    .filter(d => String(d.itinerary_id) === String(it.id))
    .sort((a, b) => Number(a.day_number) - Number(b.day_number));

  days.forEach(addDayRow);

  if (!days.length) addDayRow();

  show("itineraryForm");
}

function bindItineraryForm() {
  if (!$("itineraryF")) return;

  $("addItineraryDay")?.addEventListener("click", () => {
    addDayRow();
  });

  $("itineraryF").addEventListener("submit", async e => {
    e.preventDefault();

    try {
      const { data: userData, error: userError } =
        await db.auth.getUser();

      if (userError || !userData.user) {
        throw new Error(userError?.message || "Please sign in again.");
      }

      const itinerary = {
  owner_id: userData.user.id,
  title: $("itineraryTitle").value.trim(),
        destination: $("itineraryDestination").value.trim() || null,
        duration_days: $("itineraryDays").value
          ? Number($("itineraryDays").value) : null,
        duration_nights: $("itineraryNights").value
          ? Number($("itineraryNights").value) : null,
        price: $("itineraryPrice").value.trim() || null,
        cover_image: $("itineraryCover").value.trim() || null,
        summary: $("itinerarySummary").value.trim() || null,
        published: $("itineraryPublished").checked
      };

      const days = [
        ...document.querySelectorAll("#dayEditor .day-entry")
      ].map(row => ({
        owner_id: userData.user.id,
        day_number: Number(row.querySelector(".day-number").value),
        title: row.querySelector(".day-title").value.trim() || null,
        description: row.querySelector(".day-description").value.trim() || null,
        overnight_location: row.querySelector(".day-overnight").value.trim() || null
      })).filter(d => d.day_number > 0);

      if (!days.length) {
        throw new Error("Please add at least one itinerary day.");
      }

      let id = editingItineraryId;

      if (id) {
        let result = await db.from("itineraries")
          .update(itinerary)
          .eq("id", id);

        if (result.error) throw result.error;

        result = await db.from("itinerary_days")
          .delete()
          .eq("itinerary_id", id);

        if (result.error) throw result.error;

      } else {
        const result = await db.from("itineraries")
          .insert(itinerary)
          .select("id")
          .single();

        if (result.error) throw result.error;

        id = result.data.id;
      }

      const result = await db.from("itinerary_days").insert(
        days.map(d => ({
          ...d,
          itinerary_id: id
        }))
      );

      if (result.error) throw result.error;

      $("itineraryForm").close();
      resetItineraryForm();

      await load();

      alert("Itinerary saved successfully.");

    } catch (error) {
      alert("Itinerary save error: " + error.message);
    }
  });
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
        navButton.classList.toggle("active", navButton === button);
      });
    });
  });
}

/* =========================================
   FORMS
========================================= */

function bindForm(id, table, transform) {
  const form = $(id);
  if (!form) return;

  form.addEventListener("submit", async e => {
    e.preventDefault();

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
  bindForm("packageF", "packages", o => ({
    ...o,
    price_per_person: Number(o.price_per_person) || 0
  }));

  bindForm("vendorF", "vendors", o => ({
    ...o,
    rates: o.rates ? Number(o.rates) : null
  }));

  bindForm("financeF", "transactions", o => ({
    ...o,
    amount: Number(o.amount),
    booking_id: o.booking_id || null
  }));

  const leadForm = $("leadF");

  if (leadForm) {
    leadForm.addEventListener("submit", async e => {
      e.preventDefault();

      const form = e.target;
      const o = Object.fromEntries(new FormData(form));

      try {
        const { data: customer, error } = await db
          .from("customers")
          .insert({
            name: o.name,
            phone: o.phone || null,
            email: o.email || null
          })
          .select("id")
          .single();

        if (error) throw error;

        const { error: leadError } = await db
          .from("leads")
          .insert({
            customer_id: customer.id,
            destination: o.destination || null,
            travel_date: o.travel_date || null,
            travellers: Number(o.travellers) || 1,
            budget: Number(o.budget) || 0,
            notes: o.notes || null
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
}

/* =========================================
   DASHBOARD ACTIONS
========================================= */

function bindActions() {
  document.addEventListener("click", async e => {
    const target = e.target;
    if (!(target instanceof Element)) return;

    let button = target.closest("[data-invoice]");

    if (button) {
      bookingPDF(button.dataset.invoice);
      return;
    }

    button = target.closest("[data-receipt]");

    if (button) {
      paymentPDF(button.dataset.receipt);
      return;
    }

    button = target.closest("[data-edit-itinerary]");

    if (button) {
      openEditItinerary(button.dataset.editItinerary);
      return;
    }

    button = target.closest("[data-itinerary-wa]");

    if (button) {
      const it = (D.itineraries || []).find(
        x => String(x.id) === button.dataset.itineraryWa
      );

      if (it) {
        openCustomerWhatsApp(
          "9816929669",
          `Hello Himalayan Odyssey Expedition, I would like to enquire about the ${it.title} itinerary. Please share details and availability.`
        );
      }
      return;
    }

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

    button = target.closest("[data-wa]");

    if (button) {
      openCustomerWhatsApp(
        button.dataset.wa,
        "Hello, I would like to discuss my travel enquiry."
      );
      return;
    }

    button = target.closest("[data-confirm]");

    if (button) {
      const lead = (D.leads || []).find(
        x => String(x.id) === button.dataset.confirm
      );

      if (!lead) return;

      const total = prompt(
        "Total booking amount ₹",
        lead.budget || "0"
      );

      if (total === null) return;

      const paid = prompt("Advance received ₹", "0");

      if (paid === null) return;

      try {
        const { error } = await db.from("bookings").insert({
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

      } catch (error) {
        alert("Booking error: " + error.message);
      }

      return;
    }

    button = target.closest("[data-pay]");

    if (button) {
      const booking = (D.bookings || []).find(
        x => String(x.id) === button.dataset.pay
      );

      if (!booking) return;

      const amount = prompt("Payment received ₹");

      if (!amount || Number(amount) <= 0) return;

      try {
        const { error } = await db.from("transactions").insert({
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
    if (
      !window.supabase ||
      !window.supabase.createClient
    ) {
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
     $("newItinerary")?.addEventListener("click", () => {
  resetItineraryForm();
  show("itineraryForm");
});

    $("login")?.addEventListener("click", login);
    $("logout")?.addEventListener("click", logout);

    $("refresh")?.addEventListener("click", async () => {
      try {
        await load();
        message("Dashboard refreshed.");
      } catch (error) {
        message("Refresh error: " + error.message);
      }
    });

    $("password")?.addEventListener("keydown", e => {
      if (e.key === "Enter") login();
    });

    message("Ready. Enter your admin login details.");

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

/* THIS MUST BE THE LAST LINE OF THE FILE */
initialize();
