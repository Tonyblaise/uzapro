(function(){
const T={good:'success',warn:'warning',bad:'danger',info:'info',mut:'neutral'};
const P=(t,c)=>({pill:t,tone:T[c]||'neutral'});
const N=t=>({t,num:true});
window.UZ_POS=[['Carbon Road Frame',34500],['Aluminium Frame',31050],['Bike Pump',345],['Carbon Sole Shoes',4140],['Racing Wheelset',12900],['Helmet',1639],['Groupset',8452],['Muthokinju Paint',467]];
window.UZ_UNITS=['Piece', 'Bag', 'Bale', 'Bottle', 'Box', 'Bundle', 'Can / Tin', 'Carton', 'Case', 'Centilitre', 'Centimetre', 'Crate', 'Day', 'Dozen', 'Each', 'Foot', 'Gram', 'Gross', 'Half Dozen', 'Hectare', 'Hour', 'Jar', 'Kilogram', 'Kilolitre', 'Kilometre', 'Litre', 'Metre', 'Milligram', 'Millilitre', 'Millimetre', 'Minute', 'Month', 'Pack', 'Packet', 'Pair', 'Pallet', 'Punnet', 'Ream', 'Roll', 'Sachet', 'Sack', 'Session', 'Square Centimetre', 'Square Metre', 'Tonne', 'Tray', 'Tube'];
window.UZ_NONTAX=['Bike Pump'];
// Variant: [name, price, cost]
// Product status per product: stock, sell, variants. Missing means on.
window.UZ_PRODFLAGS={};
window.UZ_LOC={branches:['Nairobi HQ','Import'],types:['Store','Manufacturing','Retail','Transfer']};
window.UZ_BIZ={name:'Build by Blaise',logo:'',trading:'',type:'Retail',industry:'Bicycles & Accessories',staff:'1 - 5 staff',email:'info@buildbyblaise.co.ke',phone:'+254 722 410 233',whatsapp:'',website:'',location:'Nairobi HQ',address:'Nairo Court, Mirema Drive',city:'Nairobi',postal:'',pin:'',regNo:'',regDate:'',channels:'In-store and online',customers:'Walk-in customers and businesses'};
// Business structure: groups -> branches -> storage locations, plus POS terminals.
window.UZ_GROUPS=[{name:'Administration',parent:'',code:'BBL-GRP-001'}];
window.UZ_BRANCHES=[{name:'Nairobi HQ',code:'BBL-BRN-001',group:'Administration',phone:'+254 722 410 233',email:'hq@buildbyblaise.co.ke',city:'Nairobi',address:'Nairo Court, Mirema Drive',hq:true},{name:'Import',code:'BBL-BRN-002',group:'Administration',phone:'',email:'',city:'Mombasa',address:'Kilindini Port',hq:false}];
window.UZ_LOCPOS={'Point of Sale':true,'Main Store':true};
window.UZ_TERMS={included:1,purchased:0,price:1000,list:[{id:1,name:'Terminal 1',code:'BBL-TRM-001',branch:'Nairobi HQ',store:'Point of Sale',active:true,added:'22 Oct 2026',main:true}]};
window.UZ_NATIONS=['Kenya','Uganda','Tanzania','Rwanda','Ethiopia','South Africa','China','India','United Arab Emirates'];
window.UZ_SUPDETAIL={};
window.UZ_REFUND={reasons:['Returned goods','Damaged goods','Wrong item','Price adjustment','Overcharged'],methods:['Cash','M-Pesa','Bank transfer','Store credit']};
window.UZ_VOID=['Customer cancelled','Entered by mistake','Wrong amount','Duplicate sale'];
// Account movements shown under Accounts > Transactions. amt is + for money in, - for money out.
window.UZ_LEDGER=[
 {date:'2026-11-01',account:'Equity Bank — Main',ref:'DEP-0218',desc:'Morningview Bicycles payment',kind:'Deposit',amt:45600},
 {date:'2026-11-01',account:'Equity Bank — Main',ref:'WDL-0104',desc:'Rent, Kilimani Properties',kind:'Withdrawal',amt:-185000},
 {date:'2026-10-31',account:'M-Pesa Till',ref:'TRN-0031',desc:'Transfer to Equity Bank — Main',kind:'Transfer',amt:-250000},
 {date:'2026-10-31',account:'Equity Bank — Main',ref:'TRN-0031',desc:'Transfer from M-Pesa Till',kind:'Transfer',amt:250000},
 {date:'2026-10-31',account:'M-Pesa Till',ref:'DEP-0217',desc:'Walk-in sales',kind:'Deposit',amt:18450},
 {date:'2026-10-30',account:'Cash drawer',ref:'DEP-0216',desc:'Walk-in sales',kind:'Deposit',amt:9200},
 {date:'2026-10-30',account:'M-Pesa Till',ref:'WDL-0103',desc:'Electricity, Kenya Power',kind:'Withdrawal',amt:-42300},
 {date:'2026-10-29',account:'Cash drawer',ref:'TRN-0030',desc:'Transfer to Equity Bank — Main',kind:'Transfer',amt:-60000},
 {date:'2026-10-29',account:'Equity Bank — Main',ref:'TRN-0030',desc:'Transfer from Cash drawer',kind:'Transfer',amt:60000},
 {date:'2026-10-28',account:'Cash drawer',ref:'WDL-0102',desc:'Delivery fuel',kind:'Withdrawal',amt:-18650}
];
// Extra details for each account under Accounts > Bank accounts.
window.UZ_ACCDETAIL={'Equity Bank — Main':{branch:'Nairobi HQ',till:'All tills',opening:4500000,branchName:'Westlands',swift:'EQBLKENA',iban:'',active:true},'M-Pesa Till':{branch:'Nairobi HQ',till:'Till 1',opening:200000,branchName:'',swift:'',iban:'',active:true},'Cash drawer':{branch:'Nairobi HQ',till:'Till 1',opening:20000,branchName:'',swift:'',iban:'',active:true}};
window.UZ_BANKS=['Equity Bank','KCB Bank','Co-operative Bank','NCBA Bank','Absa Bank Kenya','Stanbic Bank','Standard Chartered','I&M Bank','Family Bank','DTB Bank','Safaricom M-Pesa','Airtel Money'];
// Extra details for each deposit under Accounts > Deposits.
window.UZ_DEPDETAIL={'DEP-0218':{time:'10:42',fee:0,bankRef:'FT26305XK81',notes:'Payment for invoice INV-0412.',who:'Tony Ashiuma'},'DEP-0217':{time:'18:05',fee:0,bankRef:'',notes:'',who:'Mercy Wanjiru'},'DEP-0216':{time:'17:30',fee:0,bankRef:'',notes:'End of day cash.',who:'Mercy Wanjiru'}};
// Expense categories: name -> settings.
window.UZ_EXPCAT={'Rent':{color:'#2563EB',parent:'',desc:'Shop, office and store rent',budget:200000,approval:false,active:true},'Utilities':{color:'#D97706',parent:'',desc:'Electricity and water',budget:60000,approval:false,active:true},'Transport':{color:'#059669',parent:'',desc:'Fuel, deliveries and fares',budget:40000,approval:false,active:true},'Internet and phone':{color:'#7C3AED',parent:'Utilities',desc:'Fibre, airtime and data',budget:10000,approval:true,active:true},'Salaries and wages':{color:'#DC2626',parent:'',desc:'Staff pay and casual labour',budget:0,approval:true,active:true},'Office supplies':{color:'#0891B2',parent:'',desc:'Stationery and cleaning items',budget:8000,approval:false,active:true},'Security':{color:'#4B5563',parent:'',desc:'Guards and alarm services',budget:30000,approval:false,active:true},'Repairs and maintenance':{color:'#DB2777',parent:'',desc:'Fixing equipment and premises',budget:0,approval:true,active:true}};
// Extra details for expenses and recurring schedules.
window.UZ_EXPDETAIL={'EXP-0043':{branch:'Nairobi HQ',method:'M-Pesa',payRef:'SKD4H2LQ9P'},'EXP-0042':{branch:'Nairobi HQ',method:'Bank transfer',payRef:'FT26305RENT'},'EXP-0041':{branch:'Nairobi HQ',method:'M-Pesa',payRef:'SKA81JQ2ZX'},'EXP-0040':{branch:'Nairobi HQ',method:'Cash',payRef:''}};
window.UZ_RECDETAIL={'REC-0003':{freq:'Monthly',interval:1,day:'1',start:'2026-01-01',end:'',max:'',auto:true,made:10,payee:'Kilimani Properties',method:'Bank transfer',tax:0,reason:'Shop and office rent'},'REC-0002':{freq:'Monthly',interval:1,day:'5',start:'2026-03-05',end:'',max:'',auto:false,made:8,payee:'Safaricom Home Fibre',method:'M-Pesa',tax:897,reason:'Office internet'},'REC-0001':{freq:'Weekly',interval:2,day:'',start:'2026-06-01',end:'',max:'',auto:true,made:11,payee:'Shield Guards Ltd',method:'Cash',tax:0,reason:'Night guard'}};
// Receivables details: raise dates, payment allocation, plans.
window.UZ_RCVDETAIL={'RCV-0012':{raised:'2026-01-28'},'RCV-0011':{raised:'2026-05-01'},'RCV-0010':{raised:'2026-10-20'},'RCV-0008':{raised:'2026-11-05'},'RCV-0009':{raised:'2026-09-01'},'RCV-0007':{raised:'2026-09-10'},'RCV-0006':{raised:'2026-09-01'}};
window.UZ_PAYDETAIL={'PAY-0021':{account:'M-Pesa Till',payRef:'SKH7Q2M1VD',alloc:{'RCV-0010':20000}},'PAY-0020':{account:'Equity Bank — Main',payRef:'FT26275PPL',alloc:{'RCV-0009':12500}},'PAY-0019':{account:'Equity Bank — Main',payRef:'FT26288MGT',alloc:{'RCV-0006':24000,'RCV-0007':30000}}};
window.UZ_PLANDETAIL={'PLN-0003':{count:3,paid:0,freq:'Monthly',start:'2026-11-15'},'PPL-0001':{count:2,paid:0,freq:'Monthly',start:'2026-11-20'}};
window.UZ_SCDETAIL={'SCR-0002':{expires:'2027-02-28',notes:'Credit note from supplier for PRT-0005'}};
// Sales targets. base = sales already counted before today; new sales recorded in the app are added on top.
window.UZ_TARGETS=[{id:1,name:'November store sales',scope:'Whole business',who:'',start:'2026-11-01',end:'2026-11-30',amount:5000000,base:3480000},{id:2,name:'Jane – November',scope:'Staff member',who:'Jane Smith',start:'2026-11-01',end:'2026-11-30',amount:600000,base:452000},{id:3,name:'Nairobi HQ – Q4',scope:'Branch',who:'Nairobi HQ',start:'2026-10-01',end:'2026-12-31',amount:12000000,base:7950000},{id:4,name:'October store sales',scope:'Whole business',who:'',start:'2026-10-01',end:'2026-10-31',amount:4500000,base:4820000}];
window.UZ_WDDETAIL={'WDL-0104':{time:'09:20',fee:105,bankRef:'FT26305RNT1',notes:'November rent.',who:'Tony Ashiuma'},'WDL-0103':{time:'15:40',fee:0,bankRef:'SKB2QX81LM',notes:'',who:'Mary Achieng'},'WDL-0102':{time:'08:10',fee:0,bankRef:'',notes:'Fuel for the delivery van.',who:'Grant Jensen'}};
// Paid expenses per month before November (sample history).
window.UZ_EXPTREND=[['Jun',268000],['Jul',301500],['Aug',284200],['Sep',312800],['Oct',296400]];
window.UZ_TRDETAIL={'TRN-0031':{time:'17:45',fee:33,bankRef:'SKN8Q2TR31',notes:'Weekly M-Pesa sweep to the bank.',who:'Mary Achieng'},'TRN-0030':{time:'16:10',fee:0,bankRef:'',notes:'',who:'Tony Ashiuma'}};
window.UZ_PAYMETHODS=['Cash','M-Pesa','Bank transfer','Cheque','Card'];
window.UZ_VARIANTS={'Carbon Road Frame':[['54cm',34500,19642],['56cm',34500,19642]],'Aluminium Frame':[['54cm',31050,17700],['56cm',31050,17700]],'Bike Pump':[['Standard',345,210]],'Carbon Sole Shoes':[['Size 42',4140,2219],['Size 43',4140,2219]],'Racing Wheelset':[['700c',13800,8280],['650b',12900,7740]],'Helmet':[['Small',1639,980],['Medium',1639,980],['Large',1739,1040]],'Groupset':[['Standard',8452,5300]],'Muthokinju Paint':[['White',467,280],['Red',489,295],['Blue',489,295]]};
// Each variant: [name, price, cost, unit, [more prices as [unit, price, cost]]]
[['Muthokinju Paint',[['Tray',6],['Crate',24]]],['Bike Pump',[['Box',12]]],['Helmet',[['Carton',10]]]].forEach(function(p){window.UZ_VARIANTS[p[0]].forEach(function(v){v[3]='Piece';v[4]=p[1].map(function(u){return [u[0],v[1]*u[1],(v[2]||0)*u[1]];});});});
window.UZ_MODS=[
 {id:'home',sec:'Overview',ic:'house',n:'Dashboard',sub:'Your day at a glance',tabs:[
   {t:'Overview',s:{k:'stats',home:1,items:[['Revenue (MTD)','KES 4.82M','▲ 12.4% vs last month','up'],['Net profit','KES 1.31M','▲ 8.1%','up'],['Open invoices','37','KES 2.9M awaiting'],['Low-stock items','14','needs reorder','down']],charts:[{t:'Sales vs purchases',v:[40,62,55,78,48,90,70,84],l:['Mar','Apr','May','Jun','Jul','Aug','Sep','Oct']},{t:'Cash flow',v:[55,38,70,44,82,60,48,66],l:['Mar','Apr','May','Jun','Jul','Aug','Sep','Oct'],alt:1}]}},
 ]},
 {id:'prod',sec:'Overview',ic:'package',n:'Products',sub:'What you sell and what it costs',tabs:[
   {t:'Overview',s:{k:'prodboard'}},
   {t:'All products',s:{k:'table',cols:[{t:'Product'},{t:'Category'},N('Price'),N('On hand'),{t:'Status'}],rows:[['Carbon Road Frame','Frames','34,500','141',P('Active','good')],['Aluminium Frame','Frames','31,050','170',P('Active','good')],['Carbon Sole Shoes','Apparel','4,140','68',P('Low stock','warn')],['Racing Wheelset','Parts','From 12,900','20',P('Low stock','warn')],['Muthokinju Paint','Acrylic Paints','From 467','12',P('Low stock','warn')],['Bike Pump','Parts','345','58',P('Active','good')],['Helmet','Apparel','From 1,639','44',P('Active','good')],['Groupset','Parts','8,452','30',P('Active','good')]]}},
   {t:'Categories',s:{k:'table',cols:[{t:'Category'},{t:'Description'}],rows:[['Parts','Frames, wheels and components','',''],['Frames','Road and mountain bike frames','','Parts'],['Wheels','Wheelsets, tyres and tubes','','Parts'],['Apparel','Shoes, jerseys and helmets','',''],['Acrylic Paints','Paints sold in store','',''],['Services','Repairs and fitting','','']]}},
   {t:'Units of measure',s:{k:'table',cols:[{t:'Unit'}],rows:[]}},
 ]},
 {id:'inv',sec:'Overview',ic:'boxes',n:'Stock',sub:'What you have and where it is',tabs:[
   {t:'Overview',s:{k:'stockboard'}},
   {t:'Stock management',s:{k:'table',cols:[{t:'Product'},{t:'Store'},N('Quantity'),N('Stock value (KES)')],rows:[]}},
   {t:'Transfer stock',s:{k:'table',cols:[{t:'Ref'},{t:'From'},{t:'To'},N('Items'),{t:'Status'}],rows:[['TRF-0032','Finished Goods','Point of Sale','8',P('In transit','info')],['TRF-0031','Stores','Finished Goods','20',P('Received','good')],['TRF-0030','Main Store','Stores','5',P('Not finished','mut')]]}},
   {t:'Wastage',s:{k:'table',cols:[{t:'Ref'},{t:'Item'},N('Qty'),{t:'Reason'},N('Value')],rows:[['WST-0008','Acrylic Paint','4','Expired','1,868'],['WST-0007','Sole Shoes','1','Damaged','2,219'],['WST-0006','Jersey','2','QC reject','3,100']]}},
   {t:'Warehouses',s:{k:'table',cols:[{t:'Warehouse'},{t:'Branch'},{t:'Type'},N('Items')],rows:[['Main Store','Nairobi HQ','Store','0'],['Finished Goods','Nairobi HQ','Manufacturing','0'],['Stores','Nairobi HQ','Manufacturing','0'],['Point of Sale','Nairobi HQ','Retail','0'],['Goods in Transit','Import','Transfer','0']]}},
 ]},
 {id:'sales',sec:'Sales',ic:'shopping-cart',n:'Sales',sub:'Record sales, send invoices and give refunds',tabs:[
   {t:'Overview',s:{k:'salesdash'}},
   {t:'All sales',s:{k:'table',cols:[{t:'Customer'},{t:'Type'},{t:'Channel'},N('Total'),{t:'Status'}],rows:[['Morningview Bicycles','Tax invoice','In-store','45,600',P('Paid','good')],['Apex Solutions','Sales order','Shopify','158,996',P('Not finished','info')],['Alpha Systems','Invoice','Amazon','53,976',P('Overdue','bad')],['Mountain Goats','Quotation','POS','9,576',P('Pending','warn')]]}},
   {t:'Quotations',s:{k:'table',cols:[{t:'Quotation #'},{t:'Customer'},{t:'Date'},{t:'Status'},N('Amount (KES)')],rows:[['Q-001002','Atlas Services','28 Oct 2026',P('Not finished','mut'),'424'],['Q-001001','Tech Innovators','20 Oct 2026',P('Approved','good'),'48,499']]}},
   {t:'Invoices',s:{k:'table',cols:[{t:'Invoice #'},{t:'Customer'},{t:'Invoice date'},{t:'Due date'},{t:'Status'},N('Amount (KES)'),{t:'Balance due (KES)',num:true,bal:true}],rows:[['INV-0355','Blazing Cycle Trails','1 May 2026','31 May 2026',P('Overdue','bad'),'1,026',{pill:'1,026',sub:'Amount paid: 0'}],['INV-0351','Morningview','28 Jan 2026','27 Feb 2026',P('Pending','warn'),'45,600',{pill:'45,600',sub:'Amount paid: 0'}],['INV-0340','Stateside Cycle','1 Jan 2026','31 Jan 2026',P('Paid','good'),'21,432',{pill:'0',sub:'Amount paid: 21,432'}]]}},
   {t:'Refunds (credit notes)',s:{k:'table',cols:[{t:'Credit note'},{t:'Customer'},{t:'Date'},{t:'Invoice'},{t:'Reason'},N('Amount (KES)'),{t:'Status'}],rows:[['CRN-0007','Morningview','28 Oct 2026','INV-0351','Returned goods','4,560',P('Approved','good')],['CRN-0006','Stateside Cycle','14 Oct 2026','INV-0340','Price adjustment','1,200',P('Not finished','mut')]]}},
   {t:'Voided items',s:{k:'table',cols:[{t:'Void ref'},{t:'Original sale'},{t:'Customer'},{t:'Voided on'},{t:'Reason'},{t:'Voided by'},N('Amount (KES)')],rows:[['VOID-0001','INV-0333','Alpha Systems','22 Oct 2026','Entered by mistake','Tony Ashiuma','12,400']]}},
   {t:'Sales targets',s:{k:'table',cols:[{t:'Target'},{t:'Applies to'},{t:'Period'},N('Target (KES)'),N('Achieved (KES)'),{t:'Progress'},{t:'Status'}],rows:[]}},
 ]},
 {id:'pos',sec:'Sales',ic:'scan-barcode',n:'Point of sale',sub:'Pick a terminal to start selling',tabs:[
   {t:'Terminals',s:{k:'poslaunch'}},
 ]},
 {id:'cust',sec:'Sales',ic:'users',n:'Customers',sub:'The people and businesses you sell to',tabs:[
   {t:'Customers',s:{k:'table',cols:[{t:'Name'},{t:'Phone'},{t:'Email'},{t:'Address'},{t:'Status'}],rows:[['Morningview Bicycles','+254 712 340 118','orders@morningview.example','Westlands, Nairobi',P('Active','good')],['Mountain Goats','+254 733 208 561','hello@mountaingoats.example','Nyali, Mombasa',P('Active','good')],['Walk-in Customer','—','—','—',P('Active','good')]]}},
 ]},
 {id:'buy',sec:'Procurement',ic:'truck',n:'Purchases',sub:'Order from suppliers and receive their goods',tabs:[
   {t:'Overview',s:{k:'buyboard'}},
   {t:'Purchase orders',s:{k:'table',cols:[{t:'Supplier'},{t:'Ref'},N('Total'),{t:'Received'},{t:'Status'}],rows:[['Eastside Bicycle','PUR-ORD-0409','1,368',P('Full','good'),P('Completed','good')],['Magaliesburg Wheels','PUR-ORD-0408','228',P('Partial','warn'),P('To receive','info')],['Croma','PUR-ORD-0372','640,000',P('Full','good'),P('Approved','good')]]}},
   {t:'Goods receipts',s:{k:'table',cols:[{t:'Ref'},{t:'PO'},{t:'Supplier'},{t:'Location'},N('Lines'),{t:'Status'}],rows:[['GRN-0041','PUR-ORD-0409','Eastside Bicycle Supplies','Finished Goods','1',P('Saved','good')],['GRN-0040','PUR-ORD-0408','Magaliesburg Wheels','Stores','2',P('Partial','warn')]]}},
   {t:'Purchase returns',s:{k:'table',cols:[{t:'Ref'},{t:'Supplier'},{t:'Purchase order'},{t:'Goods receipt'},{t:'Reason'},N('Qty'),N('Value (KES)'),{t:'Status'}],rows:[['PRT-0005','Magaliesburg Wheels','PUR-ORD-0408','GRN-0040','Damaged','3','684',P('Approved','good')],['PRT-0004','Eastside Bicycle','PUR-ORD-0409','GRN-0041','Wrong item','2','912',P('Waiting approval','warn')]]}},
   {t:'Rejected items',s:{k:'table',cols:[{t:'Ref'},{t:'Goods receipt'},{t:'Supplier'},{t:'Item'},N('Qty'),{t:'Reason'},{t:'Status'}],rows:[['REJ-0003','GRN-0041','Eastside Bicycle Supplies','Carbon Road Frame · 54cm','1',"Scratched frame",P('Sent back','info')],['REJ-0002','GRN-0040','Magaliesburg Wheels','Racing Wheelset · 700c','1','Wrong size',P('Waiting','warn')]]}},
 ]},
 {id:'vend',sec:'Procurement',ic:'store',n:'Suppliers',sub:'The businesses you buy from',tabs:[
   {t:'Suppliers',s:{k:'table',cols:[{t:'Name'},{t:'Type'},{t:'Phone'},{t:'Email'},{t:'Town or city'},{t:'Status'}],rows:[['Eastside Bicycle Supplies','Business','+254 722 410 233','sales@eastside.example','Nairobi',P('Active','good')],['Magaliesburg Wheels','Business','+254 733 901 442','orders@magaliesburg.example','Thika',P('Active','good')],['Road & Travel Tyres','Business','+254 711 560 317','hello@roadtravel.example','Mombasa',P('Active','good')]]}},
 ]},
 {id:'fin',sec:'Financials',ic:'calculator',n:'Accounts',sub:'Bank accounts, mobile money and cash',tabs:[
   {t:'Bank accounts',s:{k:'table',cols:[{t:'Account'},{t:'Bank or provider'},{t:'Account number'},{t:'Type'},N('Balance (KES)')],rows:[['Equity Bank — Main','Equity Bank','0180 2948 3321','Bank','4,812,300'],['M-Pesa Till','Safaricom','Till 524 118','Mobile money','386,450'],['Cash drawer','—','—','Cash','24,600']]}},
   {t:'Deposits',s:{k:'table',cols:[{t:'Ref'},{t:'Date'},{t:'Account'},{t:'Method'},{t:'Description'},N('Amount (KES)'),{t:'Status'}],rows:[['DEP-0218','1 Nov 2026','Equity Bank — Main','Bank transfer','Morningview Bicycles payment','45,600',P('Cleared','good')],['DEP-0217','31 Oct 2026','M-Pesa Till','M-Pesa','Walk-in sales','18,450',P('Cleared','good')],['DEP-0216','30 Oct 2026','Cash drawer','Cash','Walk-in sales','9,200',P('Cleared','good')]]}},
   {t:'Withdrawals',s:{k:'table',cols:[{t:'Ref'},{t:'Date'},{t:'Account'},{t:'Method'},{t:'Purpose'},{t:'Description'},N('Amount (KES)'),{t:'Status'}],rows:[['WDL-0104','1 Nov 2026','Equity Bank — Main','Bank transfer','Operations','Rent, Kilimani Properties','185,000',P('Completed','good')],['WDL-0103','30 Oct 2026','M-Pesa Till','M-Pesa','Operations','Electricity, Kenya Power','42,300',P('Completed','good')],['WDL-0102','28 Oct 2026','Cash drawer','Cash','Operations','Delivery fuel','18,650',P('Completed','good')]]}},
   {t:'Transfers',s:{k:'table',cols:[{t:'Ref'},{t:'Date'},{t:'From'},{t:'To'},{t:'Description'},N('Amount (KES)'),{t:'Status'}],rows:[['TRN-0031','31 Oct 2026','M-Pesa Till','Equity Bank — Main','Weekly banking','250,000',P('Completed','good')],['TRN-0030','29 Oct 2026','Cash drawer','Equity Bank — Main','Cash banking','60,000',P('Completed','good')]]}},
   {t:'Transactions',s:{k:'table',cols:[{t:'Date'},{t:'Account'},{t:'Reference'},{t:'Description'},N('Amount (KES)')],rows:[]}},
 ]},
 {id:'exp',sec:'Financials',ic:'wallet',n:'Expenses',sub:'Record what the business spends, set up repeat bills and sort spending into categories',tabs:[
   {t:'Overview',s:{k:'expboard'}},
   {t:'Expenses',s:{k:'table',cols:[{t:'Date'},{t:'Reference and reason'},{t:'Branch'},{t:'Category and payee'},{t:'Source account'},N('Net amount'),{t:'Status'}],rows:[['EXP-0043','5 Nov 2026','Internet and phone','Safaricom Home Fibre','M-Pesa Till','Office internet','897','6,500',P('Waiting approval','warn')],['EXP-0042','1 Nov 2026','Rent','Kilimani Properties','Equity Bank — Main','Shop and office rent','0','185,000',P('Paid','good')],['EXP-0041','30 Oct 2026','Utilities','Kenya Power','M-Pesa Till','Electricity','5,834','42,300',P('Paid','good')],['EXP-0040','28 Oct 2026','Transport','TotalEnergies Westlands','Cash drawer','Delivery fuel','2,572','18,650',P('Paid','good')]]}},
   {t:'Recurring',s:{k:'table',cols:[{t:'Ref'},{t:'Name'},{t:'Category'},{t:'Paid from'},N('Amount (KES)'),{t:'Repeats'},{t:'Next date'},{t:'Status'}],rows:[['REC-0003','Monthly shop rent','Rent','Equity Bank — Main','185,000','Every month','1 Dec 2026',P('Active','good')],['REC-0002','Office internet','Internet and phone','M-Pesa Till','6,500','Every month','5 Dec 2026',P('Active','good')],['REC-0001','Night security','Security','Cash drawer','12,000','Every 2 weeks','—',P('Paused','mut')]]}},
   {t:'Voided',s:{k:'table',cols:[{t:'Ref'},{t:'Date'},{t:'Category'},{t:'Payee'},N('Amount (KES)'),{t:'Voided on'},{t:'Voided by'},{t:'Reason'}],rows:[['EXP-0039','25 Oct 2026','Office supplies','Text Book Centre','3,200','26 Oct 2026','Tony Ashiuma','Recorded twice']]}},
   {t:'Expense categories',s:{k:'table',cols:[{t:'Category'},{t:'Parent'},N('Monthly budget (KES)'),N('Spent this month (KES)'),{t:'Needs approval'},{t:'Status'}],rows:[]}},
 ]},
 {id:'rcv',sec:'Financials',ic:'banknote',n:'Receivables',sub:'Money customers owe you, payments, payment plans and credits',tabs:[
   {t:'Receivables',s:{k:'table',cols:[{t:'Ref'},{t:'Customer'},{t:'Type'},{t:'Document'},{t:'Due date'},{t:'Priority'},N('Total (KES)'),N('Paid (KES)'),N('Balance (KES)'),{t:'Status'}],rows:[
     ['RCV-0012','Morningview Bicycles','Invoice','INV-0351','27 Feb 2026','High','45,600','0','',''],
     ['RCV-0011','Blazing Cycle Trails','Invoice','INV-0355','31 May 2026','Normal','1,026','0','',''],
     ['RCV-0010','Mountain Goats','Sale on credit','SAL-1184','19 Nov 2026','Normal','68,400','20,000','',''],
     ['RCV-0008','Mountain Goats','Invoice','INV-0362','5 Dec 2026','Normal','32,000','0','',''],
     ['RCV-0009','Pedal Point Ltd','Opening balance','—','30 Sep 2026','Low','12,500','12,500','',''],
     ['RCV-0007','Mountain Goats','Invoice','INV-0344','10 Oct 2026','Normal','30,000','30,000','',''],
     ['RCV-0006','Mountain Goats','Invoice','INV-0341','1 Oct 2026','Normal','24,000','24,000','','']]}},
   {t:'Payments',s:{k:'table',cols:[{t:'Ref'},{t:'Date'},{t:'Customer'},{t:'Receivables'},{t:'Method'},{t:'Type'},N('Amount (KES)'),{t:'Verification'}],rows:[
     ['PAY-0021','8 Nov 2026','Mountain Goats','RCV-0010','M-Pesa','Single','20,000',P('Verified','good')],
     ['PAY-0020','2 Oct 2026','Pedal Point Ltd','RCV-0009','Bank transfer','Single','12,500',P('Verified','good')],
     ['PAY-0019','15 Oct 2026','Mountain Goats','RCV-0006, RCV-0007','Bank transfer','Bulk','54,000',P('Verified','good')]]}},
   {t:'Payment plans',s:{k:'table',cols:[{t:'Ref'},{t:'Customer'},{t:'Receivable'},N('Total (KES)'),{t:'Instalments'},N('Each (KES)'),{t:'Next due'},{t:'Status'}],rows:[
     ['PLN-0003','Morningview Bicycles','RCV-0012','45,600','','15,200','',P('Active','good')]]}},
   {t:'Customer credits',s:{k:'table',cols:[{t:'Ref'},{t:'Customer'},{t:'Reason'},{t:'Issued'},N('Amount (KES)'),N('Used (KES)'),N('Left (KES)'),{t:'Status'}],rows:[
     ['CRD-0004','Mountain Goats','Returned faulty inner tubes','3 Nov 2026','4,800','0','',''],
     ['CRD-0003','Morningview Bicycles','Goodwill discount','12 Sep 2026','2,000','2,000','','']]}},
   {t:'Bulk payments',s:{k:'table',cols:[{t:'Ref'},{t:'Date'},{t:'Customer'},{t:'Receivables paid'},{t:'Method'},N('Amount (KES)')],rows:[]}},
   {t:'Receivables statement',s:{k:'table',cols:[{t:'Customer'},N('Open'),N('Not yet due'),N('1–30 days'),N('31–60 days'),N('61–90 days'),N('Over 90 days'),N('Total due (KES)')],rows:[]}},
 ]},
 {id:'pay',sec:'Financials',ic:'landmark',n:'Payables',sub:'Money you owe suppliers, approvals, payments, payment plans and supplier credits',tabs:[
   {t:'Payables',s:{k:'table',cols:[{t:'Ref'},{t:'Supplier'},{t:'Type'},{t:'Branch'},{t:'Due date'},{t:'Priority'},N('Total (KES)'),N('Balance (KES)'),{t:'Approval'},{t:'Status'}],rows:[
     ['PYB-0014','Eastside Bicycle Supplies','Purchase order','PUR-ORD-0409','Nairobi HQ','20 Nov 2026','Normal','79,560','0','',P('Approved','good'),''],
     ['PYB-0013','Magaliesburg Wheels','Purchase order','PUR-ORD-0408','Nairobi HQ','25 Oct 2026','High','34,200','10,000','',P('Approved','good'),''],
     ['PYB-0012','Road & Travel Tyres','Bill','BILL-2231','Import','30 Nov 2026','Low','12,800','0','',P('Waiting approval','warn'),''],
     ['PYB-0011','Eastside Bicycle Supplies','Purchase order','PUR-ORD-0401','Nairobi HQ','15 Oct 2026','Normal','45,000','45,000','',P('Approved','good'),''],
     ['PYB-0010','Eastside Bicycle Supplies','Opening balance','—','Nairobi HQ','30 Sep 2026','Normal','8,000','8,000','',P('Approved','good'),'']]}},
   {t:'Payments',s:{k:'table',cols:[{t:'Ref'},{t:'Date'},{t:'Supplier'},{t:'Payables'},{t:'Method'},{t:'Type'},N('Amount (KES)'),{t:'Verification'}],rows:[
     ['VPMT-0008','6 Nov 2026','Magaliesburg Wheels','PYB-0013','Cash','Single','10,000',P('Unverified','warn')],
     ['VPMT-0007','20 Oct 2026','Eastside Bicycle Supplies','PYB-0010, PYB-0011','Bank transfer','Bulk','53,000',P('Verified','good')]]}},
   {t:'Bulk payments',s:{k:'table',cols:[{t:'Ref'},{t:'Date'},{t:'Supplier'},{t:'Payables paid'},{t:'Method'},N('Amount (KES)')],rows:[]}},
   {t:'Supplier credits',s:{k:'table',cols:[{t:'Ref'},{t:'Supplier'},{t:'Source'},{t:'Issued'},N('Amount (KES)'),N('Used (KES)'),N('Left (KES)'),{t:'Status'}],rows:[
     ['SCR-0002','Magaliesburg Wheels','Returned damaged wheels (PRT-0005)','4 Nov 2026','684','0','','']]}},
   {t:'Supplier ageing',s:{k:'table',cols:[{t:'Supplier'},N('Open'),N('Not yet due'),N('1–30 days'),N('31–60 days'),N('61–90 days'),N('Over 90 days'),N('Total owed (KES)')],rows:[]}},
   {t:'Payment plans',s:{k:'table',cols:[{t:'Ref'},{t:'Supplier'},{t:'Payable'},N('Total (KES)'),{t:'Instalments'},N('Each (KES)'),{t:'Next due'},{t:'Status'}],rows:[
     ['PPL-0001','Eastside Bicycle Supplies','PYB-0014','79,560','','39,780','',P('Active','good')]]}},
 ]},
 {id:'rep',sec:'Financials',ic:'chart-column',n:'Reports',sub:'See how the business is doing',tabs:[
   {t:'Popular',s:{k:'cards',items:[['Sales summary'],['Profit & loss'],['Balance sheet'],['Stock valuation'],['VAT return'],['Customer statements'],['Purchase analysis'],['Production yield']]}},
   {t:'Sales',s:{k:'cards',items:[['Sales summary'],['Sales by product'],['Sales by customer'],['Sales by channel'],['Returns & refunds'],['Sales targets']]}},
   {t:'Money',s:{k:'cards',items:[['Profit & loss'],['Balance sheet'],['Trial balance'],['Cash flow'],['VAT return'],['Aged receivables']]}},
   {t:'Stock',s:{k:'cards',items:[['Stock valuation'],['Stock movement'],['Low stock'],['Wastage'],['Reorder forecast']]}},
   {t:'Build a report',s:{k:'form',fields:[['Report name','Weekly sales by rep','ph'],['Data source','Sales'],['Columns','Rep, Net sales, Orders, Margin','ph',1],['Group by','Sales rep'],['Date range','This month'],['Schedule','Every Monday 8am']]}},
   {t:'Sent automatically',s:{k:'table',cols:[{t:'Report'},{t:'Cadence'},{t:'Recipients'},{t:'Status'}],rows:[['Daily sales','Daily 6pm','Owner',P('Active','good')],['Weekly P&L','Mon 8am','Finance',P('Active','good')]]}},
 ]},
 {id:'ppl',sec:'People',ic:'users',n:'Team',sub:'The people who work for you',tabs:[
   {t:'Team',s:{k:'table',cols:[{t:'Name'},{t:'Role'},{t:'Branch'},{t:'Status'}],rows:[['Tony Ashiuma','Owner / Admin','Nairobi HQ',P('Active','good')],['Grant Jensen','Store keeper','Nairobi HQ',P('Active','good')],['Mary Achieng','Accountant','Nairobi HQ',P('Active','good')],['Jane Smith','Cashier','New Jersey',P('Active','good')]]}},
 ]},
 {id:'perm',sec:'People',ic:'sliders-horizontal',n:'Permissions',sub:'What each role can see and do',tabs:[
   {t:'Permissions',s:{k:'table',cols:[{t:'Role'},N('Users'),{t:'Modules'},{t:'Scope'}],rows:[['Owner / Admin','1','All',P('Full','good')],['Accountant','2','Finance + reports',P('Edit','info')],['Cashier','4','Sales (POS) + customers',P('Limited','warn')],['Store / Inventory','3','Inventory + products',P('Edit','info')]]}},
 ]},
 {id:'cal',sec:'Office',ic:'calendar',n:'Calendar',sub:'What’s coming up for the business',tabs:[
   {t:'Calendar',s:{k:'calendar'}},
 ]},
 {id:'comm',sec:'Office',ic:'mail',n:'Messages',sub:'Send SMS, email and WhatsApp',tabs:[
   {t:'Send message',s:{k:'form',fields:[['Channel','SMS'],['Audience','Customers · 248 recipients'],['Template','Order ready'],['Send','Now'],['Message','Hi {{name}}, your order {{ref}} is ready for pickup.','ph',1]]}},
   {t:'Saved messages',s:{k:'table',cols:[{t:'Template'},{t:'Channel'},{t:'Variables'},{t:'Status'}],rows:[['Order ready','SMS','name, ref',P('Active','good')],['Invoice due','Email','name, amount, due',P('Active','good')],['Welcome','WhatsApp','name',P('Not finished','mut')]]}},
   {t:'Sent messages',s:{k:'table',cols:[{t:'Sent'},{t:'Channel'},{t:'Audience'},N('Delivered'),{t:'Status'}],rows:[['31 Oct 09:12','SMS','248','242',P('Delivered','good')],['30 Oct 16:40','Email','1,204','1,180',P('Delivered','good')]]}},
   {t:'Campaigns',s:{k:'table',cols:[{t:'Campaign'},{t:'Segment'},N('Sent'),N('Clicks'),{t:'Status'}],rows:[['Back to school','All customers','4,200','312',P('Done','good')],['Black Friday','Gold + Silver','—','—',P('Scheduled','info')]]}},
   {t:'Scheduled',s:{k:'table',cols:[{t:'Scheduled for'},{t:'Channel'},{t:'Template'},{t:'Status'}],rows:[['24 Nov 08:00','SMS','Black Friday',P('Queued','warn')],['01 Nov 09:00','Email','Statement reminder',P('Queued','warn')]]}},
 ]},
 {id:'docs',sec:'Office',ic:'folder',n:'File Manager',sub:'Company files, organised by folder',tabs:[
   {t:'All documents',s:{k:'docs'}},
 ]},
 {id:'sup',sec:'Office',ic:'circle-help',n:'Help',sub:'Get answers and ask for help',tabs:[
   {t:'Ask UzaPro',s:{k:'chat'}},
   {t:'How-to guides',s:{k:'table',cols:[{t:'Article'},{t:'Category'},N('Views'),{t:'Status'}],rows:[['Setting up a POS terminal','Getting started','1,240',P('Published','good')],['How to give a refund','Sales','860',P('Published','good')],['Reconciling a bank feed','Finance','540',P('Not finished','mut')]]}},
   {t:'Help requests',s:{k:'table',cols:[{t:'Ticket'},{t:'Subject'},{t:'Priority'},{t:'Status'}],rows:[['TKT-1042','POS printer not connecting',P('High','bad'),P('Open','info')],['TKT-1041','Stock count mismatch',P('Medium','warn'),P('In progress','info')],['TKT-1038','Invoice email not sending',P('Low','mut'),P('Resolved','good')]]}},
   {t:'Response times',s:{k:'table',cols:[{t:'Priority'},{t:'Respond in'},{t:'Resolve in'},N('Met')],rows:[['High','1 hour','4 hours','88%'],['Medium','4 hours','1 day','94%'],['Low','1 day','3 days','97%']]}},
 ]},
 {id:'prof',sec:'Account',ic:'users',n:'Profile',sub:'Your personal details, photo and password',tabs:[
   {t:'Profile',s:{k:'profile'}},
 ]},
 {id:'set',sec:'Account',ic:'settings',n:'Settings',sub:'Your business, branches, terminals and staff logins',tabs:[
   {t:'Business profile',s:{k:'bizprofile'}},
   {t:'Branches',s:{k:'table',cols:[{t:'Group'},{t:'Branch'},{t:'City'},{t:'Phone'},N('Storage locations'),{t:'Status'}],rows:[]}},
   {t:'Location groups',s:{k:'table',cols:[{t:'Parent group'},{t:'Group'},N('Branches'),N('Sub-groups')],rows:[]}},
   {t:'Storage locations',s:{k:'table',cols:[{t:'Branch'},{t:'Storage location'},{t:'Type'},{t:'Sales'}],rows:[]}},
   {t:'Terminals',s:{k:'terminals'}},
   {t:'Staff logins',s:{k:'table',cols:[{t:'User'},{t:'Role'},{t:'Branch'},{t:'Status'}],rows:[['Tony Ashiuma','Owner / Admin','Nairobi HQ',P('Active','good')],['Grant Jensen','Store keeper','Nairobi HQ',P('Active','good')],['Mary Achieng','Accountant','Nairobi HQ',P('Active','good')],['Jane Smith','Cashier','New Jersey',P('Active','good')]]}},
   {t:'Taxes',s:{k:'table',cols:[{t:'Tax'},N('Rate'),{t:'Type'},{t:'Status'}],rows:[['VAT','16%','Sales + purchase',P('Active','good')],['Zero-rated','0%','Sales',P('Active','good')],['Exempt','—','Sales',P('Active','good')]]}},
   {t:'Connected apps',s:{k:'table',cols:[{t:'Integration'},{t:'Type'},{t:'Status'}],rows:[['M-Pesa','Payments',P('Connected','good')],['Shopify','Sales channel',P('Connected','good')],['SMS gateway','Messaging',P('Connected','good')],['Amazon','Sales channel',P('Connected','good')]]}},
   {t:'Import and export',s:{k:'form',fields:[['Action','Import'],['Record type','Products'],['File','products.csv','ph'],['Mapping','Auto-detected'],['Mode','Create & update'],['Notes','Dry run first','ph',1]]}},
 ]},
];

// What each person sees. mods: sections shown. tabs: limits a section to these tabs.
// noMore: sections that show every tab with no More button.
// tasks: [title, description, icon, section, tab]. attention: [text, detail, tone, section, tab].
const ALERTS={
 owed:['9 customers are late paying','KES 3.2M to collect','bad','fin','Deposits'],
 low:['14 items are running low','Order more before they run out','warn','inv','Stock management'],
 vat:['VAT of KES 164K is due on 20 Nov','October return','warn','fin','Withdrawals'],
 bank:['18 bank payments to check','Match them to your records','warn','fin','Transactions'],
 bill:['Road & Travel Tyres bill is late','KES 1,918, was due 31 Oct','bad','fin','Withdrawals'],
 part:['1 delivery is only partly received','PUR-ORD-0408, Magaliesburg Wheels','warn','buy','Goods receipts'],
 quote:['8 quotations are waiting on customers','KES 420K','warn','sales','Quotations'],
};
window.UZ_ROLES={
 owner:{label:'Owner',name:'Tony Ashiuma',role:'Owner',first:'Tony',
  tasks:[['New sale','Record a sale','shopping-cart','sales','All sales','new'],['Send an invoice','Bill a customer','receipt','sales','Invoices','invoice'],['Stock in','Record a delivery','boxes','inv','Stock management','stock'],['Pay a supplier','See bills to pay','banknote','fin','Withdrawals']],
  attention:[ALERTS.owed,ALERTS.low,ALERTS.vat,ALERTS.bank]},
 accountant:{label:'Accountant',name:'Mary Achieng',role:'Accountant',first:'Mary',figures:1,mods:['home','cal','sales','cust','vend','buy','fin','exp','rcv','pay','rep','ppl','docs','sup'],tabs:{home:['Overview'],sales:['Overview','All sales','Invoices','Refunds (credit notes)','Voided items','Sales targets'],buy:['Overview','Purchase orders','Purchase returns','Rejected items']},
  tasks:[['Send an invoice','Bill a customer','receipt','sales','Invoices','invoice'],['Pay a supplier','See bills to pay','banknote','fin','Withdrawals'],['Check the bank','Match payments','calculator','fin','Transactions'],['Prepare VAT','October return','file-text','fin','Withdrawals']],
  attention:[ALERTS.bank,ALERTS.vat,ALERTS.owed,ALERTS.bill]},
 cashier:{label:'Cashier',name:'Jane Smith',role:'Cashier',first:'Jane',mods:['home','cal','sales','pos','cust','inv','sup'],tabs:{home:['Overview'],cust:['Customers'],sales:['All sales','Refunds (credit notes)'],inv:['Stock management'],sup:['Ask UzaPro','How-to guides']},
  tasks:[['New sale','Record a sale','shopping-cart','sales','All sales','new'],['Give a refund','Return an item','refresh-cw','sales','Refunds (credit notes)','credit'],['Find a customer','Look up details','user','cust','Customers'],['Check stock','See what’s left','boxes','inv','Stock management']],
  attention:[ALERTS.low]},
 store:{label:'Store keeper',name:'Grant Jensen',role:'Store keeper',first:'Grant',mods:['home','cal','vend','inv','prod','buy','docs','sup'],tabs:{home:['Overview'],buy:['Purchase orders','Goods receipts','Purchase returns','Rejected items'],sup:['Ask UzaPro','How-to guides']},
  tasks:[['Stock in','Record a delivery','truck','inv','Stock management','stock'],['Transfer stock','Between stores','boxes','inv','Transfer stock','transfer'],['Record wastage','Damaged, expired or lost','circle-alert','inv','Wastage','waste']],
  attention:[ALERTS.low,ALERTS.part]},
};

// Buying overview. Order, request and receipt counts are read from the Buying lists.
window.UZ_BUY={
 leadTime:'6d',rejected:2,spendDelta:'▲ 14.6% vs last month',
 orders:{l:['May','Jun','Jul','Aug','Sep','Oct'],v:[2,3,1,4,3,2],max:5},
 spend:{l:['May','Jun','Jul','Aug','Sep','Oct'],v:[410,520,480,610,560,642],max:800,step:200},
 onTime:{'Croma':96,'Eastside Bicycle':92,'Magaliesburg Wheels':74}
};

// Home overview. Amounts in KES unless a row says otherwise.
window.UZ_HOME={
 banners:[['Today sales','KES 184K','var(--green-600)','file-text'],['This week sales','KES 1.12M','var(--grey-900)','refresh-cw'],['This month sales','KES 4.82M','#C2570C','calendar'],['Annual sales','KES 38.6M','var(--info)','chart-column']],
 kpis:[['Total revenue','KES 4.82M','▲ 12.4% vs last 30 days'],['Total expenses','KES 3.51M','▲ 4.2% vs last 30 days'],['Net profit','KES 1.31M','▲ 8.1% after adjustments'],['Customers','1,233','▲ 2.1% active'],['Suppliers','18','on record'],['Stock value','KES 2.65M','inventory valuation'],['Low stock items','14','restock signals']],
 compare:{l:['May','Jun','Jul','Aug','Sep','Oct'],a:[3.1,3.4,3.9,4.1,4.29,4.82],b:[2.1,2.3,2.8,2.6,3.0,3.4],max:5,aName:'Sales',bName:'Purchases'},
 cash:{l:['May','Jun','Jul','Aug','Sep','Oct'],a:[3.3,3.6,4.1,4.3,4.5,5.0],b:[2.6,2.9,3.2,3.1,3.4,3.7],max:6,aName:'Inflow',bName:'Outflow'},
 expenses:[['Rent, Nairobi HQ','Expense, 1 Nov 2026','185,000'],['Electricity','Expense, 30 Oct 2026','42,300'],['Delivery fuel','Expense, 28 Oct 2026','18,650']],
 stock:{turnover:'18%',soldToday:12,low:'14',out:'3'},
 customers:[['New this month',26],['Returning',412],['On credit',18]],
 payments:[['M-Pesa',2410000],['Cash',1230000],['Card',720000],['Bank transfer',460000]],
 suppliers:[['Eastside Bicycle Supplies',14,1921482],['WholeCycle Wholesales',9,992525],['Road & Travel Tyres',6,333973],['Magaliesburg Wheels',4,228000]]
};

// Sales overview, this month unless a card says otherwise. Rows: [name, orders or units, amount in KES].
window.UZ_SALES={
 kpis:[['Today’s sales','KES 184K','▲ 6% vs yesterday'],['Monthly revenue','KES 4.82M','▲ 12.4% vs last month'],['Average order value','KES 4,380','▲ 3% vs last month'],['Total customers','1,233','▲ 2.1% new this month']],
 channels:[['POS',2050000],['Invoice',1330000],['Ecommerce',1440000]],
 orders:{total:'1,100',returns:'12',voids:'3',free:'5'},
 trend:{l:['May','Jun','Jul','Aug','Sep','Oct'],v:[3.1,3.4,3.9,4.1,4.29,4.82],max:5},
 categories:[['Parts',2620000],['Apparel',1240000],['Acrylic Paints',580000],['Services',380000]],
 boards:[
  {t:'Sales by area',h:'Area',n:'Orders',rows:[['Nairobi',598,2620000],['Mombasa',192,840000],['Kiambu',119,520000],['Kisumu',105,460000],['Nakuru',86,380000]]},
  {t:'Top products',h:'Product',n:'Sold',rows:[['Carbon Road Frame',38,1311000],['Aluminium Frame',26,807300],['Racing Wheelset',41,565800],['Carbon Sole Shoes',96,397440],['Helmet',120,196680],['Groupset',22,185944]]},
  {t:'Top customers',h:'Customer',n:'Orders',rows:[['Walk-in customers',640,1420000],['Apex Solutions',12,1167000],['Morningview Bicycles',18,612400],['Alpha Systems',7,286000],['Tech Innovators',5,198500],['Mountain Goats',9,96000]]},
  {t:'Top branches',h:'Branch',n:'Orders',rows:[['Nairobi HQ',762,3340000],['New Jersey',196,860000],['New York',142,620000]]},
  {t:'Top sales staff',h:'Staff',n:'Orders',rows:[['Peter Roadie',276,1210000],['Jane Smith',192,840000]]},
  {t:'Top campaigns',h:'Campaign',n:'Orders',rows:[['Back to school',96,420000]]},
  {t:'How campaigns reached them',h:'Sent by',n:'Orders',rows:[['SMS',58,248000],['Email',38,172000]]},
 ]
};

// Products overview, this month. Rows: [name, units sold, amount in KES].
const PR=[['Carbon Road Frame',38,1311000],['Aluminium Frame',26,807300],['Racing Wheelset',41,565800],['Carbon Sole Shoes',96,397440],['Helmet',120,196680],['Groupset',22,185944],['Custom Jersey',84,126000],['Bike Pump',210,72450],['Muthokinju Paint',140,65380],['Skateboard',18,54000]];
// Products dashboard: units sold per month and when each product was added.
window.UZ_PRODTREND=[['Jun',540],['Jul',610],['Aug',580],['Sep',720],['Oct',760],['Nov',795]];
window.UZ_PRODADDED={'Groupset':['31 Oct 2026, 13:43','Tony Ashiuma','2026-10-31T13:43'],'Helmet':['24 Oct 2026, 10:12','Grant Jensen','2026-10-24T10:12'],'Bike Pump':['18 Oct 2026, 16:05','Grant Jensen','2026-10-18T16:05'],'Muthokinju Paint':['12 Oct 2026, 09:30','Tony Ashiuma','2026-10-12T09:30'],'Racing Wheelset':['2 Oct 2026, 11:20','Grant Jensen','2026-10-02T11:20'],'Carbon Sole Shoes':['21 Sep 2026, 15:02','Grant Jensen','2026-09-21T15:02'],'Aluminium Frame':['8 Sep 2026, 10:40','Tony Ashiuma','2026-09-08T10:40'],'Carbon Road Frame':['1 Sep 2026, 09:05','Tony Ashiuma','2026-09-01T09:05']};
window.UZ_PRODUCTS={
 highlights:[['Best seller','Bike Pump','210 sold'],['Best category','Parts','337 sold']],
 bars:[
  {t:'Sales by product',sub:'KES, this month',max:1500000,step:500000,rows:PR.map(r=>[r[0],r[2]])},
  {t:'Units sold by product',sub:'This month',max:250,step:50,rows:PR.map(r=>[r[0],r[1]]).sort((a,b)=>b[1]-a[1])},
 ],
 categories:[['Parts',2620000],['Apparel',1240000],['Acrylic Paints',580000],['Services',380000]],
 boards:[{t:'Best selling products',h:'Product',n:'Sold',rows:PR.slice(0,6)}]
};

// Calendar. Type is Accounts, Work, Stock or Marketing. Money events show only to the owner and accountant.
window.UZ_EVENTS=[
 ['2026-10-31','','Road & Travel Tyres bill due','Accounts','KES 1,918'],
 ['2026-11-01','09:00','Statement reminder email','Marketing','Goes to all customers with a balance'],
 ['2026-11-10','10:00','Stock count at Point of Sale','Stock','CNT-0015'],
 ['2026-11-12','14:00','Team meeting','Work',''],
 ['2026-11-18','','Purchase machinery due','Work','Store launch project'],
 ['2026-11-20','','VAT return due','Accounts','KES 164K to pay for October'],
 ['2026-11-24','08:00','Black Friday SMS goes out','Marketing','Gold and Silver customers'],
 ['2026-11-25','','Plan launch event due','Work','Store launch project'],
 ['2026-11-30','','Staff pay day','Accounts',''],
 ['2026-12-31','','Eastside Bicycle bill due','Accounts','KES 1,368'],
].map((e,i)=>({id:'e'+i,date:e[0],time:e[1],title:e[2],type:e[3],notes:e[4]}));

// Stock overview. categories: [name, share of stock value %].
window.UZ_STOCK={
 low:[['Carbon Frame','Finished Goods','135','40',P('Healthy','good')],['Skateboard','Stores','35','50',P('Low','warn')],['Knee pads','Stores','0','10',P('Buy more','warn')],['Laser Printer','Office','0','5',P('Out','bad')]],
 moves:[['9 Nov 2026','Carbon Road Frame','56cm',P('Sold','info'),'Main Store','−2','15','Jane Smith','SAL-001182'],['6 Nov 2026','Carbon Road Frame','54cm',P('Sold','info'),'Main Store','−1','18','Tony Ashiuma','INV-0362'],['2 Nov 2026','Carbon Road Frame','54cm',P('Sold','info'),'Finished Goods','−3','127','Jane Smith','SAL-001171'],['31 Oct 2026','Bike Pump','Standard',P('Sold','info'),'Point of Sale','−2','58','Jane Smith','SAL-001168'],['31 Oct 2026','Carbon Road Frame','54cm',P('Moved out','mut'),'Finished Goods','−8','135','Grant Jensen','TRF-0032'],['30 Oct 2026','Helmet','Medium',P('Sold','info'),'Point of Sale','−1','44','Jane Smith','SAL-001163'],['29 Oct 2026','Carbon Road Frame','54cm',P('Received','good'),'Finished Goods','+50','143','Grant Jensen','GRN-0041'],['28 Oct 2026','Groupset','Standard',P('Counted','warn'),'Stores','−3','27','Grant Jensen','CNT-0014'],['28 Oct 2026','Muthokinju Paint','White',P('Damaged or lost','bad'),'Stores','−4','0','Grant Jensen','WST-0008'],['27 Oct 2026','Carbon Sole Shoes','Size 42',P('Damaged or lost','bad'),'Stores','−1','68','Grant Jensen','WST-0007'],['26 Oct 2026','Aluminium Frame','56cm',P('Moved in','mut'),'Finished Goods','+20','165','Grant Jensen','TRF-0031']],
 transfers:{'TRF-0032':{date:'2026-10-31',notes:'',rows:[{key:'Carbon Road Frame · 54cm',qty:'8',unit:'Piece'}]},'TRF-0031':{date:'2026-10-26',notes:'',rows:[{key:'Aluminium Frame · 56cm',qty:'20',unit:'Piece'}]},'TRF-0030':{date:'2026-10-24',notes:'Weekly resupply',rows:[{key:'Bike Pump · Standard',qty:'5',unit:'Piece'}]}},
 lines:[['Carbon Road Frame','Finished Goods',100],['Carbon Road Frame','Main Store',35],['Aluminium Frame','Main Store',165],['Carbon Sole Shoes','Main Store',40],['Carbon Sole Shoes','Point of Sale',28],['Racing Wheelset','Main Store',16],['Muthokinju Paint','Main Store',0],['Bike Pump','Main Store',30],['Bike Pump','Point of Sale',28],['Helmet','Point of Sale',44],['Carbon Road Frame','Point of Sale',6],['Aluminium Frame','Point of Sale',5],['Racing Wheelset','Point of Sale',4],['Muthokinju Paint','Point of Sale',12],['Groupset','Point of Sale',3],['Groupset','Stores',27]],
 kpis:[['Total stock value','KES 2.65M','Live valuation'],['Low stock items','14','Needs attention'],['Total products in stock','248','Active items']],
 week:{l:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],inn:[12,0,20,0,50,8,0],out:[6,9,4,12,8,10,3],max:60,step:20},
 categories:[['Parts',58],['Apparel',24],['Acrylic Paints',12],['Services',6]]
};

// Folder: id, name, parent id, who has access. 'company' is the top level.
// File: name, folder id, size in KB, modified, owner, linked record.
const FIN='Owner, Accountant',ALL='All staff',MGT='Owner only';
window.UZ_DOCS={
 folders:[['sales','Sales','finance',FIN],['purchase','Purchase','finance',FIN],['bank','Bank','finance',FIN],['misc','Miscellaneous','finance',FIN],['sign','Sign','company',ALL],['projects','Projects','company',ALL],['products','Products','company',ALL],['employees','Employees','company',MGT],['contracts','Contracts','legal',MGT],['registrations','Registrations','legal',MGT],['loans','Loans','legal',MGT],['insurances','Insurances','legal',MGT],['legal','Legal','company',MGT],['marketing','Marketing','company',ALL],['y2026','2026','closing',FIN],['closing','Annual Closing','finance',FIN],['taxes','Taxes','finance',FIN],['social','Social','finance',FIN],['finance','Finance','company',FIN],['inbox','Inbox','company',ALL],['admin','Admin','company',MGT]]
  .map(f=>({id:f[0],name:f[1],parent:f[2],access:f[3]})),
 files:[
  ['Scanned receipt.jpg','inbox',1840,'2026-10-31','Jane Smith','—'],
  ['Bank statement Oct 2026.pdf','bank',412,'2026-10-31','Tony Ashiuma','—'],
  ['VAT return Oct 2026.pdf','taxes',236,'2026-10-30','Tony Ashiuma','—'],
  ['NSSF and SHIF remittance Oct 2026.pdf','social',188,'2026-10-29','Tony Ashiuma','—'],
  ['INV-0351.pdf','sales',96,'2026-10-28','Jane Smith','INV-0351'],
  ['PUR-ORD-0409.pdf','purchase',104,'2026-10-27','Grant Jensen','PUR-ORD-0409'],
  ['Trial balance Oct 2026.xlsx','y2026',64,'2026-10-26','Tony Ashiuma','—'],
  ['Price list Q4.xlsx','products',88,'2026-10-20','Grant Jensen','—'],
  ['Black Friday campaign brief.docx','marketing',52,'2026-10-18','Jane Smith','Black Friday'],
  ['Store launch budget.xlsx','projects',72,'2026-10-15','Grant Jensen','Store launch'],
  ['Eastside supplier agreement.pdf','contracts',1320,'2026-09-22','Tony Ashiuma','Eastside Bicycle Supplies'],
  ['Stock and fire policy 2026.pdf','insurances',2210,'2026-08-14','Tony Ashiuma','—'],
  ['Asset finance facility.pdf','loans',980,'2026-06-03','Tony Ashiuma','—'],
  ['Staff handbook.pdf','employees',3120,'2026-03-11','Tony Ashiuma','—'],
  ['Single business permit 2026.pdf','registrations',340,'2026-01-19','Tony Ashiuma','—'],
  ['Nairobi HQ lease.pdf','contracts',1760,'2025-12-02','Tony Ashiuma','Nairobi HQ'],
  ['KRA PIN certificate.pdf','registrations',128,'2024-02-08','Tony Ashiuma','—'],
  ['Certificate of incorporation.pdf','registrations',276,'2024-01-15','Tony Ashiuma','—'],
  ['Signed NDA template.pdf','sign',144,'2025-07-21','Tony Ashiuma','—'],
 ].map((f,i)=>({id:'f'+i,name:f[0],folder:f[1],kb:f[2],modified:f[3],owner:f[4],link:f[5]}))
};

// Searchable dropdown with a "New" action at the bottom. onChange receives { target: { value } }.
// onCreate(name) adds the option and returns its value.
window.UzForms={SearchSelect:function(props){
 const R=window.React,h=R.createElement,DS=window.UzapointDesignSystem_dfe583;
 const {label,options=[],value,onChange,onCreate,onNew,noun='item'}=props;
 const opts=options.map(o=>typeof o==='string'?{value:o,label:o}:o);
 const [own,setOwn]=R.useState(opts[0]&&opts[0].value);
 const cur=value!==undefined?value:own;
 const [open,setOpen]=R.useState(false),[q,setQ]=R.useState(''),[adding,setAdding]=R.useState(false),[name,setName]=R.useState(''),[active,setActive]=R.useState(0),[pos,setPos]=R.useState(null);
 const root=R.useRef(null),panel=R.useRef(null),btn=R.useRef(null),search=R.useRef(null);
 const close=()=>{setOpen(false);setQ('');setAdding(false);setName('');setActive(0);};
 const pick=v=>{setOwn(v);if(onChange)onChange({target:{value:v}});close();if(btn.current)btn.current.focus();};
 const create=n=>{const t=(n||'').trim();if(!t||!onCreate)return;pick(onCreate(t));};
 const toggle=()=>{
  if(open){close();return;}
  const r=btn.current.getBoundingClientRect(),H=320,up=window.innerHeight-r.bottom<H&&r.top>H;
  setPos({left:r.left,width:r.width,top:up?undefined:r.bottom+4,bottom:up?window.innerHeight-r.top+4:undefined});
  setOpen(true);
 };
 R.useEffect(()=>{
  if(!open)return;
  if(search.current)search.current.focus();
  const down=e=>{if(root.current&&!root.current.contains(e.target))close();};
  const scroll=e=>{if(!panel.current||!panel.current.contains(e.target))close();};
  document.addEventListener('mousedown',down);window.addEventListener('scroll',scroll,true);
  return()=>{document.removeEventListener('mousedown',down);window.removeEventListener('scroll',scroll,true);};
 },[open]);
 const needle=q.trim().toLowerCase();
 const shown=opts.filter(o=>!needle||o.label.toLowerCase().includes(needle));
 const onKey=e=>{
  if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close();}
  else if(e.key==='ArrowDown'){e.preventDefault();setActive(a=>Math.min(a+1,shown.length-1));}
  else if(e.key==='ArrowUp'){e.preventDefault();setActive(a=>Math.max(a-1,0));}
  else if(e.key==='Enter'){e.preventDefault();if(shown[active])pick(shown[active].value);}
 };
 const sel=opts.find(o=>o.value===cur);
 const inputStyle={width:'100%',boxSizing:'border-box',height:'var(--control-height-sm)',padding:'0 var(--space-2)',font:'var(--type-body)',color:'var(--text)',background:'var(--surface)',border:'1px solid var(--border-strong)',borderRadius:'var(--radius-sm)',outline:0};
 const trigger=h('button',{type:'button',ref:btn,onClick:toggle,'aria-haspopup':'listbox','aria-expanded':open,'aria-label':label,style:{width:'100%',height:'var(--control-height)',padding:'0 10px 0 12px',display:'flex',alignItems:'center',justifyContent:'space-between',gap:'var(--space-2)',font:'var(--type-body)',color:'var(--text)',background:'var(--surface)',borderRadius:'var(--radius-md)',border:'1px solid '+(open?'var(--action)':'var(--border-strong)'),boxShadow:open?'0 0 0 3px var(--green-100)':'none',cursor:'pointer',textAlign:'left'}},
  h('span',{style:{minWidth:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}},sel?sel.label:'Choose'),
  h('span',{style:{color:'var(--text-muted)'}},DS?h(DS.Icon,{name:'chevron-down',size:16}):null));
 let footer=null;
 if(onCreate||onNew){
  footer=adding
   ?h('div',{style:{display:'flex',gap:'var(--space-2)',padding:'var(--space-2)',borderTop:'1px solid var(--border)'}},
     h('input',{autoFocus:true,value:name,placeholder:'Name of new '+noun,'aria-label':'Name of new '+noun,onChange:e=>setName(e.target.value),onKeyDown:e=>{if(e.key==='Enter'){e.preventDefault();create(name);}if(e.key==='Escape'){e.preventDefault();e.stopPropagation();setAdding(false);}},style:{...inputStyle,flex:1,width:'auto',minWidth:0}}),
     DS?h(DS.Button,{size:'sm',disabled:!name.trim(),onClick:()=>create(name)},'Add'):null)
   :h('button',{type:'button',onClick:()=>{const t=q.trim();if(onNew){close();onNew(t);}else if(t)create(t);else setAdding(true);},style:{width:'100%',display:'flex',alignItems:'center',gap:'var(--space-2)',padding:'var(--space-3)',background:'none',border:'none',borderTop:'1px solid var(--border)',cursor:'pointer',font:'var(--type-label)',color:'var(--text-link)',textAlign:'left'}},
     DS?h(DS.Icon,{name:'plus',size:16}):null,
     h('span',{style:{minWidth:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}},q.trim()?'New '+noun+': '+q.trim():'New '+noun));
 }
 const list=h('div',{role:'listbox',style:{maxHeight:216,overflowY:'auto',padding:'var(--space-1)'}},
  shown.length?shown.map((o,i)=>h('button',{key:o.value,type:'button',role:'option','aria-selected':o.value===cur,onMouseEnter:()=>setActive(i),onClick:()=>pick(o.value),style:{width:'100%',display:'flex',alignItems:'center',justifyContent:'space-between',gap:'var(--space-2)',padding:'var(--space-2)',border:'none',borderRadius:'var(--radius-sm)',background:i===active?'var(--surface-hover)':'none',cursor:'pointer',font:'var(--type-body)',color:'var(--text)',textAlign:'left'}},
    h('span',{style:{minWidth:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}},o.label),
    o.value===cur&&DS?h('span',{style:{color:'var(--action)'}},h(DS.Icon,{name:'check',size:16})):null))
  :h('div',{style:{padding:'var(--space-2)',font:'var(--type-small)',color:'var(--text-muted)'}},'No matches.'));
 const pop=open&&pos?h('div',{ref:panel,style:{position:'fixed',left:pos.left,width:pos.width,top:pos.top,bottom:pos.bottom,zIndex:150,background:'var(--surface)',borderRadius:'var(--radius-md)',boxShadow:'var(--shadow-lg)',overflow:'hidden'}},
  h('div',{style:{padding:'var(--space-2)',borderBottom:'1px solid var(--border)'}},
   h('input',{ref:search,value:q,placeholder:'Search','aria-label':'Search '+(label||'options'),onChange:e=>{setQ(e.target.value);setActive(0);},onKeyDown:onKey,style:inputStyle})),
  list,footer):null;
 return h('div',{ref:root,style:{display:'flex',flexDirection:'column',gap:6,minWidth:0}},
  label?h('span',{style:{font:'var(--type-label)',color:'var(--text)'}},label):null,trigger,pop);
}};

