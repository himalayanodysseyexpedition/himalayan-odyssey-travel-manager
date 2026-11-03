"use strict";

const SUPABASE_URL = "https://ynkoiuyjevclypumnyes.supabase.co";
const SUPABASE_KEY = "PASTE_YOUR_EXISTING_SUPABASE_PUBLISHABLE_KEY_HERE";

let db, D = {}, editingItineraryId = null;

const $ = id => document.getElementById(id);
const cash = n => "₹" + (Number(n) || 0).toLocaleString("en-IN");

const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
}[c]));

function message(t) {
  if ($("msg")) $("msg").textContent = t;
}

function show(id) {
  $(id)?.showModal();
}

function bindPageButtons() {
  document.querySelectorAll("[data-open]").forEach(b =>
    b.addEventListener("click", () => show(b.dataset.open))
  );

  document.querySelectorAll("[data-close]").forEach(b =>
    b.addEventListener("click", () => b.closest("dialog")?.close())
  );

  document.querySelectorAll("nav button").forEach(b =>
    b.addEventListener("click", () => {
      document.querySelectorAll(".panel").forEach(p =>
        p.classList.toggle("active", p.id === b.dataset.tab)
      );
      document.querySelectorAll("nav button").forEach(n =>
        n.classList.toggle("active", n === b)
      );
    })
  );
}

