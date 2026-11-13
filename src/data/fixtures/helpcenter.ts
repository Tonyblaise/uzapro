/**
 * Help Center content (feature 007). Written for UzaPro, describing how this demo works; the
 * layout follows the user's reference screenshots (spec › Design deviations). Read-only.
 * Button labels and messages are the app's own (features 001–005).
 */
import type { HelpArticle, HelpCategory } from "../types";

export const HELP_CATEGORIES: readonly HelpCategory[] = [
  { id: "getting-started", name: "Getting started", parent: null, order: 1 },
  { id: "selling", name: "Selling", parent: null, order: 2 },
  { id: "invoices-and-quotations", name: "Invoices and quotations", parent: "selling", order: 1 },
  { id: "stock-and-products", name: "Stock and products", parent: null, order: 3 },
  { id: "buying", name: "Buying", parent: null, order: 4 },
  { id: "money", name: "Money", parent: null, order: 5 },
  { id: "expenses", name: "Expenses", parent: "money", order: 1 },
  { id: "settings", name: "Settings", parent: null, order: 6 },
];

const NEED_HELP = {
  heading: "Need help?",
  level: 2 as const,
  blocks: [
    { kind: "p" as const, text: "Search the Help Center for another topic, or ask the business owner to check your role if a screen mentioned here is missing from your menu." },
  ],
};