// Row "..." menu for lists. items: [{ label, onClick, danger }].
window.UzForms.RowActions=function(props){
 const R=window.React,h=R.createElement,DS=window.UzapointDesignSystem_dfe583;
 const [pos,setPos]=R.useState(null);
 const root=R.useRef(null),menu=R.useRef(null),trigger=R.useRef(null);
 const open=!!pos,items=props.items||[];
 const icons={View:'eye',Edit:'pencil',Approve:'circle-check','Download PDF':'download',Delete:'trash-2','Cancel transfer':'trash-2','Mark as received':'circle-check',Undo:'refresh-cw','Void sale':'circle-alert',Accept:'circle-check','Accept and receive goods':'package'};
 const close=()=>setPos(null);
 const show=()=>{
  const r=trigger.current.getBoundingClientRect(),w=230,ht=items.length*36+10;
  const up=r.bottom+6+ht>window.innerHeight-8&&r.top-6-ht>8;
  setPos({left:Math.max(8,r.right-w),width:w,top:up?r.top-6-ht:r.bottom+6});
 };
 R.useEffect(()=>{
  if(!open)return;
  const away=e=>{if(root.current&&!root.current.contains(e.target))close();};
  const esc=e=>{if(e.key==='Escape'){close();trigger.current&&trigger.current.focus();}};
  document.addEventListener('mousedown',away);document.addEventListener('keydown',esc);
  window.addEventListener('scroll',close,true);window.addEventListener('resize',close);
  const first=menu.current&&menu.current.querySelector('button:not(:disabled)');if(first)first.focus();
  return()=>{document.removeEventListener('mousedown',away);document.removeEventListener('keydown',esc);window.removeEventListener('scroll',close,true);window.removeEventListener('resize',close);};
 },[open]);
 const row=it=>h('button',{key:it.label,type:'button',role:'menuitem',disabled:!!it.disabled,onClick:()=>{close();it.onClick();},
  onMouseEnter:e=>{if(!it.disabled)e.currentTarget.style.background=it.danger?'var(--danger-soft)':'var(--canvas)';},onMouseLeave:e=>{e.currentTarget.style.background='none';},
  style:{display:'flex',alignItems:'center',gap:'var(--space-2)',width:'100%',height:36,padding:'0 var(--space-2)',border:'none',borderRadius:'var(--radius-sm)',background:'none',color:it.disabled?'var(--grey-400)':it.danger?'var(--danger-text)':'var(--text)',font:'var(--type-small)',fontWeight:500,textAlign:'left',whiteSpace:'nowrap',cursor:it.disabled?'not-allowed':'pointer'}},
  DS&&icons[it.label]?h(DS.Icon,{name:icons[it.label],size:16}):null,it.label);
 return h('div',{ref:root,onClick:e=>e.stopPropagation(),style:{position:'relative',display:'inline-flex',justifyContent:'flex-end',height:30,alignItems:'center'}},
  h('button',{ref:trigger,type:'button',onClick:()=>open?close():show(),'aria-label':'Actions',title:'Actions','aria-haspopup':'menu','aria-expanded':open,style:{width:30,height:30,display:'inline-grid',placeItems:'center',border:'none',borderRadius:'var(--radius-sm)',background:open?'var(--canvas)':'none',color:'var(--text-muted)',cursor:'pointer',padding:0}},DS?h(DS.Icon,{name:'ellipsis',size:16}):'...'),
  open?h('div',{ref:menu,role:'menu',style:{position:'fixed',left:pos.left,top:pos.top,width:pos.width,boxSizing:'border-box',zIndex:150,padding:4,background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'var(--radius-md)',boxShadow:'var(--shadow-lg)'}},items.map(row)):null);
};
})();
