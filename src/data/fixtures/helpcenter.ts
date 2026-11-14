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
              ["Pay later (credit)", "Nothing is paid now. The total is added to Receivables, due after the customer's payment terms (30 days unless you change them)."],
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
  {
    id: "wholesale-prices-and-credit-limits",
    title: "Wholesale prices and credit limits",
    category: "selling",
    updated: "2026-11-14",
    intro: [
      "Give each kind of customer its own prices, and decide how much each customer can owe you. UzaPro then fills in the right price on a sale and stops credit that goes too far.",
      "**Who can do this:** anyone with Write on Products can change price lists, and anyone with Write on Customers can change groups, limits and terms.",
    ],
    sections: [
      {
        heading: "Put customers in groups",
        level: 2,
        blocks: [
          { kind: "p", text: "Every customer belongs to one group. UzaPro starts with **Retail**, **Wholesale** and **Distributor**. Retail customers, including walk-in customers, pay your standard prices." },
          {
            kind: "ol",
            items: [
              "Go to Customers › Customer groups and choose **New group** to add a group, for example Schools.",
              "Go to Customers › Customers and select a customer.",
              "Pick the **Customer group**, then choose **Save**.",
            ],
          },
          { kind: "links", screens: [{ label: "Open Customers › Customer groups", module: "cust", tab: "customer-groups" }] },
        ],
      },
      {
        heading: "Set a group's prices",
        level: 2,
        blocks: [
          {
            kind: "ol",
            items: [
              "Go to Products › Price lists and pick the group's list.",
              "Choose **Add price**, then pick the **Product**, the **Product variant** and the **Unit of measure**.",
              "Enter a **From quantity** and a **Price (KES)**. Use **Add a quantity break** for a lower price at a higher quantity, for example from 5 cartons.",
              "Choose **Save**. The message reads **Price saved.**",
            ],
          },
          { kind: "p", text: "On a sale, quotation, invoice or at the till, the price fills in when you pick a customer in that group, and the line shows, for example, **Wholesale price**. A quantity below the first break keeps the standard price." },
          { kind: "note", tone: "info", text: "A price you type by hand is kept. Choose **Use Wholesale price** to go back to the list price." },
          { kind: "links", screens: [{ label: "Open Products › Price lists", module: "prod", tab: "price-lists" }] },
        ],
      },
      {
        heading: "Set a credit limit and payment terms",
        level: 2,
        blocks: [
          {
            kind: "ol",
            items: [
              "Go to Customers › Customers and select the customer.",
              "Enter the **Credit limit (KES) (optional)**. Leave it blank for no limit.",
              "Pick the **Payment terms**: Cash, 7 days, 14 days or 30 days.",
              "Choose **Save**.",
            ],
          },
          { kind: "p", text: "The **Credit** panel on the customer shows the limit, the balance owed, the available credit and anything overdue." },
          {
            kind: "table",
            head: ["UzaPro stops a credit sale when", "What you see"],
            rows: [
              ["The customer is on cash terms", "The customer's name, then: is on cash terms"],
              ["The customer has an overdue balance", "The overdue amount and the oldest overdue document"],
              ["The sale would go over the limit", "Over the credit limit, with the amount over"],
            ],
          },
          { kind: "p", text: "Someone with Write on Receivables, such as the Owner or the Accountant, can choose **Approve anyway** and give a reason. The sale then shows who approved it." },
          { kind: "links", screens: [{ label: "Open Customers", module: "cust", tab: "customers" }, { label: "Open Receivables", module: "rcv", tab: "receivables" }] },
        ],
      },
      {
        heading: "Frequently asked questions",
        level: 2,
        blocks: [
          { kind: "faq", q: "Why did the price not change for my wholesale customer?", a: ["The list may have no price for that variant and unit, or the quantity is below the first break. The line then shows, for example, **Wholesale price from 2 Tray**."] },
          { kind: "faq", q: "Does a quotation check the credit limit?", a: ["No. The check runs when you record a credit sale, save a new invoice or choose **Pay later** at the till."] },
          { kind: "faq", q: "A cashier cannot approve a stopped sale. Why?", a: ["Only roles with Write on Receivables can approve. The cashier can take another payment method or ask a manager."] },
          { kind: "links", articles: ["recording-a-sale", "sending-an-invoice-and-recording-its-payment"] },
        ],
      },
      NEED_HELP,
    ],
    related: ["recording-a-sale", "sending-an-invoice-and-recording-its-payment"],
  },
  {
    id: "sales-orders-and-deliveries",
    title: "Sales orders and deliveries",
    category: "selling",
    updated: "2026-11-14",
    intro: [
      "Use a sales order when a customer orders goods that you will deliver later, in one trip or several. Stock leaves when you dispatch, and the customer is invoiced for what was sent.",
      "**Who can do this:** anyone with Write on Sales. Cancelling an order needs Delete on Sales.",
    ],
    sections: [
      {
        heading: "Take the order",
        level: 2,
        blocks: [
          {
            kind: "ol",
            items: [
              "Go to Sales › Sales orders and choose **New order**.",
              "Pick the **Customer**, the store to **Dispatch from**, and the **Deliver by** date.",
              "Use **Add item** for each product, then set the quantity and the unit. The rate fills in from the customer's price list.",
              "Choose **Save**. The message reads, for example, **SO-0002 saved.**",
            ],
          },
          { kind: "note", tone: "info", text: "Saving an order does not move stock and the customer owes nothing yet. The credit limit is checked when you save, and the order counts against the limit until it is invoiced or cancelled." },
          { kind: "links", screens: [{ label: "Open Sales › Sales orders", module: "sales", tab: "sales-orders" }] },
        ],
      },
      {
        heading: "Dispatch the goods",
        level: 2,
        blocks: [
          {
            kind: "ol",
            items: [
              "Open the order and choose **Dispatch**.",
              "Check **Send now** for each item. Lower it if you are sending part of the order.",
              "Enter the **Driver** and the **Vehicle registration**, then choose **Confirm dispatch**.",
            ],
          },
          { kind: "p", text: "UzaPro creates a delivery note, for example **DN-0002**, and takes the items out of the store. The order shows **Part dispatched** until everything has been sent." },
          { kind: "p", text: "When the goods arrive, open the delivery note under Sales › Deliveries, choose **Mark delivered** and enter who received them." },
          { kind: "links", screens: [{ label: "Open Sales › Deliveries", module: "sales", tab: "deliveries" }] },
        ],
      },
      {
        heading: "Invoice what was sent",
        level: 2,
        blocks: [
          { kind: "p", text: "Open the order and choose **Create invoice**. The invoice covers the items dispatched so far that are not yet invoiced, and it is added to Receivables. Stock does not move again." },
          {
            kind: "table",
            head: ["Order status", "What it means"],
            rows: [
              ["Open", "Nothing has been dispatched."],
              ["Part dispatched", "Some items are still to send."],
              ["Dispatched", "Everything has been sent."],
              ["Invoiced", "Everything has been sent and invoiced."],
              ["Cancelled", "The order was cancelled before anything was sent."],
            ],
          },
          { kind: "links", screens: [{ label: "Open Sales › Invoices", module: "sales", tab: "invoices" }] },
        ],
      },
      {
        heading: "Frequently asked questions",
        level: 2,
        blocks: [
          { kind: "faq", q: "Can I change an order after sending part of it?", a: ["No. An order can be edited or cancelled only while nothing has been dispatched."] },
          { kind: "faq", q: "What if the store does not have enough stock?", a: ["The dispatch is refused and says how many are left, for example **Only 3 Bike Pump left at Main Store.** Lower **Send now** or move stock in first."] },
          { kind: "faq", q: "The customer said yes to a quotation. Do I retype it?", a: ["No. Open the quotation and choose **Convert to order**. The order form opens with the quoted items and rates; set the deliver-by date and save."] },
          { kind: "faq", q: "Goods came back with the driver. What do I do?", a: ["Open the delivery note under Sales › Deliveries and choose **Record return**. Enter how many came back and pick a reason. The stock returns to the store and the order shows those items as still to dispatch."] },
          { kind: "faq", q: "The customer returned items that are already invoiced. What do I do?", a: ["Raise a credit note from the invoice. See How to give a refund."] },
          { kind: "links", articles: ["how-to-give-a-refund", "wholesale-prices-and-credit-limits"] },
        ],
      },
      NEED_HELP,
    ],
    related: ["wholesale-prices-and-credit-limits", "sending-an-invoice-and-recording-its-payment", "moving-stock-between-stores"],
  },
  {
    id: "bulk-units-and-reorder-points",
    title: "Bulk units and reorder points",
    category: "stock-and-products",
    updated: "2026-11-15",
    intro: [
      "Sell the same product by the piece and by the carton from one stock figure, and let UzaPro tell you when to buy more.",
      "**Who can do this:** anyone with Write on Products can set what a unit contains. Anyone with Write on Stock can set reorder points, and creating purchase orders from them also needs Write on Purchases.",
    ],
    sections: [
      {
        heading: "Say what a bulk unit contains",
        level: 2,
        blocks: [
          { kind: "p", text: "Stock is counted in a product's base unit, for example Piece. A price in another unit, such as Carton, says how many base units it contains." },
          {
            kind: "ol",
            items: [
              "Go to Products › All products and open the product, then choose **Edit**.",
              "In **Product variants**, use **+** on a variant to price it in another unit.",
              "Pick the unit, enter the prices, and enter **Contains**: how many base units are in it.",
              "Choose **Save**.",
            ],
          },
          { kind: "p", text: "From then on, selling, dispatching, receiving, moving or writing off that unit changes stock by what it contains. Selling 2 cartons of 10 takes 20 off the stock figure." },
          { kind: "note", tone: "info", text: "If the store does not hold enough, the message counts in the base unit, for example **Only 24 Helmet left at Point of Sale.**" },
          { kind: "links", screens: [{ label: "Open Products › All products", module: "prod", tab: "all-products" }] },
        ],
      },
      {
        heading: "Set a reorder point",
        level: 2,
        blocks: [
          {
            kind: "ol",
            items: [
              "Go to Stock › Reorder and choose **Set reorder point**.",
              "Pick the **Product**, the **Variant to order** and the **Store**.",
              "Enter **Reorder at** and **Order up to**, both in the base unit.",
              "Pick the **Order unit** and, if you want purchase orders made for you, the **Supplier**.",
              "Choose **Save**. The message reads **Reorder point saved.**",
            ],
          },
          {
            kind: "table",
            head: ["Status", "What it means"],
            rows: [
              ["OK", "Stock is above the reorder point."],
              ["Reorder now", "Stock on hand and on order is at or below the reorder point."],
              ["Out of stock", "The same, and nothing is on hand."],
              ["On order", "Stock is low, but purchase orders already cover it."],
            ],
          },
          { kind: "links", screens: [{ label: "Open Stock › Reorder", module: "inv", tab: "reorder" }] },
        ],
      },
      {
        heading: "Create purchase orders from the list",
        level: 2,
        blocks: [
          { kind: "p", text: "Choose **Create draft purchase orders**. UzaPro makes one draft per supplier and store, with each suggested quantity rounded up to whole order units. Lines with no supplier are skipped. Check the drafts under Purchases, then approve and send them." },
          { kind: "links", screens: [{ label: "Open Purchases › Purchase orders", module: "buy", tab: "purchase-orders" }] },
        ],
      },
      {
        heading: "Frequently asked questions",
        level: 2,
        blocks: [
          { kind: "faq", q: "Why does a product with sizes have one reorder point?", a: ["Stock is counted per product and store, not per size. The reorder point names the variant to order, and you can change the draft purchase order before you send it."] },
          { kind: "faq", q: "I pressed Create draft purchase orders twice. Did it order twice?", a: ["No. The first drafts count as on order, so the lines show **On order** and nothing more is suggested."] },
          { kind: "links", articles: ["adding-a-product", "ordering-from-a-supplier-and-receiving-goods"] },
        ],
      },
      NEED_HELP,
    ],
    related: ["adding-a-product", "ordering-from-a-supplier-and-receiving-goods", "moving-stock-between-stores"],
  },
  {
    id: "batches-and-expiry-dates",
    title: "Batches and expiry dates",
    category: "stock-and-products",
    updated: "2026-11-15",
    intro: [
      "Record which stock belongs to which batch and when it expires. UzaPro then sells the earliest expiry first, keeps expired stock out of sales, and shows you what to deal with.",
      "**Who can do this:** anyone with Write on Stock can record and write off batches. Removing a batch record needs Delete on Stock.",
    ],
    sections: [
      {
        heading: "Record a batch",
        level: 2,
        blocks: [
          {
            kind: "ol",
            items: [
              "Go to Stock › Expiry and choose **Record batch**.",
              "Pick the **Product** and the **Store**.",
              "Enter the **Batch number** and the **Expiry date**.",
              "Enter the **Quantity** in the base unit. It can't be more than the stock there that is not in a batch yet.",
              "Choose **Save**. The message reads, for example, **Batch MP-2411 recorded.**",
            ],
          },
          { kind: "note", tone: "info", text: "Stock that arrives is not in a batch until you record one. A transfer arrives at the other store not in a batch, so record it again there." },
          { kind: "links", screens: [{ label: "Open Stock › Expiry", module: "inv", tab: "expiry" }] },
        ],
      },
      {
        heading: "What the list shows",
        level: 2,
        blocks: [
          {
            kind: "table",
            head: ["Status", "What it means"],
            rows: [
              ["OK", "More than 30 days left."],
              ["Expires soon", "30 days or fewer left."],
              ["Expired", "The expiry date has passed. This stock can't be sold."],
            ],
          },
          { kind: "p", text: "A sale, an invoice, the till and a dispatch all take the batch that expires first. Expired stock still counts in stock on hand until you write it off, but it is left out of what can be sold." },
        ],
      },
      {
        heading: "Write off an expired batch",
        level: 2,
        blocks: [
          {
            kind: "ol",
            items: ["On the expired batch, open the row menu and choose **Write off**.", "Confirm. The message reads, for example, **Batch MP-2409 written off.**"],
          },
          { kind: "p", text: "The batch's quantity is recorded under Stock › Wastage with the reason **Expired**, and stock on hand falls by that amount." },
          { kind: "links", screens: [{ label: "Open Stock › Wastage", module: "inv", tab: "wastage" }] },
        ],
      },
      {
        heading: "Frequently asked questions",
        level: 2,
        blocks: [
          { kind: "faq", q: "A sale says fewer are left than the stock list shows. Why?", a: ["Part of the stock has expired. The sale counts only what is in date, for example **Only 5 Muthokinju Paint left at Point of Sale.**"] },
          { kind: "faq", q: "Do I have to put all my stock in batches?", a: ["No. Stock that is not in a batch is treated as in date and is used after the batches."] },
          { kind: "links", articles: ["bulk-units-and-reorder-points", "moving-stock-between-stores"] },
        ],
      },
      NEED_HELP,
    ],
    related: ["bulk-units-and-reorder-points", "moving-stock-between-stores"],
  },
  {
    id: "counting-your-stock",
    title: "Counting your stock",
    category: "stock-and-products",
    updated: "2026-11-15",
    intro: [
      "A stock count compares what UzaPro says you have with what is on the shelf, shows the difference, and corrects stock once it is approved.",
      "**Who can do this:** anyone with Write on Stock can start a count, enter quantities and submit it. Approving, sending back and cancelling need Delete on Stock.",
    ],
    sections: [
      {
        heading: "Start a count and enter what you find",
        level: 2,
        blocks: [
          {
            kind: "ol",
            items: [
              "Go to Stock › Stock counts and choose **New count**.",
              "Pick the **Store**. Leave every product ticked for a full count, or untick some for a partial count.",
              "Choose **Start count**. The count opens with the system quantity for each product.",
              "Enter what you counted under **Counted**, in the base unit.",
              "Choose **Save** to keep your place, or **Submit for approval** when every line is counted.",
            ],
          },
          { kind: "note", tone: "info", text: "A store can have one count open at a time. Stock does not change while you count." },
          { kind: "links", screens: [{ label: "Open Stock › Stock counts", module: "inv", tab: "stock-counts" }] },
        ],
      },
      {
        heading: "Review and approve",
        level: 2,
        blocks: [
          { kind: "p", text: "Each line shows its **Variance**: counted less system. The totals show how many units are over, how many are short, and the net value at the buying price." },
          {
            kind: "table",
            head: ["Action", "What happens"],
            rows: [
              ["Approve", "Stock at the store changes by each line's variance. The stock history shows Counted with the count's number."],
              ["Send back", "The count returns to In progress for a recount."],
              ["Cancel count", "The count is kept as Cancelled. Stock does not change."],
            ],
          },
          { kind: "p", text: "If stock was sold or received while the count was open, the variance is applied to the stock as it is now." },
        ],
      },
      {
        heading: "Frequently asked questions",
        level: 2,
        blocks: [
          { kind: "faq", q: "Why can't I submit the count?", a: ["Every line needs a counted quantity. The message says how many are left, for example **Count every line first. 2 left.** Enter 0 for a product that has none."] },
          { kind: "faq", q: "Why is there no Approve button?", a: ["Your role can count but not approve. Ask someone with Delete on Stock, such as the Owner."] },
          { kind: "links", articles: ["batches-and-expiry-dates", "bulk-units-and-reorder-points"] },
        ],
      },
      NEED_HELP,
    ],
    related: ["batches-and-expiry-dates", "bulk-units-and-reorder-points", "moving-stock-between-stores"],
  },
  {
    id: "approvals-and-discount-limits",
    title: "Approvals and discount limits",
    category: "getting-started",
    updated: "2026-11-15",
    intro: [
      "Besides Read, Write and Delete on each module, a role has four rights that decide what it may approve and how big a discount it may give.",
      "**Who can do this:** only the Owner can change roles.",
    ],
    sections: [
      {
        heading: "Set a role's approvals",
        level: 2,
        blocks: [
          {
            kind: "ol",
            items: [
              "Go to People › Permissions and choose **Edit role** on the role's card.",
              "Under **Approvals**, turn each right on or off.",
              "Enter **Discount up to (%)**, a whole number from 0 to 100.",
              "Choose **Save**. The message reads, for example, **Cashier access saved.**",
            ],
          },
          {
            kind: "table",
            head: ["Right", "What it allows"],
            rows: [
              ["Approve credit over the limit", "Choose Approve anyway when a customer is over their limit, overdue or on cash terms."],
              ["Approve stock counts", "Approve a count, send it back or cancel it."],
              ["Dispatch sales orders", "Dispatch an order and mark a delivery note delivered, without being able to edit or invoice sales."],
              ["Discount up to (%)", "The largest discount on a till sale, a quotation or an invoice."],
            ],
          },
          { kind: "links", screens: [{ label: "Open People › Permissions", module: "perm", tab: "permissions" }] },
        ],
      },
      {
        heading: "What the roles start with",
        level: 2,
        blocks: [
          {
            kind: "table",
            head: ["Role", "Approvals", "Discount up to"],
            rows: [
              ["Owner / Admin", "All", "100%"],
              ["Accountant", "Credit, dispatch", "20%"],
              ["Cashier", "None", "5%"],
              ["Store keeper", "None", "0%"],
            ],
          },
          { kind: "note", tone: "info", text: "A right does not show a module by itself. To let the Store keeper dispatch, turn on Read on Sales as well as **Dispatch sales orders**." },
        ],
      },
      {
        heading: "Frequently asked questions",
        level: 2,
        blocks: [
          { kind: "faq", q: "A sale was refused because of the discount. What now?", a: ["The message gives the limit, for example **Your role can give discounts up to 5%. This one is 10%.** Lower the discount, or ask someone with a higher limit to make the sale."] },
          { kind: "faq", q: "Is a lower price the same as a discount?", a: ["No. A price typed on a line is not limited. The limit applies to the discount on the whole sale or document."] },
          { kind: "links", articles: ["wholesale-prices-and-credit-limits", "counting-your-stock", "sales-orders-and-deliveries"] },
        ],
      },
      NEED_HELP,
    ],
    related: ["wholesale-prices-and-credit-limits", "counting-your-stock", "sales-orders-and-deliveries"],
  },
  {
    id: "sending-receipts-and-reminders-on-whatsapp",
    title: "Sending receipts and reminders on WhatsApp",
    category: "selling",
    updated: "2026-11-15",
    intro: [
      "Send a customer their receipt or invoice, or remind them about money they owe, on WhatsApp. UzaPro writes the message and opens WhatsApp with it ready; you press send.",
      "**Who can do this:** anyone who can open the sale, the invoice or Receivables.",
    ],
    sections: [
      {
        heading: "Send a receipt or an invoice",
        level: 2,
        blocks: [
          {
            kind: "ol",
            items: [
              "Open the sale under Sales › All sales, the invoice under Sales › Invoices, or the receipt at the till.",
              "Choose **WhatsApp**.",
              "Check the **Phone number** and the **Message**. You can change either.",
              "Choose **Open WhatsApp**, then press send in WhatsApp.",
            ],
          },
          { kind: "p", text: "A receipt lists the items, the total and how it was paid. An invoice gives its number, the amount, the balance due and the due date." },
          { kind: "links", screens: [{ label: "Open Sales › All sales", module: "sales", tab: "all-sales" }, { label: "Open Sales › Invoices", module: "sales", tab: "invoices" }] },
        ],
      },
      {
        heading: "Remind a customer who owes you",
        level: 2,
        blocks: [
          {
            kind: "ol",
            items: [
              "Go to Receivables and open the row menu of an unpaid receivable.",
              "Choose **Send reminder**. The message lists everything that customer still owes, with due dates and the total.",
              "Choose **Open WhatsApp**, then press send in WhatsApp.",
            ],
          },
          { kind: "p", text: "The next time you open the reminder for that customer, UzaPro shows when they were last reminded." },
          { kind: "note", tone: "info", text: "UzaPro opens WhatsApp but does not send the message itself, so it can't tell whether you pressed send." },
          { kind: "links", screens: [{ label: "Open Receivables", module: "rcv", tab: "receivables" }] },
        ],
      },
      {
        heading: "Frequently asked questions",
        level: 2,
        blocks: [
          { kind: "faq", q: "Why is Open WhatsApp greyed out?", a: ["The phone number is missing or is not a mobile number. Enter one, for example **0712 345 678**."] },
          { kind: "faq", q: "Does the customer need to have my number saved?", a: ["No. The message arrives as a normal WhatsApp chat from the phone or computer you sent it from."] },
          { kind: "links", articles: ["recording-a-sale", "sending-an-invoice-and-recording-its-payment"] },
        ],
      },
      NEED_HELP,
    ],
    related: ["recording-a-sale", "sending-an-invoice-and-recording-its-payment", "wholesale-prices-and-credit-limits"],
  },
];