export const HELP_ARTICLES: readonly HelpArticle[] = [
  {
    id: "how-to-give-a-refund",
    title: "How to give a refund",
    category: "selling",
    updated: "2026-09-08",
    intro: [
      "A refund in UzaPro is a **credit note**. You raise it from the original sale, choose what is coming back, and decide how the customer gets their money. Nothing changes until the credit note is approved.",
      "**Who can do this:** anyone who can open Sales › All sales. Approving needs access to Refunds (credit notes).",
    ],
    sections: [
      {
        heading: "Raise the credit note",
        level: 2,
        blocks: [
          {
            kind: "ol",
            items: [
              "Go to Sales › All sales and select the sale.",
              "In the sale, choose **Credit note**.",
              "Under What is being credited, pick **Full** to credit everything remaining, or **Partial** to choose lines and quantities.",
              "Pick a **Reason**, for example Returned goods or Damaged goods.",
              "Choose how the money goes back (see the next section).",
              "Tick **I confirm these items and amounts.** and choose **Raise credit note**.",
            ],
          },
          { kind: "p", text: "You will see a message such as **CRN-0008 raised for KES 2,701.64. It is waiting for approval.**" },
        ],
      },
      {
        heading: "Choose how the money goes back",
        level: 2,
        blocks: [
          {
            kind: "table",
            head: ["Option", "What happens"],
            rows: [
              ["Refund in cash", "Paid out from the cash drawer when the credit note is approved."],
              ["Keep as customer credit", "Held on the customer's account for their next purchase."],
              ["Back to the original method", "Refunded the way they paid, for example M-Pesa or card."],
            ],
          },
          { kind: "note", tone: "info", text: "A cash or original-method refund is taken out of the matching account and appears in Accounts › Transactions as **Refund to {customer}**." },
        ],
      },
      {
        heading: "Approve the credit note",
        level: 2,
        blocks: [
          {
            kind: "ol",
            items: [
              "Go to Sales › Refunds (credit notes).",
              "Select the credit note that shows **Waiting approval**.",
              "Choose **Approve**. The message reads **CRN-0008 approved.**",
            ],
          },
          { kind: "p", text: "If the items were returned to stock, they go back into the store they were sold from when you approve." },
          {
            kind: "links",
            screens: [
              { label: "Open Sales › Refunds (credit notes)", module: "sales", tab: "refunds-credit-notes" },
              { label: "Open Accounts › Transactions", module: "fin", tab: "transactions" },
            ],
          },
        ],
      },
      {
        heading: "Frequently asked questions",
        level: 2,
        blocks: [
          { kind: "faq", q: "Can I refund only part of a sale?", a: ["Yes. Choose **Partial** and set the credit quantity on each line. You cannot credit more than is still open on the sale."] },
          { kind: "faq", q: "What if the customer never paid?", a: ["The credit note reduces what the customer owes instead of paying money out."] },
          { kind: "faq", q: "Where do I see the customer credit?", a: ["In Receivables › Customer credits, once the credit note is approved."] },
        ],
      },
      NEED_HELP,
    ],
    related: ["reconciling-a-bank-feed", "recording-a-sale"],
  },
  {
    id: "reconciling-a-bank-feed",
    title: "Reconciling a bank feed",
    category: "money",
    updated: "2026-10-27",
    intro: [
      "Reconciling means checking that what UzaPro recorded matches your bank or M-Pesa statement. UzaPro does not connect to your bank directly, so you compare the statement with **Accounts › Transactions**.",
    ],
    sections: [
      {
        heading: "Filter the transactions",
        level: 2,
        blocks: [
          {
            kind: "ol",
            items: [
              "Go to Accounts › Transactions.",
              "Pick the account in the **Account** filter, for example M-Pesa Till.",
              "Set the **From** and **To** dates to match your statement.",
            ],
          },
          { kind: "p", text: "Money in shows as a positive amount and money out as a negative amount, newest first." },
          { kind: "links", screens: [{ label: "Open Accounts › Transactions", module: "fin", tab: "transactions" }] },
        ],
      },
      {
        heading: "Match each line",
        level: 2,
        blocks: [
          {
            kind: "ul",
            items: [
              "Tick off each statement line that has a matching transaction with the same amount and date.",
              "Select a transaction to open its record and check the reference, fee and notes.",
              "Bank and transfer fees appear as separate lines, so match them separately.",
            ],
          },
          { kind: "note", tone: "warning", text: "If a statement line has no match, record it before you finish: use a deposit for money in, or a withdrawal or expense for money out." },
        ],
      },
      {
        heading: "Common differences",
        level: 3,
        blocks: [
          {
            kind: "table",
            head: ["On the statement", "What to record in UzaPro"],
            rows: [
              ["Customer paid by M-Pesa", "Receivables › Record payment, paid into M-Pesa Till"],
              ["Bank charge", "A withdrawal with a fee, or an expense"],
              ["Money moved between accounts", "Accounts › Transfers › New transfer"],
            ],
          },
        ],
      },
      {
        heading: "Frequently asked questions",
        level: 2,
        blocks: [
          { kind: "faq", q: "Why does the balance not match my statement?", a: ["Look for unrecorded fees, payments recorded in the wrong account, or a transfer recorded only on one side."] },
          { kind: "faq", q: "Can I undo a deposit or withdrawal?", a: ["Open it and choose **Reverse**. UzaPro adds a reversal line and updates the balance."] },
        ],
      },
      NEED_HELP,
    ],
    related: ["how-to-give-a-refund", "recording-a-deposit"],
  },
  {
    id: "finding-your-way-around-uzapro",
    title: "Finding your way around UzaPro",
    category: "getting-started",
    updated: "2026-11-13",
    intro: [
      "UzaPro keeps the whole business in one place: selling, stock, buying, money and settings. This guide shows how the screens are laid out so you can find what you need quickly.",
    ],
    sections: [
      {
        heading: "The menu on the left",
        level: 2,
        blocks: [
          { kind: "p", text: "The menu groups the screens into sections. Select a section name to fold it away. If the page you are on is inside a folded section, a small dot shows next to the section name." },
          {
            kind: "table",
            head: ["Section", "Screens"],
            rows: [
              ["Overview", "Dashboard, Products and Stock"],
              ["Sales", "Sales, Point of sale and Customers"],
              ["Procurement", "Purchases and Suppliers"],
              ["Financials", "Accounts, Expenses, Receivables, Payables and Reports"],
              ["People", "Team and Permissions"],
              ["Office", "Calendar, Messages, File Manager and Help"],
              ["Account", "Profile and Settings"],
            ],
          },
        ],
      },
      {
        heading: "Tabs, lists and buttons",
        level: 2,
        blocks: [
          {
            kind: "ul",
            items: [
              "Each screen has tabs along the top. For example, Sales has Overview, All sales, Quotations, Invoices and more.",
              "The main button for a tab sits at the top right, for example **New sale** on Sales › All sales or **Record expenses** on Expenses › Expenses.",
              "Select a row in a list to open it. The actions menu at the end of a row has quick actions such as View, Edit or Approve.",
              "When you save something, a short message confirms it, for example **Deposit saved.**",
            ],
          },
        ],
      },
      {
        heading: "Search",
        level: 2,
        blocks: [
          { kind: "p", text: "The search box at the top of every page, **Search products, invoices, customers**, filters the list on the screen you are on. Each list also has a **Search this list** box. Both boxes share the same text, so clearing one clears the other." },
          { kind: "p", text: "To find help, choose the **Help** button at the top of the page. It opens this Help Center." },
        ],
      },
      {
        heading: "Your dashboard",
        level: 2,
        blocks: [
          { kind: "p", text: "The Dashboard shows your day at a glance. **What would you like to do?** has shortcuts for your role, such as New sale or Stock in, and **Needs your attention** lists things to follow up." },
          { kind: "note", tone: "info", text: "What you see depends on your role. A Cashier, for example, sees All sales and Refunds (credit notes) in Sales but not Invoices. If a screen mentioned in the Help Center is missing from your menu, ask the business owner." },
          { kind: "links", screens: [{ label: "Open Dashboard › Overview", module: "home", tab: "overview" }] },
        ],
      },
      {
        heading: "Roles and permissions",
        level: 2,
        blocks: [
          { kind: "p", text: "The business owner decides what each role can do in **People › Permissions**. Each role has a card showing its people and how many modules it can open. Choose **Edit role** to set access module by module." },
          {
            kind: "table",
            head: ["Access", "What the role can do"],
            rows: [
              ["Read", "Open the module and view, download and print records"],
              ["Write", "Create and edit records"],
              ["Delete", "Delete, void, cancel and undo records"],
            ],
          },
          {
            kind: "ul",
            items: [
              "Turn on any mix of Read, Write and Delete for each module. For example, an Accountant can have Read, Write and Delete on Expenses. Write and Delete also turn on Read, and turning Read off removes the module.",
              "The owner (admin) has access to everything and this can't be changed. Every role can open the Dashboard and Profile, and only the owner manages permissions.",
              "Choose **Add new role** to create a role, or use the **…** menu on a card to rename, duplicate or delete it. A role with people in it can't be deleted.",
            ],
          },
          { kind: "note", tone: "info", text: "Changes apply straight away. If a button such as **New sale** or **Void** is missing, your role has Read or Write on that module. Ask the business owner." },
          { kind: "links", screens: [{ label: "Open People › Permissions", module: "perm", tab: "permissions" }] },
        ],
      },
      {
        heading: "Frequently asked questions",
        level: 2,
        blocks: [
          { kind: "faq", q: "How do I try the demo as another role?", a: ["Open the account menu at the top right and pick a role under **View as**, for example Cashier or Store keeper. UzaPro takes you back to the Dashboard."] },
          { kind: "faq", q: "Where do I change my name or password?", a: ["Open the account menu at the top right and choose **Profile**."] },
        ],
      },
      NEED_HELP,
    ],
    related: ["recording-a-sale", "adding-a-product"],
  },
  {
    id: "recording-a-sale",
    title: "Recording a sale",
    category: "selling",
    updated: "2026-10-14",
    intro: [
      "Use **New sale** for a sale at the counter. UzaPro takes the items out of the **Point of Sale** store, adds VAT at 16% and records how the customer paid.",
      "**Who can do this:** anyone who can open Sales › All sales, including the Cashier.",
    ],
    sections: [
      {
        heading: "Add the items",
        level: 2,
        blocks: [
          {
            kind: "ol",
            items: [
              "Go to Sales › All sales and choose **New sale**.",
              "Under **Customer**, keep **Walk-in Customer** or search for the customer. For a new customer, type their name and add them from the list.",
              "Under **Product**, pick the item, then choose the **Product variant** and the **Unit of measure**.",
              "Check the **Amount each (KES)** and the **Number of units**, then choose **Add to sale**.",
              "Repeat for each item. The **This sale** panel shows each line, the VAT 16% and the total.",
            ],
          },
          { kind: "p", text: "The amount each fills in from the variant's selling price. You can change it before you add the line." },
        ],
      },
      {
        heading: "Take the payment",
        level: 2,
        blocks: [
          { kind: "p", text: "Pick how the customer paid under **Paid by**:" },
          {
            kind: "table",
            head: ["Paid by", "What happens"],
            rows: [
              ["M-Pesa", "Paid now. Add the M-Pesa code under Payment reference (optional)."],
              ["Cash", "Paid now."],
              ["Card", "Paid now. Add the card slip number as the reference."],
              ["Pay later (credit)", "Nothing is paid now. The total is added to Receivables, due in 30 days."],
            ],
          },
          { kind: "p", text: "Choose **Record sale**. The message reads, for example, **Sale recorded. KES 4,802.40 paid by M-Pesa.** A credit sale starts with **Credit sale recorded.** and names the receivable it added." },
          { kind: "note", tone: "warning", text: "A walk-in customer can't buy on credit. Pick the customer first, otherwise UzaPro shows **Pick the customer first. Walk-in customers can't buy on credit.**" },
          {
            kind: "links",
            screens: [
              { label: "Open Sales › All sales", module: "sales", tab: "all-sales" },
              { label: "Open Receivables", module: "rcv", tab: "receivables" },
            ],
          },
        ],
      },
      {
        heading: "Frequently asked questions",
        level: 2,
        blocks: [
          { kind: "faq", q: "What if there is not enough stock?", a: ["UzaPro stops the sale and says how many are left, for example **Only 3 Helmet left at Point of Sale.** Move more stock to Point of Sale first, then record the sale."] },
          { kind: "faq", q: "Can I print the receipt again?", a: ["Select the sale in Sales › All sales and choose **Reprint**, or **PDF** to download it."] },
          { kind: "faq", q: "How do I cancel a sale?", a: ["Select the sale, choose **Void**, pick a **Reason** and choose **Void sale**. The message reads **Sale voided.** and the sale moves to Sales › Voided items. Only the Owner and the Accountant can void a sale."] },
          { kind: "faq", q: "The customer brought an item back. What do I do?", a: ["Raise a credit note from the sale. See How to give a refund."] },
          { kind: "links", articles: ["how-to-give-a-refund", "moving-stock-between-stores"] },
        ],
      },
      NEED_HELP,
    ],
    related: ["how-to-give-a-refund", "sending-an-invoice-and-recording-its-payment", "moving-stock-between-stores"],
  },
  {
    id: "sending-an-invoice-and-recording-its-payment",
    title: "Sending an invoice and recording its payment",
    category: "invoices-and-quotations",
    updated: "2026-09-22",
    intro: [
      "An invoice bills a customer who pays later. When you save it, UzaPro takes the items out of the store you choose and adds the amount to Receivables. When the customer pays, you record the payment from the invoice.",
      "**Who can do this:** the Owner and the Accountant.",
    ],
    sections: [
      {
        heading: "Create the invoice",
        level: 2,
        blocks: [
          {
            kind: "ol",
            items: [
              "Go to Sales › Invoices and choose **New invoice**.",
              "Under **Invoice to**, pick the customer.",
              "Set the **Invoice date** and the **Due date**, and choose the **Sales store** the items come from. It starts as Main Store.",
              "Under **Add item**, pick each product, then set the **Qty** and **Rate** on its line.",
              "Add a **Discount** if you need one. The VAT 16% and the **Total** update as you go.",
              "In **Payment method**, write how the customer should pay, for example your bank account or M-Pesa paybill.",
              "Choose **Save** to keep it as Pending, or **Save and approve**.",
            ],
          },
          { kind: "p", text: "The message names the invoice and its receivable, for example **INV-0356 saved. RCV-0013 added to Receivables.**" },
        ],
      },
      {
        heading: "Send it to the customer",
        level: 2,
        blocks: [
          { kind: "p", text: "UzaPro does not email invoices for you. Select the invoice and choose **PDF** to download it, or **Print**, then send it the way you usually do, for example by email or WhatsApp." },
          { kind: "p", text: "If you saved it as Pending, choose **Approve** on the invoice when it is ready. The message reads, for example, **INV-0356 approved.**" },
        ],
      },
      {
        heading: "Record the payment",
        level: 2,
        blocks: [
          {
            kind: "ol",
            items: [
              "Go to Sales › Invoices and select the invoice.",
              "Choose **Record payment**. The payment form opens with the customer picked and the invoice's receivable ticked.",
              "Enter the **Amount received (KES)**, or choose **Pay full balance**.",
              "Pick the **Payment method** and the account under **Paid into**, for example M-Pesa Till.",
              "Check the **Payment date**, add a **Reference (optional)** such as the M-Pesa code, and choose **Save payment**.",
            ],
          },
          { kind: "p", text: "The message reads, for example, **PAY-0022 saved. KES 45,600 applied to RCV-0012.** The payment also appears in Accounts › Transactions as money in." },
          {
            kind: "table",
            head: ["On the invoice", "What it shows"],
            rows: [
              ["Balance due (KES)", "What is still owed, with the amount paid so far underneath"],
              ["Paid step", "Nothing paid yet, the amount paid and left, or Fully paid"],
              ["Status", "Paid once the whole amount is in"],
            ],
          },
          {
            kind: "links",
            screens: [
              { label: "Open Sales › Invoices", module: "sales", tab: "invoices" },
              { label: "Open Receivables › Payments", module: "rcv", tab: "payments" },
            ],
          },
        ],
      },
      {
        heading: "Frequently asked questions",
        level: 2,
        blocks: [
          { kind: "faq", q: "Can the customer pay in parts?", a: ["Yes. Enter the amount they paid. **Record payment** stays on the invoice until the balance is cleared."] },
          { kind: "faq", q: "Can I turn a quotation into an invoice?", a: ["Yes. Select the quotation in Sales › Quotations and choose **Convert to invoice**. The invoice form opens with the quotation's items."] },
          { kind: "faq", q: "Why is Record payment missing?", a: ["The invoice is already fully paid, so it has nothing left to collect in Receivables."] },
        ],
      },
      NEED_HELP,
    ],
    related: ["recording-a-sale", "recording-a-deposit"],
  },
  {
    id: "adding-a-product",
    title: "Adding a product",
    category: "stock-and-products",
    updated: "2026-08-19",
    intro: [
      "A product is something you sell. Each product has one or more **variants**, such as a size or colour, and each variant has its own buying and selling price.",
      "A new product starts with no stock. Add its first stock after you save it.",
    ],
    sections: [
      {
        heading: "Add the product",
        level: 2,
        blocks: [
          {
            kind: "ol",
            items: [
              "Go to Products › All products and choose **New product**.",
              "Enter the **Product name**.",
              "Pick a **Product category**. To add a new one, type its name and add it from the list. Pick a **Sub-category (optional)** if you use them.",
              "Under **Product variants**, fill in a row for each variant: the **Variant** name, for example Size 42, the **Base buying price**, the **Unit of measure** and the **Base selling price**. UzaPro works out the **Margin**.",
              "Choose **Add variant** for another row.",
              "Add a **Product image (optional)** if you have one.",
              "Choose **Save**. The message reads, for example, **Gravel Tyre added.**",
            ],
          },
          { kind: "note", tone: "info", text: "Each product needs at least one price. To sell a variant in another unit as well, for example by the box, choose **Add a price in another unit** on its row." },
        ],
      },
      {
        heading: "Set the tax",
        level: 2,
        blocks: [
          { kind: "p", text: "Pick the **Sales tax** and **Purchase tax** for the product. Both start as VAT (16%)." },
          {
            kind: "table",
            head: ["Option", "When to use it"],
            rows: [
              ["VAT (16%)", "Most goods"],
              ["Zero-rated (0%)", "Goods taxed at 0%"],
              ["Exempt", "Goods that are exempt from VAT"],
              ["No tax", "No tax is added when you sell the product"],
            ],
          },
          { kind: "p", text: "Turn on **Selling price includes tax** if the price you entered already includes VAT. Otherwise VAT is added on top, so KES 1,000 becomes KES 1,160." },
        ],
      },
      {
        heading: "Add its first stock",
        level: 2,
        blocks: [
          {
            kind: "ol",
            items: [
              "Go to Stock › Stock management and choose **Stock in**.",
              "Pick the **Destination store** and, if you like, the **Supplier**.",
              "Under **Search items**, add the product and set the quantity.",
              "Tick **Skip Purchases and add to stock now** and choose **Add to stock**. The message reads, for example, **Stock added to Main Store.**",
            ],
          },
          { kind: "p", text: "If you leave the box unticked, the button is **Send to Purchases**. That adds a goods receipt waiting in Purchases › Goods receipts and does not change stock yet." },
          {
            kind: "links",
            screens: [
              { label: "Open Products › All products", module: "prod", tab: "all-products" },
              { label: "Open Stock › Stock management", module: "inv", tab: "stock-management" },
            ],
          },
        ],
      },
      {
        heading: "Frequently asked questions",
        level: 2,
        blocks: [
          { kind: "faq", q: "Can I change a price later?", a: ["Yes. Select the product in Products › All products, choose **Edit**, change the price and choose **Save**."] },
          { kind: "faq", q: "Why is Save greyed out?", a: ["Enter a product name, pick a category and give every variant a name and a selling price above zero."] },
        ],
      },
      NEED_HELP,
    ],
    related: ["moving-stock-between-stores", "ordering-from-a-supplier-and-receiving-goods"],
  },
  {
    id: "moving-stock-between-stores",
    title: "Moving stock between stores",
    category: "stock-and-products",
    updated: "2026-10-02",
    intro: [
      "A stock transfer moves items from one store to another, for example from Main Store to Point of Sale so the counter has stock to sell. Stock leaves the source store when the transfer ships, and arrives when it is received.",
    ],
    sections: [
      {
        heading: "Create the transfer",
        level: 2,
        blocks: [
          {
            kind: "ol",
            items: [
              "Go to Stock › Transfer stock and choose **New transfer**.",
              "Pick the **Source store (from)** and the **Destination store (to)**. The source starts as Main Store.",
              "Set the **Transfer date** and add **Notes or reference** if you like, for example weekly resupply.",
              "Under **Search items**, add each product. Only items the source store holds are listed.",
              "Set the quantity to move on each line.",
            ],
          },
          { kind: "note", tone: "warning", text: "You can't move more than the source store holds. The save buttons stay greyed out until every quantity fits." },
        ],
      },
      {
        heading: "Choose how far it goes",
        level: 2,
        blocks: [
          {
            kind: "table",
            head: ["Button", "Status", "What happens to stock"],
            rows: [
              ["Confirm transfer", "Confirmed", "Nothing moves yet. You can still change or cancel it."],
              ["Transfer and ship", "In transit", "Stock leaves the source store."],
              ["Transfer, ship and receive", "Received", "Stock leaves the source and arrives at the destination straight away."],
            ],
          },
          { kind: "p", text: "The messages are **Transfer confirmed.**, **Transfer on its way to Point of Sale.** and **Transfer received at Point of Sale.**, using the name of your destination store." },
          { kind: "p", text: "To ship a confirmed transfer later, select it in the list and choose **Transfer and ship** or **Transfer, ship and receive**." },
        ],
      },
      {
        heading: "Receive a transfer in transit",
        level: 2,
        blocks: [
          {
            kind: "ol",
            items: [
              "Go to Stock › Transfer stock and select the transfer that shows **In transit**.",
              "Check the items, then choose **Mark as received**.",
            ],
          },
          { kind: "p", text: "The items are added to the destination store, and the transfer shows **Received**." },
          {
            kind: "links",
            screens: [
              { label: "Open Stock › Transfer stock", module: "inv", tab: "transfer-stock" },
              { label: "Open Stock › Stock management", module: "inv", tab: "stock-management" },
            ],
          },
        ],
      },
      {
        heading: "Frequently asked questions",
        level: 2,
        blocks: [
          { kind: "faq", q: "Can I cancel a transfer?", a: ["Only before it ships. Open the actions menu on its row, choose **Cancel transfer**, then **Cancel transfer** again to confirm. No stock moves, and the transfer stays in the list as Cancelled."] },
          { kind: "faq", q: "Can I change a transfer after it ships?", a: ["No. A transfer that is In transit can only be viewed and marked as received."] },
        ],
      },
      NEED_HELP,
    ],
    related: ["adding-a-product", "recording-a-sale"],
  },
  {
    id: "ordering-from-a-supplier-and-receiving-goods",
    title: "Ordering from a supplier and receiving goods",
    category: "buying",
    updated: "2026-09-05",
    intro: [
      "A purchase order lists what you are buying from a supplier. When the goods arrive, you receive them against the order. UzaPro saves a goods receipt, adds the accepted items to stock and, if the order is not paid yet, adds a bill to Payables.",
    ],
    sections: [
      {
        heading: "Create the purchase order",
        level: 2,
        blocks: [
          {
            kind: "ol",
            items: [
              "Go to Purchases › Purchase orders and choose **New purchase order**.",
              "Under **General information**, pick the **Supplier** and the **Destination store**, and set the **Order date**. **Expected delivery (optional)** helps you plan.",
              "Under **Payment**, choose the **Payment term**, for example Cash on delivery or 30 days, and the **Payment method**. Tick **Already paid** if you paid upfront.",
              "Under **Line items**, search for each product and set the **Qty**, **Unit** and **Cost price (KES)**.",
              "Choose **Save and approve** to send it, or **Save as draft** to finish it later.",
            ],
          },
          { kind: "p", text: "The message reads, for example, **PUR-ORD-0410 saved.**" },
        ],
      },
      {
        heading: "Follow the order",
        level: 2,
        blocks: [
          { kind: "p", text: "Select the order to see where it is. The **Next step** panel shows the button for what comes next." },
          {
            kind: "table",
            head: ["Status", "Next step"],
            rows: [
              ["Draft", "Choose **Mark as sent** when you send it to the supplier."],
              ["Sent (Approved in the list)", "Choose **Mark as accepted** when the supplier confirms."],
              ["Accepted", "Choose **Receive goods** when the delivery arrives."],
              ["Completed", "Everything on the order has been received."],
            ],
          },
        ],
      },
      {
        heading: "Receive the goods",
        level: 2,
        blocks: [
          {
            kind: "ol",
            items: [
              "In Purchases › Purchase orders, open the actions menu on the order's row and choose **Accept and receive goods**. You can also select the order and choose **Receive goods**.",
              "Check the **Destination store** and the **Received on** date. Add the **Delivery note no. (optional)** and **Supplier invoice no. (optional)**.",
              "Every line still to come starts ticked with its full quantity. Choose **Receive all as ordered** to go back to that at any time.",
              "If less arrived, change **Received** on the line. Lower **Accepted** for anything damaged. The difference is counted as rejected.",
              "Choose the receive button, for example **Receive 2 lines**.",
            ],
          },
          { kind: "p", text: "The message names the goods receipt, how many items were accepted and where, for example **GRN-0042 saved. 10 accepted into Main Store.** If the order is not paid, it also names the bill added to Payables." },
          { kind: "note", tone: "info", text: "Only accepted quantities go into stock. Rejected quantities are listed in Purchases › Rejected items with the reason Rejected on delivery." },
          {
            kind: "links",
            screens: [
              { label: "Open Purchases › Purchase orders", module: "buy", tab: "purchase-orders" },
              { label: "Open Purchases › Goods receipts", module: "buy", tab: "goods-receipts" },
            ],
          },
        ],
      },
      {
        heading: "Frequently asked questions",
        level: 2,
        blocks: [
          { kind: "faq", q: "Do I have to mark the order as accepted first?", a: ["No. **Accept and receive goods** accepts the order when you save the receipt."] },
          { kind: "faq", q: "What if only part of the order arrives?", a: ["Receive what came. The order's Received column shows **Partial** and you can receive the rest later."] },
          { kind: "faq", q: "Where does the bill go?", a: ["If the order is not marked as paid, the accepted value is added to Payables as a Goods received bill, due according to the payment term."] },
        ],
      },
      NEED_HELP,
    ],
    related: ["adding-a-product", "recording-an-expense"],
  },
  {
    id: "recording-a-deposit",
    title: "Recording a deposit",
    category: "money",
    updated: "2026-10-20",
    intro: [
      "A deposit adds money to one of your accounts, for example cash you banked or money that came into the M-Pesa till. Use it for money in that is not a customer paying an invoice or sale.",
      "**Who can do this:** the Owner and the Accountant.",
    ],
    sections: [
      {
        heading: "Record the deposit",
        level: 2,
        blocks: [
          {
            kind: "ol",
            items: [
              "Go to Accounts › Deposits and choose **New deposit**.",
              "Pick the **Destination account**, for example Equity Bank — Main, M-Pesa Till or Cash drawer.",
              "Enter the **Deposit amount (KES)**. If you were charged, enter it under **Bank or processing fee (optional)**.",
              "Choose the **Deposit method**: Cash, M-Pesa, Bank transfer, Cheque or Card. Add a **Reference number (optional)**, such as the M-Pesa code or cheque number.",
              "Write a short **Description**, and add **Internal notes (optional)** for your team.",
              "Choose **Create deposit**. The message reads **Deposit saved.**",
            ],
          },
        ],
      },
      {
        heading: "What changes",
        level: 2,
        blocks: [
          {
            kind: "ul",
            items: [
              "The deposit is listed in Accounts › Deposits as Cleared.",
              "The account balance goes up by the deposit amount. A fee is taken off as a separate Bank fee line.",
              "Both lines appear in Accounts › Transactions.",
            ],
          },
          { kind: "note", tone: "info", text: "When a customer pays an invoice, use **Record payment** on the invoice instead, so the invoice and Receivables update too." },
          {
            kind: "links",
            screens: [
              { label: "Open Accounts › Deposits", module: "fin", tab: "deposits" },
              { label: "Open Accounts › Transactions", module: "fin", tab: "transactions" },
            ],
          },
        ],
      },
      {
        heading: "Reverse a deposit",
        level: 2,
        blocks: [
          {
            kind: "ol",
            items: [
              "Go to Accounts › Deposits and select the deposit.",
              "Choose **Reverse**, then **Yes, reverse it**.",
            ],
          },
          { kind: "p", text: "The message reads, for example, **DEP-0218 reversed. Equity Bank — Main balance updated.** A reversal can't be undone." },
        ],
      },
      {
        heading: "Frequently asked questions",
        level: 2,
        blocks: [
          { kind: "faq", q: "Why is Create deposit greyed out?", a: ["Pick an account, enter an amount above zero and write a description."] },
          { kind: "faq", q: "How do I move money between my own accounts?", a: ["Use Accounts › Transfers and choose **New transfer**. The message reads **Transfer saved.**"] },
        ],
      },
      NEED_HELP,
    ],
    related: ["reconciling-a-bank-feed", "sending-an-invoice-and-recording-its-payment"],
  },
  {
    id: "recording-an-expense",
    title: "Recording an expense",
    category: "expenses",
    updated: "2026-11-03",
    intro: [
      "Record what the business spends, such as rent, fuel or internet. You can record several expenses at once, pay them now or later, and set up expenses that repeat.",
    ],
    sections: [
      {
        heading: "Record expenses",
        level: 2,
        blocks: [
          {
            kind: "ol",
            items: [
              "Go to Expenses › Expenses and choose **Record expenses**.",
              "For each expense, choose the **Expense type**: **One-off** or **Recurring**.",
              "For a one-off expense, choose **When to pay**: **Pay now** or **Pay later**.",
              "Pick the **Category** and the **Payment account** the money comes from.",
              "Enter the **Amount (KES)**. Add the **Tax amount (KES)** and **Transaction cost (KES)** if there are any, for example M-Pesa charges.",
              "Pick the **Payment method**, set the **Expense date**, and fill in the **Payee name**, **Payment reference** and **Expense reason**.",
              "Choose **Add another expense** for each extra expense.",
              "Choose the save button, for example **Save 1 expense** or **Save 3 expenses**.",
            ],
          },
          { kind: "p", text: "The message counts what happened, for example **1 paid.** or **2 paid, 1 waiting approval.**" },
        ],
      },
      {
        heading: "Pay now or later",
        level: 2,
        blocks: [
          {
            kind: "table",
            head: ["You chose", "What happens"],
            rows: [
              ["Pay now, category does not need approval", "Paid from the payment account straight away."],
              ["Pay now, category needs approval", "Waits for approval. The money is paid when it is approved."],
              ["Pay later", "Added to Payables as a bill. Fill in **Supplier or payee (required)** and a **Due date**."],
            ],
          },
          { kind: "p", text: "A bill in a category that needs approval waits for approval in Payables before you can pay it." },
        ],
      },
      {
        heading: "Approve an expense",
        level: 2,
        blocks: [
          { kind: "p", text: "Categories marked **Needs approval** hold their expenses until someone approves them. In the demo these are Internet and phone, Salaries and wages, and Repairs and maintenance." },
          {
            kind: "ol",
            items: [
              "Go to Expenses › Expenses and select an expense that shows **Waiting approval**.",
              "Choose **Approve**. The message reads, for example, **EXP-0043 approved and paid from M-Pesa Till.**",
            ],
          },
          { kind: "note", tone: "info", text: "To change which categories need approval, edit the category in Expenses › Expense categories and tick or untick **Needs approval**." },
          {
            kind: "links",
            screens: [
              { label: "Open Expenses › Expenses", module: "exp", tab: "expenses" },
              { label: "Open Expenses › Expense categories", module: "exp", tab: "expense-categories" },
            ],
          },
        ],
      },
      {
        heading: "Frequently asked questions",
        level: 2,
        blocks: [
          { kind: "faq", q: "How do I set up rent that repeats every month?", a: ["Choose **Recurring** as the expense type, give it a **Recurring expense name**, set **Repeats** to Monthly and pick the **Start date**. The message reads **1 recurring set up.**"] },
          { kind: "faq", q: "Can I undo an expense?", a: ["Select it and choose **Void**, then give a **Reason for voiding**. If it was paid, the money goes back to the account."] },
        ],
      },
      NEED_HELP,
    ],
    related: ["recording-a-deposit", "ordering-from-a-supplier-and-receiving-goods"],
  },
  {
    id: "setting-up-a-pos-terminal",
    title: "Setting up a POS terminal",
    category: "settings",
    updated: "2026-08-27",
    intro: [
      "A terminal is a till or device that makes sales. Each terminal sells from one storage location that has sales (POS) turned on.",
      "You can add as many terminals as you need, at no extra cost. The demo business has one, Terminal 1.",
    ],
    sections: [
      {
        heading: "Before you start",
        level: 2,
        blocks: [
          { kind: "p", text: "The terminal needs a storage location that allows sales. Point of Sale and Main Store already do. For another location, edit it in Settings › Storage locations and tick **Allow direct sales (POS)**." },
        ],
      },
      {
        heading: "Add the terminal",
        level: 2,
        blocks: [
          {
            kind: "ol",
            items: [
              "Go to Settings › Terminals and choose **Add terminal**.",
              "Enter the **Terminal name**, for example Counter 1.",
              "Pick a **Branch (optional)**, or leave it as Any branch.",
              "Pick the **Storage location** it sells from. Only locations with sales (POS) turned on are listed.",
              "Choose **Add terminal**. The message reads, for example, **Counter 1 added and active.**",
            ],
          },
        ],
      },
      {
        heading: "Manage terminals",
        level: 2,
        blocks: [
          {
            kind: "ul",
            items: [
              "Choose **Activate** or **Deactivate** on a terminal's card. The message reads, for example, **Counter 1 activated.**",
              "A deactivated terminal can't be opened from Point of sale until you activate it again.",
              "Choose **Edit terminal** to rename it or change its location.",
              "The main terminal can't be deleted.",
            ],
          },
          {
            kind: "links",
            screens: [
              { label: "Open Settings › Terminals", module: "set", tab: "terminals" },
              { label: "Open Settings › Storage locations", module: "set", tab: "storage-locations" },
            ],
          },
        ],
      },
      {
        heading: "Frequently asked questions",
        level: 2,
        blocks: [
          { kind: "faq", q: "Why is the storage location list empty?", a: ["None of the locations in the branch you picked allow sales. UzaPro shows **No POS locations here**. Turn on sales (POS) for one of them, or pick Any branch."] },
        ],
      },
      NEED_HELP,
    ],
    related: ["adding-a-branch-and-its-store", "recording-a-sale"],
  },
  {
    id: "adding-a-branch-and-its-store",
    title: "Adding a branch and its store",
    category: "settings",
    updated: "2026-11-07",
    intro: [
      "A branch is a shop, office or warehouse site. Stock is kept in storage locations under a branch, and terminals sell from those locations. You can create the branch, its store and a terminal in one step.",
    ],
    sections: [
      {
        heading: "Add the branch",
        level: 2,
        blocks: [
          {
            kind: "ol",
            items: [
              "Go to Settings › Branches and choose **Add branch**.",
              "Enter the **Name**, for example Westlands Branch, and the **Phone** and **Email** if you have them.",
              "Pick the **Location group or region**. The demo has one group, Administration.",
              "Under **Address**, pick the **City or town** and enter the **Street or building**.",
              "Tick **Set as main headquarters** only if this branch should be used on receipts and as the default branch.",
            ],
          },
        ],
      },
      {
        heading: "Create its store and terminal",
        level: 2,
        blocks: [
          {
            kind: "ol",
            items: [
              "Under **Also create under this branch**, tick **Create storage location**. It is named after the branch, for example Westlands Branch Store, with sales (POS) turned on.",
              "Tick **Create terminal** as well if the branch will sell. It is named, for example, Westlands Branch Terminal.",
              "Choose **Create branch**.",
            ],
          },
          {
            kind: "table",
            head: ["You ticked", "Message"],
            rows: [
              ["Nothing", "Westlands Branch created."],
              ["Create storage location", "Westlands Branch created. Westlands Branch Store added."],
              ["Both", "Westlands Branch created. Westlands Branch Store added. Terminal added."],
            ],
          },
        ],
      },
      {
        heading: "Add a store later",
        level: 2,
        blocks: [
          {
            kind: "ol",
            items: [
              "Go to Settings › Storage locations and choose **Add storage location**.",
              "Enter the **Name**, pick the **Parent branch** and the **Type**, for example Store or Retail.",
              "Tick **Allow direct sales (POS)** if you will sell from it. Leave it unticked for storage only.",
              "Choose **Create**. The message reads, for example, **Westlands Store created.**",
            ],
          },
          {
            kind: "links",
            screens: [
              { label: "Open Settings › Branches", module: "set", tab: "branches" },
              { label: "Open Settings › Storage locations", module: "set", tab: "storage-locations" },
            ],
          },
        ],
      },
      {
        heading: "Frequently asked questions",
        level: 2,
        blocks: [
          { kind: "faq", q: "How do I get stock into the new store?", a: ["Move it from another store with a stock transfer, or use **Stock in** in Stock › Stock management."] },
          { kind: "faq", q: "Why is Create terminal greyed out?", a: ["A terminal needs a storage location to sell from. Tick **Create storage location** first."] },
          { kind: "links", articles: ["moving-stock-between-stores", "setting-up-a-pos-terminal"] },
        ],
      },
      NEED_HELP,
    ],
    related: ["setting-up-a-pos-terminal", "moving-stock-between-stores"],
  },
];
