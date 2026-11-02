
"use strict";

const SUPABASE_URL = "https://ynkoiuyjevclypumnyes.supabase.co";
const SUPABASE_KEY = "sb_publishable_Y4JRhHCbljrd5catiUimJw_tr10Qvk-";

let db;
let D = {};

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
  const el = $(id);
  if (el) el.showModal();
}

function bindPageButtons() {
  document.querySelectorAll("[data-open]").forEach(b => {
    b.addEventListener("click", () => show(b.dataset.open));
  });

  document.querySelectorAll("[data-close]").forEach(b => {
    b.addEventListener("click", () => {
      b.closest("dialog")?.close();
    });
  });

  document.querySelectorAll("nav button").forEach(b => {
    b.addEventListener("click", () => {
      document.querySelectorAll(".panel").forEach(p => {
        p.classList.toggle("active", p.id === b.dataset.tab);
      });
    });
  });
}

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
    "transactions"
  ];

  for (const table of tables) {
    D[table] = await rows(table);
  }

  render();
}

function card(title, lines, buttons = "") {
  return `
    <article>
      <div>
        <b>${esc(title)}</b>
        ${lines.map(x => `<p>${x}</p>`).join("")}
      </div>
      <div>${buttons}</div>
    </article>`;
}

function del(table, id) {
  return `<button class="danger" data-del="${table}" data-id="${esc(id)}">Delete</button>`;
}

function render() {
  const customers = Object.fromEntries(
    D.customers.map(x => [x.id, x])
  );

  const leads = D.leads.map(x => ({
    ...x,
    c: customers[x.customer_id] || {}
  }));

  const bookings = D.bookings.map(x => ({
    ...x,
    c: customers[x.customer_id] || {}
  }));

  const income = D.transactions
    .filter(x => x.transaction_type === "Payment")
    .reduce((s, x) => s + Number(x.amount || 0), 0);

  const expenses = D.transactions
    .filter(x => x.transaction_type === "Expense")
    .reduce((s, x) => s + Number(x.amount || 0), 0);

  const pending = D.bookings.reduce(
    (s, x) => s + Math.max(
      0,
      Number(x.total_amount || 0) - Number(x.amount_paid || 0)
    ),
    0
  );

  $("nLeads").textContent = D.leads.length;
  $("nBookings").textContent = D.bookings.length;
  $("nPaid").textContent = cash(income);
  $("nPending").textContent = cash(pending);
  $("received").textContent = cash(income);
  $("expenses").textContent = cash(expenses);
  $("net").textContent = cash(income - expenses);

  $("packageList").innerHTML =
    D.packages.map(x => card(x.name, [
      esc(x.destination || ""),
      esc(x.duration || ""),
      cash(x.price_per_person),
      esc(x.itinerary || "")
    ], del("packages", x.id))).join("") || "No packages yet.";

  $("leadList").innerHTML =
    leads.map(x => card(x.c.name || "Lead", [
      esc(x.c.phone || ""),
      esc(x.destination || ""),
      esc(x.travel_date || ""),
      "Budget " + cash(x.budget)
    ],
      `${x.c.phone ? `<button data-wa="${esc(x.c.phone)}">WhatsApp</button>` : ""}
       <button data-confirm="${esc(x.id)}">Confirm</button>
       ${del("leads", x.id)}`
    )).join("") || "No leads yet.";

  $("bookingList").innerHTML =
    bookings.map(x => card(x.c.name || "Booking", [
      esc(x.destination || ""),
      esc(x.start_date || ""),
      `Total ${cash(x.total_amount)} • Paid ${cash(x.amount_paid)} • Balance ${cash(Number(x.total_amount || 0) - Number(x.amount_paid || 0))}`
    ],
      `${x.c.phone ? `<button data-wa="${esc(x.c.phone)}">WhatsApp</button>` : ""}
       <button data-pay="${esc(x.id)}">Add payment</button>
       ${del("bookings", x.id)}`
    )).join("") || "No bookings yet.";

  $("recent").innerHTML =
    bookings.slice(0, 4).map(x =>
      card(x.c.name || "Booking", [
        esc(x.destination || ""),
        cash(x.total_amount)
      ])
    ).join("") || "No bookings yet.";

  $("vendorList").innerHTML =
    D.vendors.map(x => card(x.name, [
      esc(x.category || ""),
      esc(x.phone || ""),
      esc(x.location || ""),
      esc(x.details || "")
    ],
      `${x.phone ? `<a href="tel:${encodeURIComponent(x.phone)}">Call</a>` : ""}
       ${del("vendors", x.id)}`
    )).join("") || "No vendor contacts yet.";

  $("financeList").innerHTML =
    D.transactions.map(x => card(
      x.transaction_type + " • " + cash(x.amount),
      [
        esc(x.transaction_date || ""),
        esc(x.payment_method || ""),
        esc(x.category || ""),
        esc(x.description || "")
      ],
      del("transactions", x.id)
    )).join("") || "No transactions yet.";

  $("bookingSelect").innerHTML =
    '<option value="">No linked booking</option>' +
    bookings.map(x =>
      `<option value="${esc(x.id)}">${esc(x.c.name || "Customer")} — ${esc(x.destination || "Trip")}</option>`
    ).join("");
}