async function rows(table) {
  const { data, error } = await db.from(table)
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

async function load() {
  for (const t of [
    "packages", "customers", "leads", "bookings",
    "vendors", "transactions", "itineraries", "itinerary_days"
  ]) {
    D[t] = await rows(t);
  }
  render();
}

function card(title, lines, buttons = "") {
  return `<article>
    <div><b>${esc(title)}</b>${lines.map(x => `<p>${x}</p>`).join("")}</div>
    <div>${buttons}</div>
  </article>`;
}

function del(table, id) {
  return `<button class="danger" data-del="${table}" data-id="${esc(id)}">Delete</button>`;
}

function getBooking(id) {
  return D.bookings.find(x => String(x.id) === String(id));
}

function getCustomer(b) {
  return D.customers.find(x => x.id === b?.customer_id) || {};
}

function openCustomerWhatsApp(phone, text) {
  let n = String(phone || "").replace(/\D/g, "");
  if (n.startsWith("0")) n = n.slice(1);
  if (n.length === 10) n = "91" + n;

  if (n.length < 11 || n.length > 13) {
    alert("Please check the customer's phone number.");
    return;
  }

  window.open(
    "https://wa.me/" + n + "?text=" + encodeURIComponent(text),
    "_blank"
  );
}

function makePDF(title, content) {
  const w = window.open("", "_blank");

  if (!w) {
    alert("Allow pop-ups for this website and try again.");
    return;
  }

  w.document.write(`
    <html>
    <head>
      <title>${esc(title)}</title>
      <style>
        body{font-family:Arial;margin:30px;color:#173c36}
        h1{font-size:22px}
        .box{border:1px solid #ccc;padding:15px;margin:20px 0}
        button{padding:12px;background:#173c36;color:white;border:0}
        @media print{button{display:none}}
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

  w.document.close();
}

function bookingPDF(id) {
  const b = getBooking(id);
  if (!b) return;

  const c = getCustomer(b);
  const total = Number(b.total_amount || 0);
  const paid = Number(b.amount_paid || 0);

  makePDF("Booking Invoice", `
    <div class="box">
      Customer: ${esc(c.name)}<br>
      Phone: ${esc(c.phone)}<br>
      Destination: ${esc(b.destination)}<br>
      Travel date: ${esc(b.start_date)}<br>
      Travellers: ${esc(b.travellers)}
    </div>
    <div class="box">
      Total amount: ${cash(total)}<br>
      Amount received: ${cash(paid)}<br>
      Balance due: <b>${cash(Math.max(0, total - paid))}</b>
    </div>
    <p>Booking reference: ${esc(b.id)}</p>
  `);
}

function paymentPDF(id) {
  const t = D.transactions.find(x => String(x.id) === String(id));
  if (!t) return;

  const b = getBooking(t.booking_id);
  const c = getCustomer(b);

  makePDF("Payment Receipt", `
    <div class="box">
      Customer: ${esc(c.name)}<br>
      Destination: ${esc(b?.destination)}<br>
      Payment date: ${esc(t.transaction_date)}<br>
      Payment method: ${esc(t.payment_method)}<br>
      Receipt reference: ${esc(t.id)}
    </div>
    <h2>Amount received: ${cash(t.amount)}</h2>
    <p>${esc(t.description || "Booking payment")}</p>
  `);
}

function render() {
  const customers = Object.fromEntries(D.customers.map(x => [x.id, x]));

  const leads = D.leads.map(x => ({
    ...x, c: customers[x.customer_id] || {}
  }));

  const bookings = D.bookings.map(x => ({
    ...x, c: customers[x.customer_id] || {}
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

  $("packageList").innerHTML = D.packages.map(x =>
    card(x.name, [
      esc(x.destination || ""),
      esc(x.duration || ""),
      cash(x.price_per_person),
      esc(x.itinerary || "")
    ], del("packages", x.id))
  ).join("") || "No packages yet.";

  $("leadList").innerHTML = leads.map(x =>
    card(x.c.name || "Lead", [
      esc(x.c.phone || ""),
      esc(x.destination || ""),
      esc(x.travel_date || ""),
      "Budget " + cash(x.budget)
    ],
      `${x.c.phone ? `<button data-wa="${esc(x.c.phone)}">WhatsApp</button>` : ""}
       <button data-confirm="${esc(x.id)}">Confirm</button>
       ${del("leads", x.id)}`
    )
  ).join("") || "No leads yet.";

  $("bookingList").innerHTML = bookings.map(x =>
    card(x.c.name || "Booking", [
      esc(x.destination || ""),
      esc(x.start_date || ""),
      `Total ${cash(x.total_amount)} • Paid ${cash(x.amount_paid)} • Balance ${cash(Number(x.total_amount || 0) - Number(x.amount_paid || 0))}`
    ],
      `${x.c.phone
        ? `<button data-confirm-wa="${esc(x.id)}">Booking WhatsApp</button>
           <button data-remind="${esc(x.id)}">Payment reminder</button>`
        : ""}
       <button data-invoice="${esc(x.id)}">Invoice PDF</button>
       <button data-pay="${esc(x.id)}">Add payment</button>
       ${del("bookings", x.id)}`
    )
  ).join("") || "No bookings yet.";

  $("recent").innerHTML = bookings.slice(0, 4).map(x =>
    card(x.c.name || "Booking", [
      esc(x.destination || ""),
      cash(x.total_amount)
    ])
  ).join("") || "No bookings yet.";

  $("vendorList").innerHTML = D.vendors.map(x =>
    card(x.name, [
      esc(x.category || ""),
      esc(x.phone || ""),
      esc(x.location || ""),
      esc(x.details || "")
    ],
      `${x.phone ? `<a href="tel:${encodeURIComponent(x.phone)}">Call</a>` : ""}
       ${del("vendors", x.id)}`
    )
  ).join("") || "No vendor contacts yet.";

  $("financeList").innerHTML = D.transactions.map(x =>
    card(x.transaction_type + " • " + cash(x.amount), [
      esc(x.transaction_date || ""),
      esc(x.payment_method || ""),
      esc(x.category || ""),
      esc(x.description || "")
    ],
      `${x.transaction_type === "Payment" && x.booking_id
        ? `<button data-receipt="${esc(x.id)}">Payment receipt PDF</button>`
        : ""}
       ${del("transactions", x.id)}`
    )
  ).join("") || "No transactions yet.";

  $("bookingSelect").innerHTML =
    '<option value="">No linked booking</option>' +
    bookings.map(x =>
      `<option value="${esc(x.id)}">${esc(x.c.name || "Customer")} — ${esc(x.destination || "Trip")}</option>`
    ).join("");

  renderItineraries();
}

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
      `<button data-edit-itinerary="${esc(it.id)}">Edit</button>
       <button data-itinerary-wa="${esc(it.id)}">WhatsApp enquiry</button>
       ${del("itineraries", it.id)}`
    );
  }).join("") || "No itineraries yet. Select Add itinerary to create your first one.";
}

async function save(table, obj) {
  const { error } = await db.from(table).insert(obj);
  if (error) throw error;
  await load();
}

function bindForm(id, table, transform) {
  $(id).addEventListener("submit", async e => {
    e.preventDefault();

    const form = e.target;
    const obj = Object.fromEntries(new FormData(form));

    Object.keys(obj).forEach(k => {
      if (obj[k] === "") obj[k] = null;
    });

    try {
      await save(table, transform ? transform(obj) : obj);
      form.closest("dialog").close();
      form.reset();
    } catch (err) {
      alert("Error: " + err.message);
    }
  });
}

function addDayRow(day = {}) {
  const wrap = $("dayEditor");
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
  document.querySelectorAll("#dayEditor .day-entry").forEach((r, i) => {
    r.querySelector(".day-label").textContent = i + 1;
  });
}

function resetItineraryForm() {
  editingItineraryId = null;
  $("itineraryF").reset();
  $("dayEditor").innerHTML = "";
  $("itineraryDialogTitle").textContent = "Add itinerary";
  $("itinerarySave").textContent = "Save itinerary";
  addDayRow();
}

function openEditItinerary(id) {
  const it = D.itineraries.find(x => String(x.id) === String(id));
  if (!it) return;

  editingItineraryId = it.id;

  $("itineraryDialogTitle").textContent = "Edit itinerary";
  $("itinerarySave").textContent = "Update itinerary";

  $("itineraryTitle").value = it.title || "";
  $("itineraryDestination").value = it.destination || "";
  $("itineraryDays").value = it.duration_days || "";
  $("itineraryNights").value = it.duration_nights ?? "";
  $("itineraryPrice").value = it.price || "";
  $("itineraryCover").value = it.cover_image || "";
  $("itinerarySummary").value = it.summary || "";
  $("itineraryPublished").checked = !!it.published;

  $("dayEditor").innerHTML = "";

  const days = D.itinerary_days
    .filter(d => String(d.itinerary_id) === String(it.id))
    .sort((a, b) => Number(a.day_number) - Number(b.day_number));

  days.forEach(addDayRow);

  if (!days.length) addDayRow();

  show("itineraryForm");
}

function bindItineraryForm() {
  $("addItineraryDay").addEventListener("click", () => addDayRow());

  $("itineraryF").addEventListener("submit", async e => {
    e.preventDefault();

    const { data: userData, error: userError } = await db.auth.getUser();

    if (userError || !userData.user) {
      alert(userError?.message || "Please sign in again.");
      return;
    }

    const itinerary = {
      title: $("itineraryTitle").value.trim(),
      destination: $("itineraryDestination").value.trim() || null,
      duration_days: $("itineraryDays").value ? Number($("itineraryDays").value) : null,
      duration_nights: $("itineraryNights").value ? Number($("itineraryNights").value) : null,
      price: $("itineraryPrice").value.trim() || null,
      cover_image: $("itineraryCover").value.trim() || null,
      summary: $("itinerarySummary").value.trim() || null,
      published: $("itineraryPublished").checked
    };

    const days = [...document.querySelectorAll("#dayEditor .day-entry")]
      .map(r => ({
        owner_id: userData.user.id,
        day_number: Number(r.querySelector(".day-number").value),
        title: r.querySelector(".day-title").value.trim() || null,
        description: r.querySelector(".day-description").value.trim() || null,
        overnight_location: r.querySelector(".day-overnight").value.trim() || null
      }))
      .filter(d => d.day_number > 0);

    if (!days.length) {
      alert("Please add at least one itinerary day.");
      return;
    }

    try {
      let id = editingItineraryId;

      if (id) {
        let result = await db.from("itineraries")
          .update(itinerary).eq("id", id);

        if (result.error) throw result.error;

        result = await db.from("itinerary_days")
          .delete().eq("itinerary_id", id);

        if (result.error) throw result.error;
      } else {
        const result = await db.from("itineraries")
          .insert(itinerary).select("id").single();

        if (result.error) throw result.error;
        id = result.data.id;
      }

      const result = await db.from("itinerary_days").insert(
        days.map(d => ({ ...d, itinerary_id: id }))
      );

      if (result.error) throw result.error;

      $("itineraryForm").close();
      resetItineraryForm();
      await load();
      alert("Itinerary saved successfully.");

    } catch (err) {
      alert("Itinerary save error: " + err.message);
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
      const { data: customer, error } = await db.from("customers")
        .insert({
          name: o.name,
          phone: o.phone || null,
          email: o.email || null
        }).select("id").single();

      if (error) throw error;

      const { error: leadError } = await db.from("leads").insert({
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

    } catch (err) {
      alert("Error: " + err.message);
    }
  });

  bindItineraryForm();
}

function bindActions() {
  document.addEventListener("click", async e => {
    let b = e.target.closest("[data-invoice]");
    if (b) {
      bookingPDF(b.dataset.invoice);
      return;
    }

    b = e.target.closest("[data-receipt]");
    if (b) {
      paymentPDF(b.dataset.receipt);
      return;
    }

    b = e.target.closest("[data-edit-itinerary]");
    if (b) {
      openEditItinerary(b.dataset.editItinerary);
      return;
    }

    b = e.target.closest("[data-itinerary-wa]");
    if (b) {
      const it = D.itineraries.find(x => String(x.id) === b.dataset.itineraryWa);

      if (it) {
        openCustomerWhatsApp(
          "9816929669",
          `Hello Himalayan Odyssey Expedition, I would like to enquire about the ${it.title} itinerary. Please share details and availability.`
        );
      }
      return;
    }

    b = e.target.closest("[data-confirm-wa], [data-remind]");
    if (b) {
      const id = b.dataset.confirmWa || b.dataset.remind;
      const booking = getBooking(id);
      const c = getCustomer(booking);

      if (!booking) return;

      const total = Number(booking.total_amount || 0);
      const paid = Number(booking.amount_paid || 0);
      const balance = Math.max(0, total - paid);
      const reminder = b.dataset.remind !== undefined;

      const text = reminder
        ? `Hello ${c.name || ""}, this is a friendly payment reminder from Himalayan Odyssey Expedition. Your ${booking.destination || "trip"} booking has a pending balance of ${cash(balance)}. Thank you.`
        : `Hello ${c.name || ""}, your ${booking.destination || "trip"} booking is confirmed with Himalayan Odyssey Expedition. Travel date: ${booking.start_date || "—"}. Total: ${cash(total)}. Received: ${cash(paid)}. Balance: ${cash(balance)}. Thank you!`;

      openCustomerWhatsApp(c.phone, text);
      return;
    }

    b = e.target.closest("[data-del]");
    if (b) {
      if (confirm("Delete this record?")) {
        const { error } = await db.from(b.dataset.del)
          .delete().eq("id", b.dataset.id);

        if (error) alert(error.message);
        else await load();
      }
      return;
    }

    b = e.target.closest("[data-wa]");
    if (b) {
      let phone = String(b.dataset.wa || "").replace(/\D/g, "");
      phone = phone.startsWith("91") ? phone : "91" + phone;

      if (phone.length !== 12) {
        alert("Please check the customer's mobile number.");
        return;
      }

      window.open("https://wa.me/" + phone, "_blank");
      return;
    }

    b = e.target.closest("[data-confirm]");
    if (b) {
      const lead = D.leads.find(x => x.id == b.dataset.confirm);
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

      const { error: deleteError } = await db.from("leads")
        .delete().eq("id", lead.id);

      if (deleteError) alert(deleteError.message);

      await load();
      return;
    }

    b = e.target.closest("[data-pay]");
    if (b) {
      const booking = D.bookings.find(x => x.id == b.dataset.pay);
      if (!booking) return;

      const amount = prompt("Payment received ₹");
      if (!amount || Number(amount) <= 0) return;

      const { error } = await db.from("transactions").insert({
        booking_id: booking.id,
        transaction_type: "Payment",
        amount: Number(amount),
        description: "Booking payment"
      });
initialize();
      if (error) 