async function save(table, object) {
  const { error } = await db.from(table).insert(object);
  if (error) throw error;
  await load();
}

function bindForm(id, table, transform) {
  $(id).addEventListener("submit", async e => {
    e.preventDefault();

    const form = e.target;
    const object = Object.fromEntries(new FormData(form));

    Object.keys(object).forEach(k => {
      if (object[k] === "") object[k] = null;
    });

    try {
      await save(table, transform ? transform(object) : object);
      form.closest("dialog").close();
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

  $("leadF").addEventListener("submit", async e => {
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

      form.closest("dialog").close();
      form.reset();
      await load();

    } catch (error) {
      alert("Error: " + error.message);
    }
  });
}

function bindActions() {
  document.addEventListener("click", async e => {
    let button = e.target.closest("[data-del]");

    if (button) {
      if (confirm("Delete this record?")) {
        const { error } = await db
          .from(button.dataset.del)
          .delete()
          .eq("id", button.dataset.id);

        if (error) alert(error.message);
        else await load();
      }
      return;
    }

    button = e.target.closest("[data-wa]");

    if (button) {
      const phone = String(button.dataset.wa || "").replace(/\D/g, "");
const whatsappNumber = phone.startsWith("91")
  ? phone
  : "91" + phone;

if (whatsappNumber.length !== 12) {
  alert("Please check the customer's mobile number.");
  return;
}

window.open("https://wa.me/" + whatsappNumber, "_blank");
      return;
    }

    button = e.target.closest("[data-confirm]");

    if (button) {
      const lead = D.leads.find(x => x.id == button.dataset.confirm);
      if (!lead) return;

      const total = prompt("Total booking amount ₹", lead.budget || "0");
      if (total === null) return;

      const paid = prompt("Advance received ₹", "0");
      if (paid === null) return;

      const { error } = await db.from("bookings").insert({
        customer_id: lead.customer_id,
        destination: lead.destination,
        start_date: lead.travel_date,
        travellers: lead.travellers,
        total_amount: Number(total) || 0,
        amount_paid: Number(paid) || 0,
        notes: lead.notes
      });

      if (error) {
        alert(error.message);
        return;
      }

      const { error: deleteError } = await db
        .from("leads")
        .delete()
        .eq("id", lead.id);

      if (deleteError) alert(deleteError.message);
      await load();
      return;
    }

    button = e.target.closest("[data-pay]");

    if (button) {
      const booking = D.bookings.find(
        x => x.id == button.dataset.pay
      );

      if (!booking) return;

      const amount = prompt("Payment received ₹");
      if (!amount || Number(amount) <= 0) return;

      const { error } = await db.from("transactions").insert({
        booking_id: booking.id,
        transaction_type: "Payment",
        amount: Number(amount),
        description: "Booking payment"
      });

      if (error) {
        alert(error.message);
        return;
      }

      const { error: updateError } = await db
        .from("bookings")
        .update({
          amount_paid:
            Number(booking.amount_paid || 0) + Number(amount)
        })
        .eq("id", booking.id);

      if (updateError) alert(updateError.message);
      await load();
    }
  });
}

async function start() {
  $("auth").hidden = true;
  $("app").hidden = false;
  $("logout").hidden = false;

  try {
    await load();
    message("");
  } catch (error) {
    alert("Database connection error: " + error.message);
    console.error(error);
  }
}

async function login() {
  const button = $("login");

  button.disabled = true;
  message("Connecting...");

  try {
    if (!db) throw new Error("Supabase is not loaded. Refresh the page and try again.");

    const email = $("email").value.trim();
    const password = $("password").value;

    if (!email || !password) {
      throw new Error("Please enter your email and password.");
    }

    const { error } = await db.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    message("Login successful. Loading dashboard...");
    await start();

  } catch (error) {
    message(error.message || "Login failed. Please try again.");
    console.error("Login error:", error);
  } finally {
    button.disabled = false;
  }
}

async function logout() {
  try {
    await db.auth.signOut();
    $("auth").hidden = false;
    $("app").hidden = true;
    $("logout").hidden = true;
    message("You have signed out.");
  } catch (error) {
    alert(error.message);
  }
}

async function initialize() {
  try {
    if (!window.supabase || !window.supabase.createClient) {
      throw new Error("Supabase library did not load. Check your internet connection and refresh.");
    }

    db = window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_KEY
    );

    bindPageButtons();
    bindForms();
    bindActions();

    $("login").addEventListener("click", login);
    $("logout").addEventListener("click", logout);
    $("refresh").addEventListener("click", async () => {
      try {
        await load();
      } catch (error) {
        alert(error.message);
      }
    });

    message("Ready. Enter your admin login details.");

    const { data, error } = await db.auth.getSession();

    if (error) throw error;

    if (data.session) {
      await start();
    }

  } catch (error) {
    message("App startup error: " + error.message);
    console.error("Startup error:", error);
  }
}

initialize();
