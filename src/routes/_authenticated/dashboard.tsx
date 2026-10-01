import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Bell, Boxes, Building2, CalendarDays, Check, ChevronDown, CircleDollarSign,
  ClipboardList, Clock3, FileCheck2, Gauge, LayoutDashboard, Menu, MoreHorizontal,
  PackageSearch, Plus, Printer, Search, Settings, ShieldCheck, TrendingUp, Users,
  Wrench, X, Minus, ArrowDownToLine, History, Eye, FileDown, Trash2, ShoppingBag, ShoppingCart, PanelLeft, Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FinanceView, SaleDialog } from "@/components/FinanceSales";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [
    { title: "Service Pro Hub | Gestão de assistência técnica" },
    { name: "description", content: "Gestão de ordens de serviço, clientes, garantias, estoque e financeiro para assistências técnicas." },
    { property: "og:title", content: "Service Pro Hub" },
    { property: "og:description", content: "Operação completa para assistências técnicas." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Index,
});

type Section = "Visão geral" | "Ordens de serviço" | "Clientes" | "Garantias" | "Estoque" | "Financeiro" | "Equipe" | "Administração";
type Customer = { id:string; name:string; document:string; phone:string; email:string };
type Stock = { id:string; sku:string; name:string; category:string; supplier:string; location:string; quantity:number; minimum:number; cost:number; price:number; movements:{type:string; quantity:number; date:string; note:string}[] };
type Order = { id:string; dbId?:string; deviceCategory?:string; brand?:string; model?:string; customerId:string; client:string; document:string; device:string; serial:string; issue:string; apparentIssue?:string; terms?:string; stage:string; tech:string; total:number; due:string; tone:string; parts:{name:string; quantity:number; price:number}[] };
type Warranty = { id:string; dbId?:string; orderId:string; customer:string; device:string; starts:string; expires:string; coverage:string; status:string };
type Sale = {id:string;number:number;type:"pos"|"quick";department:"assistance"|"parts"|"store";total:number;payment_method:string;sold_at:string;notes:string|null};
type CompanySettings = {name:string;document:string;email:string;phone:string;address:string;logoUrl:string};
type FinanceEntry = {id:string;entry_type:string;department:string;category:string;description:string;amount:number;payment_method:string|null;entry_date:string};
type DialogKind = "order" | "customer" | "stock" | "movement" | "warranty" | "orderView" | "warrantyView" | "pos" | "quickSale" | "companySettings" | null;

const initialCustomers: Customer[] = [];
const initialStock: Stock[] = [];
const initialOrders: Order[] = [];
const initialWarranties: Warranty[] = [];
const nav: {label:Section;icon:typeof Gauge;group?:string}[] = [
  {label:"Visão geral",icon:LayoutDashboard},{label:"Ordens de serviço",icon:ClipboardList,group:"OPERAÇÃO"},{label:"Clientes",icon:Users},{label:"Garantias",icon:ShieldCheck},{label:"Estoque",icon:Boxes,group:"GESTÃO"},{label:"Financeiro",icon:CircleDollarSign},{label:"Equipe",icon:Wrench},{label:"Administração",icon:Building2,group:"PLATAFORMA"},
];
const money=(n:number)=>n.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
const deviceCatalog:Record<string,Record<string,string[]>>={
  Smartphone:{
    Apple:["iPhone 15 Pro Max","iPhone 15 Pro","iPhone 15","iPhone 15 Plus","iPhone 14 Pro Max","iPhone 14 Pro","iPhone 14","iPhone 13 Pro Max","iPhone 13","iPhone 12 Pro Max","iPhone 12","iPhone 11","iPhone XR","iPhone XS","iPhone X","iPhone 8 Plus","iPhone 8"],
    Motorola:["Moto G85","Moto G75","Moto G55","Moto G35","Edge 60 Fusion","Edge 60 Pro","Edge 50 Fusion","Edge 50 Pro","Moto G84","Moto G54","Moto G34","Moto G24"],
    Samsung:["Galaxy S25 Ultra","Galaxy S25+","Galaxy S25","Galaxy S24 Ultra","Galaxy S24+","Galaxy S24","Galaxy S23 Ultra","Galaxy S23","Galaxy S22 Ultra","Galaxy S22","Galaxy A56","Galaxy A36","Galaxy A26","Galaxy A16","Galaxy A15","Galaxy A25","Galaxy A35","Galaxy A55","Galaxy M55","Galaxy M35","Galaxy M15"],
    Xiaomi:["Redmi Note 14 Pro+","Redmi Note 14 Pro","Redmi Note 14","Redmi Note 13 Pro+","Redmi Note 13 Pro","Redmi Note 13","Redmi 14C","Redmi 13","Redmi 13C","Poco X6 Pro","Poco X6","Poco X5 Pro"],
    Realme:["Realme 14 Pro+","Realme 14 Pro","Realme 13 Pro+","Realme 13 Pro","Realme C75","Realme C65","Realme C55"]
  },
  Tablet:{
    Apple:["iPad Pro 13","iPad Pro 11","iPad Air","iPad 10ª geração","iPad 9ª geração","iPad mini"],
    Samsung:["Galaxy Tab S10 Ultra","Galaxy Tab S10+","Galaxy Tab S9 Ultra","Galaxy Tab S9+","Galaxy Tab S9","Galaxy Tab A9+","Galaxy Tab A9"],
    Lenovo:["Tab P12","Tab M11","Tab M10"],
    Xiaomi:["Redmi Pad Pro","Redmi Pad SE"]
  },
  Notebook:{
    Apple:["MacBook Air M4","MacBook Air M3","MacBook Pro M4","MacBook Pro M3"],
    Dell:["Inspiron 15","Inspiron 14","G15","Latitude 3440","Latitude 3540"],
    Lenovo:["IdeaPad 3","IdeaPad Slim 3","LOQ","ThinkPad E14"],
    Acer:["Aspire 5","Aspire 3","Nitro V15"],
    Asus:["Vivobook 15","Vivobook Go 15","TUF Gaming F15"]
  },
  "Smartwatch":{
    Apple:["Apple Watch Series 10","Apple Watch Series 9","Apple Watch SE","Apple Watch Ultra 2"],
    Samsung:["Galaxy Watch7","Galaxy Watch6","Galaxy Watch FE"],
    Xiaomi:["Redmi Watch 5","Watch S4"],
    Huawei:["Watch GT 5","Watch Fit 3"]
  },
  "Console":{
    Sony:["PlayStation 5","PlayStation 4","PlayStation 4 Pro"],
    Microsoft:["Xbox Series X","Xbox Series S","Xbox One"],
    Nintendo:["Switch OLED","Switch","Switch Lite"]
  },
  "Outros":{
    Apple:["AirPods","AirPods Pro","Apple TV"],
    Samsung:["Galaxy Buds","Smart TV"],
    Motorola:["Acessório / outro"],
    Xiaomi:["TV Box","Acessório / outro"]
  }
};
const today=()=>new Date().toLocaleDateString("pt-BR");
const addDays=(days:number)=>{const d=new Date();d.setDate(d.getDate()+days);return d.toLocaleDateString("pt-BR")};
const escapeHtml=(s:string)=>s.replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"})[c] ?? c);

function printDocument(title:string, body:string, company:CompanySettings){
  const popup=window.open("","_blank","width=900,height=760"); if(!popup)return;
  popup.document.write(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>${escapeHtml(title)}</title><style>@page{size:A4;margin:16mm}*{box-sizing:border-box}body{font-family:Arial,sans-serif;color:#172033;margin:0;font-size:12px}.head{display:flex;justify-content:space-between;border-bottom:3px solid #0878bd;padding-bottom:16px;margin-bottom:22px}.brand{font-size:24px;font-weight:800}.muted{color:#667085}.badge{border:1px solid #0878bd;color:#0878bd;padding:5px 9px;font-weight:700}h1{font-size:20px;margin:0 0 4px}h2{font-size:12px;text-transform:uppercase;color:#667085;margin:22px 0 8px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:10px 28px}.box{border:1px solid #d9dee8;padding:12px;margin:8px 0}.row{display:flex;justify-content:space-between;border-bottom:1px solid #e8ebf0;padding:8px 0}.total{font-size:16px;font-weight:700}.sign{display:grid;grid-template-columns:1fr 1fr;gap:60px;margin-top:70px;text-align:center}.line{border-top:1px solid #172033;padding-top:7px}.no-print{margin:0 0 18px}@media print{.no-print{display:none}}</style></head><body><button class="no-print" onclick="window.print()">Imprimir / Salvar como PDF</button><div class="head"><div style="display:flex;gap:14px;align-items:center">${company.logoUrl?`<img src="${escapeHtml(company.logoUrl)}" style="max-width:110px;max-height:55px;object-fit:contain" />`:""}<div><div class="brand">${escapeHtml(company.name||"Sua empresa")}</div><div class="muted">${escapeHtml(company.document||"")} ${company.phone?"• "+escapeHtml(company.phone):""}</div><div class="muted">${escapeHtml(company.address||company.email||"")}</div></div></div><div class="badge">${escapeHtml(title)}</div></div>${body}<div class="sign"><div class="line">Responsável técnico</div><div class="line">Cliente</div></div><script>window.onload=()=>setTimeout(()=>window.print(),250)<\/script></body></html>`); popup.document.close();
}

function Index(){
  const [companyName,setCompanyName]=useState("Sua empresa");
  const [company,setCompany]=useState<CompanySettings>({name:"Sua empresa",document:"",email:"",phone:"",address:"",logoUrl:""});
  const [organizationId,setOrganizationId]=useState<string|null>(null);
  const [dataLoading,setDataLoading]=useState(true);
  const [dataError,setDataError]=useState("");
  useEffect(()=>{
    let active=true;
    const load=async()=>{
      setDataLoading(true);setDataError("");
      const {data:{user},error:userError}=await supabase.auth.getUser();
      if(userError||!user){if(active){setDataError("Sua sessão expirou. Entre novamente.");setDataLoading(false)}return}
      let {data:members,error:memberError}=await supabase.from("organization_members").select("organization_id,organizations(name,document,email,phone,address,logo_url)").eq("user_id",user.id).eq("active",true).limit(1);
      if(!memberError&&!members?.length){
        const {error:provisionError}=await supabase.rpc("ensure_user_organization");
        if(!provisionError){
          const refreshed=await supabase.from("organization_members").select("organization_id,organizations(name)").eq("user_id",user.id).eq("active",true).limit(1);
          members=refreshed.data;memberError=refreshed.error;
        }else{memberError=provisionError as any}
      }
      if(memberError||!members?.length){if(active){setDataError("Não foi possível vincular esta conta a uma empresa. Confirme se as migrações do projeto foram aplicadas no Lovable Cloud.");setCompanyName("Empresa não vinculada");setDataLoading(false)}return}
      const orgId=members[0].organization_id;
      if(!active)return;
      setOrganizationId(orgId);
      const orgData=members[0] as any;
      const org=orgData.organizations??{};
      const loadedCompany={name:org.name??"Sua empresa",document:org.document??"",email:org.email??"",phone:org.phone??"",address:org.address??"",logoUrl:org.logo_url??""};
      setCompany(loadedCompany);
      setCompanyName(loadedCompany.name);
      const customersRes = await supabase.from("customers").select("*").eq("organization_id", orgId).order("created_at", { ascending: false });
      const stockRes = await supabase.from("inventory_items").select("*,inventory_movements(*)").eq("organization_id", orgId).eq("active", true).order("created_at", { ascending: false });
      const ordersRes = await supabase.from("service_orders").select("*,customers(name,document,phone,email),devices(category,brand,model,serial_number),service_order_items(*)").eq("organization_id", orgId).order("created_at", { ascending: false });
      const warrantiesRes = await supabase.from("warranties").select("*,service_orders(order_number,customers(name),devices(brand,model))").eq("organization_id", orgId).order("created_at", { ascending: false });
      const salesRes = await supabase.from("sales").select("*").eq("organization_id", orgId).order("sold_at", { ascending: false });
      const financeRes = await supabase.from("financial_entries").select("*").eq("organization_id", orgId).order("entry_date", { ascending: false });
      const errors=[customersRes.error,stockRes.error,ordersRes.error,warrantiesRes.error,salesRes.error,financeRes.error].filter(Boolean);
      if(errors.length){if(active){setDataError("Não foi possível carregar todos os dados do banco. Confira as permissões e tente atualizar.");setDataLoading(false)}return}
      if(!active)return;
      setCustomers((customersRes.data??[]).map((x:any)=>({id:x.id,name:x.name,document:x.document??"",phone:x.phone??"",email:x.email??""})));
      setStock((stockRes.data??[]).map((x:any)=>({id:x.id,sku:x.sku??"",name:x.name,category:x.category??"",supplier:x.supplier??"",location:x.location??"",quantity:Number(x.quantity),minimum:Number(x.minimum_quantity),cost:Number(x.cost),price:Number(x.price),movements:(x.inventory_movements??[]).map((m:any)=>({type:m.movement_type,date:new Date(m.created_at).toLocaleDateString("pt-BR"),quantity:Number(m.quantity),note:m.notes??""})).sort((a:any,b:any)=>b.date.localeCompare(a.date))})));
      const statusLabels:Record<string,string>={received:"Recebida",triage:"Triagem",diagnosis:"Diagnóstico",quote:"Orçamento",awaiting_approval:"Aguardando aprovação",approved:"Aprovada",waiting_parts:"Aguardando peça",repair:"Em reparo",testing:"Em testes",ready:"Pronto para entrega",delivered:"Entregue",cancelled:"Cancelada",no_repair:"Sem reparo",warranty_return:"Retorno em garantia"};
      setOrders((ordersRes.data??[]).map((x:any)=>({id:"OS-"+x.order_number,dbId:x.id,customerId:x.customer_id,client:x.customers?.name??"Cliente",document:x.customers?.document??"",device:[x.devices?.brand,x.devices?.model].filter(Boolean).join(" ")||x.devices?.category||"Equipamento",deviceCategory:x.devices?.category??"Equipamento",brand:x.devices?.brand??"",model:x.devices?.model??"",serial:x.devices?.serial_number??"",issue:x.reported_issue??"",apparentIssue:x.apparent_issue??x.devices?.condition_notes??"",terms:x.terms??"",stage:statusLabels[x.status]??x.status,tech:"Não atribuído",total:Number(x.total??x.subtotal??0),due:x.estimated_at?new Date(x.estimated_at).toLocaleDateString("pt-BR"):"A definir",tone:x.status==="ready"?"green":x.status==="awaiting_approval"?"amber":"blue",parts:(x.service_order_items??[]).map((it:any)=>({name:it.description,quantity:Number(it.quantity),price:Number(it.unit_price)}))})));
      setWarranties((warrantiesRes.data??[]).map((x:any)=>({id:x.code,dbId:x.id,orderId:"OS-"+(x.service_orders?.order_number??""),customer:x.service_orders?.customers?.name??"",device:[x.service_orders?.devices?.brand,x.service_orders?.devices?.model].filter(Boolean).join(" "),starts:new Date(x.starts_at+"T00:00:00").toLocaleDateString("pt-BR"),expires:new Date(x.expires_at+"T00:00:00").toLocaleDateString("pt-BR"),coverage:x.coverage??x.terms??"",status:x.status})));
      setSales((salesRes.data??[]).map((x:any)=>({...x,number:Number(x.sale_number),total:Number(x.total)})));
      setFinanceEntries((financeRes.data??[]).map((x:any)=>({...x,amount:Number(x.amount)})));
      setDataLoading(false);
    };
    load().catch(()=>{if(active){setDataError("Falha ao conectar ao banco de dados.");setDataLoading(false)}});
    return ()=>{active=false};
  },[]);
  const [section,setSection]=useState<Section>("Visão geral"),[menuOpen,setMenuOpen]=useState(false),[sidebarCollapsed,setSidebarCollapsed]=useState(true),[dialog,setDialog]=useState<DialogKind>(null),[search,setSearch]=useState("");
  const [customers,setCustomers]=useState(initialCustomers),[stock,setStock]=useState(initialStock),[orders,setOrders]=useState(initialOrders),[warranties,setWarranties]=useState(initialWarranties);
  const [sales,setSales]=useState<Sale[]>([]),[financeEntries,setFinanceEntries]=useState<FinanceEntry[]>([]);
  const [selectedOrder,setSelectedOrder]=useState<Order|null>(null),[selectedWarranty,setSelectedWarranty]=useState<Warranty|null>(null),[selectedStock,setSelectedStock]=useState<Stock|null>(null);
  const q=search.toLowerCase();
  const filteredOrders=useMemo(()=>orders.filter(o=>Object.values(o).join(" ").toLowerCase().includes(q)),[orders,q]);
  const open=(kind:DialogKind)=>setDialog(kind);
  const action=()=>{if(section==="Clientes")open("customer");else if(section==="Estoque")open("stock");else if(section==="Garantias")open("warranty");else if(section==="Financeiro")open("pos");else open("order")};
  const labels:Partial<Record<Section,string>>={Clientes:"Novo cliente",Estoque:"Nova peça",Garantias:"Emitir garantia","Ordens de serviço":"Nova ordem"};
  const requireOrg=()=>{if(!organizationId){alert("Esta conta não está vinculada a uma empresa no banco.");return false}return true};
  const saveCustomer=async(c:Customer&{address?:string;notes?:string})=>{
    if(!requireOrg())return;
    const {data,error}=await supabase.from("customers").insert({organization_id:organizationId!,kind:"person",name:c.name,document:c.document||null,phone:c.phone||null,email:c.email||null,address:c.address??null,notes:c.notes??null}).select().single();
    if(error){alert("Não foi possível salvar o cliente: "+error.message);return}
    setCustomers(v=>[{id:data.id,name:data.name,document:data.document??"",phone:data.phone??"",email:data.email??""},...v]);setDialog(null);
  };
  const saveStock=async(s:Stock)=>{
    if(!requireOrg())return;
    const {data,error}=await supabase.rpc("create_inventory_item",{_organization_id:organizationId!,_branch_id:null,_sku:s.sku,_name:s.name,_category:s.category,_supplier:s.supplier,_location:s.location,_quantity:s.quantity,_minimum_quantity:s.minimum,_cost:s.cost,_price:s.price});
    if(error){alert("Não foi possível cadastrar a peça: "+error.message);return}
    const x=data as any;setStock(v=>[{id:x.id,sku:x.sku??"",name:x.name,category:x.category??"",supplier:x.supplier??"",location:x.location??"",quantity:Number(x.quantity),minimum:Number(x.minimum_quantity),cost:Number(x.cost),price:Number(x.price),movements:s.quantity?[{type:"entry",quantity:s.quantity,date:today(),note:"Saldo inicial"}]:[]},...v]);setDialog(null);
  };
  const saveMovement=async(id:string,amount:number,type:string,note:string)=>{
    const {data,error}=await supabase.rpc("move_inventory",{_inventory_item_id:id,_movement_type:type==="entry"?"entry":"exit",_quantity:amount,_notes:note,_unit_cost:null});
    if(error){alert("Não foi possível registrar a movimentação: "+error.message);return}
    const x=data as any;setStock(v=>v.map(s=>s.id===id?{...s,quantity:Number(x.quantity),movements:[{type:type==="entry"?"entry":"exit",quantity:amount,date:today(),note},...s.movements]}:s));setDialog(null);
  };
  const saveOrder=async(o:Order,part:{id:string;quantity:number}|null)=>{
    if(!requireOrg())return;
    const customer=customers.find(x=>x.id===o.customerId);if(!customer){alert("Cliente não encontrado.");return}
    const brand=o.brand||o.device.split(" ")[0]||"";
    const model=o.model||o.device.split(" ").slice(1).join(" ");
    const {data:device,error:deviceError}=await supabase.from("devices").insert({organization_id:organizationId!,customer_id:customer.id,category:o.deviceCategory??"Equipamento",brand,model,serial_number:o.serial||null,condition_notes:null,accessories:null}).select().single();
    if(deviceError){alert("Não foi possível cadastrar o aparelho da OS: "+deviceError.message);return}
    const partTotal=o.parts.reduce((sum,p)=>sum+p.quantity*p.price,0),serviceAmount=Math.max(0,o.total-partTotal);
    const {data:dbOrder,error:orderError}=await supabase.from("service_orders").insert({organization_id:organizationId!,customer_id:customer.id,device_id:device.id,reported_issue:o.issue,apparent_issue:o.apparentIssue||null,terms:o.terms||null,status:"received",priority:"normal",subtotal:serviceAmount,discount:0,estimated_at:o.due&&o.due!=="A definir"?new Date(o.due+"T12:00:00").toISOString():null}).select().single();
    if(orderError){alert("Não foi possível criar a ordem: "+orderError.message);return}
    if(serviceAmount>0){const {error}=await supabase.from("service_order_items").insert({organization_id:organizationId!,order_id:dbOrder.id,item_type:"service",description:"Mão de obra / serviço técnico",quantity:1,unit_price:serviceAmount,cost:0,warranty_days:90});if(error){alert("A ordem foi criada, mas não foi possível salvar o serviço: "+error.message);}}
    if(part&&part.quantity>0){const {error}=await supabase.rpc("consume_inventory_item",{_order_id:dbOrder.id,_inventory_item_id:part.id,_quantity:part.quantity,_unit_price:stock.find(s=>s.id===part.id)?.price??0,_warranty_days:90});if(error){alert("A ordem foi criada, mas a peça não foi baixada do estoque: "+error.message);}}
    setDialog(null);setSelectedOrder({...o,id:"OS-"+dbOrder.order_number,dbId:dbOrder.id});setOrders(v=>[{...o,id:"OS-"+dbOrder.order_number,dbId:dbOrder.id},...v]);if(part)setStock(v=>v.map(s=>s.id===part.id?{...s,quantity:s.quantity-part.quantity}:s));window.setTimeout(()=>setDialog("orderView"),180);
  };
  const saveWarranty=async(w:Warranty)=>{
    if(!requireOrg())return;
    const order=orders.find(o=>o.id===w.orderId);if(!order?.dbId){alert("Ordem vinculada não encontrada no banco.");return}
    const parseDate=(value:string)=>{const [d,m,y]=value.split("/");return y?y+"-"+m+"-"+d:new Date().toISOString().slice(0,10)};
    const {data,error}=await supabase.from("warranties").insert({organization_id:organizationId!,order_id:order.dbId,starts_at:parseDate(w.starts),expires_at:parseDate(w.expires),coverage:w.coverage,terms:null,status:"active"}).select().single();
    if(error){alert("Não foi possível emitir a garantia: "+error.message);return}
    const saved={...w,id:data.code,dbId:data.id};setWarranties(v=>[saved,...v]);setSelectedWarranty(saved);setDialog(null);window.setTimeout(()=>setDialog("warrantyView"),180);
  };
  return <div className="min-h-screen bg-background text-foreground">
    <Sidebar section={section} setSection={s=>{setSection(s);setMenuOpen(false);setSearch("")}} open={menuOpen} close={()=>setMenuOpen(false)} collapsed={sidebarCollapsed} toggleCollapsed={()=>setSidebarCollapsed(v=>!v)} onCompanySettings={()=>setDialog("companySettings")}/>
    <main className={"min-h-screen transition-[padding] duration-200 "+(sidebarCollapsed?"lg:pl-20":"lg:pl-64")}>
      <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur md:px-7"><Button variant="ghost" size="icon" className="lg:hidden" aria-label="Abrir menu" onClick={()=>setMenuOpen(true)}><Menu/></Button><div className="relative hidden max-w-xl flex-1 md:block"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/><Input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar nesta área…" className="h-10 border-0 bg-muted pl-10 shadow-none"/></div><div className="ml-auto flex items-center gap-2"><Button variant="ghost" size="icon" aria-label="Notificações"><Bell/></Button><span className="grid size-8 shrink-0 place-items-center overflow-hidden rounded-md bg-primary font-bold text-primary-foreground">{company.logoUrl?<img src={company.logoUrl} alt="Logo da empresa" className="h-full w-full object-contain"/>:companyName.slice(0,2).toUpperCase()}</span><span className="hidden text-sm font-semibold sm:block">{companyName}</span><ChevronDown className="hidden size-4 sm:block"/></div></header>
      <div className="mx-auto max-w-[1600px] px-4 py-6 md:px-7 md:py-8">{dataError&&<div role="alert" className="mb-5 rounded-md border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">{dataError}</div>}{dataLoading&&<div className="mb-5 rounded-md border bg-card p-4 text-sm text-muted-foreground">Carregando dados reais da empresa…</div>}<div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="mb-1 text-sm font-medium text-muted-foreground">{new Date().toLocaleDateString("pt-BR",{weekday:"long",day:"2-digit",month:"long"})}</p><h1 className="text-2xl font-bold md:text-3xl">{section}</h1><p className="mt-1 text-sm text-muted-foreground">Bem-vindo, {companyName}. Sua operação está sob controle.</p></div>{["Clientes","Estoque","Garantias","Ordens de serviço","Visão geral"].includes(section)&&<Button className="h-10 w-full sm:w-auto" onClick={action}><Plus/>{labels[section]??"Nova ordem"}</Button>}</div>
        {section==="Visão geral"&&<Dashboard orders={filteredOrders} stock={stock} sales={sales} onSection={setSection}/>} 
        {section==="Ordens de serviço"&&<OrdersView orders={filteredOrders} onNew={()=>open("order")} onView={o=>{setSelectedOrder(o);open("orderView")}} onDelete={async o=>{if(!window.confirm(`Excluir a ordem ${o.id} de ${o.client}? Essa ação não pode ser desfeita.`))return;if(!o.dbId){alert("Esta ordem não está salva no banco.");return}const {error}=await supabase.from("service_orders").delete().eq("id",o.dbId).eq("organization_id",organizationId!);if(error){alert("Não foi possível excluir a ordem. Se houver consumo de estoque vinculado, a exclusão pode ser bloqueada para preservar o histórico. "+error.message);return}setOrders(v=>v.filter(x=>x.id!==o.id));setWarranties(v=>v.filter(w=>w.orderId!==o.id));}}/>}
        {section==="Clientes"&&<CustomersView customers={customers.filter(c=>`${c.name} ${c.document} ${c.phone}`.toLowerCase().includes(q))} orders={orders} onNew={()=>open("customer")} onDelete={async c=>{const linked=orders.filter(o=>o.customerId===c.id);if(linked.length){window.alert("Este cliente possui ordens de serviço vinculadas. Exclua primeiro as ordens relacionadas.");return}if(window.confirm(`Excluir o cliente ${c.name}? Essa ação não pode ser desfeita.`)){const {error}=await supabase.from("customers").delete().eq("id",c.id).eq("organization_id",organizationId!);if(error){alert("Não foi possível excluir o cliente: "+error.message);return}setCustomers(v=>v.filter(x=>x.id!==c.id));}}}/>}
        {section==="Estoque"&&<StockView stock={stock.filter(s=>`${s.name} ${s.sku} ${s.category}`.toLowerCase().includes(q))} onNew={()=>open("stock")} onMove={s=>{setSelectedStock(s);open("movement")}} onDelete={async s=>{if(!window.confirm(`Excluir a peça ${s.name} do estoque? O banco pode impedir a exclusão se houver histórico vinculado.`))return;const {error}=await supabase.from("inventory_items").delete().eq("id",s.id).eq("organization_id",organizationId!);if(error){alert("Não foi possível excluir a peça. Pode haver movimentações ou ordens vinculadas. "+error.message);return}setStock(v=>v.filter(x=>x.id!==s.id));}}/>}
        {section==="Garantias"&&<WarrantyView warranties={warranties} onNew={()=>open("warranty")} onView={w=>{setSelectedWarranty(w);open("warrantyView")}}/>}
        {section==="Financeiro"&&<FinanceView sales={sales} entries={financeEntries} onPOS={()=>open("pos")} onQuick={()=>open("quickSale")}/>} {["Equipe","Administração"].includes(section)&&<Placeholder section={section}/>}
      </div>
    </main>
    <CompanySettingsDialog open={dialog==="companySettings"} close={()=>setDialog(null)} company={company} organizationId={organizationId} onSave={async next=>{if(!requireOrg())return;const {error}=await supabase.from("organizations").update({name:next.name,document:next.document||null,email:next.email||null,phone:next.phone||null,address:next.address||null,logo_url:next.logoUrl||null}).eq("id",organizationId!);if(error){alert("Não foi possível salvar os dados da empresa: "+error.message);return}setCompany(next);setCompanyName(next.name);setDialog(null);alert("Dados da empresa atualizados com sucesso.");}}/>
    <CustomerDialog open={dialog==="customer"} close={()=>setDialog(null)} onSave={saveCustomer}/>
    <StockDialog open={dialog==="stock"} close={()=>setDialog(null)} onSave={saveStock}/>
    <MovementDialog open={dialog==="movement"} item={selectedStock} close={()=>setDialog(null)} onSave={saveMovement}/>
    <OrderDialog open={dialog==="order"} customers={customers} stock={stock} close={()=>setDialog(null)} onSave={saveOrder}/>
    <WarrantyDialog open={dialog==="warranty"} orders={orders} close={()=>setDialog(null)} onSave={saveWarranty}/>
    <OrderDocumentDialog open={dialog==="orderView"} order={selectedOrder} company={company} close={()=>setDialog(null)}/>
    <WarrantyDocumentDialog open={dialog==="warrantyView"} warranty={selectedWarranty} company={company} close={()=>setDialog(null)}/>
    <SaleDialog open={dialog==="pos"||dialog==="quickSale"} mode={dialog==="quickSale"?"quick":"pos"} stock={stock} customers={customers} close={()=>setDialog(null)} onSave={async(payload)=>{if(!requireOrg())return;const {data,error}=await supabase.rpc("create_pos_sale",{_organization_id:organizationId!,_sale_type:payload.type,_department:payload.department,_customer_id:payload.customerId||null,_discount:payload.discount,_payment_method:payload.payment,_notes:payload.notes||null,_items:payload.items.map(i=>({inventory_item_id:i.inventoryId||null,description:i.description,quantity:i.quantity,unit_price:i.price,unit_cost:i.cost}))});if(error){alert("Não foi possível registrar a venda: "+error.message);return}const [salesR,entriesR,stockR]=await Promise.all([supabase.from("sales").select("*").eq("organization_id",organizationId!).order("sold_at",{ascending:false}),supabase.from("financial_entries").select("*").eq("organization_id",organizationId!).order("entry_date",{ascending:false}),supabase.from("inventory_items").select("*,inventory_movements(*)").eq("organization_id",organizationId!).eq("active",true).order("created_at",{ascending:false})]);if(salesR.error||entriesR.error||stockR.error){alert("Venda registrada, mas houve falha ao atualizar a tela. Atualize a página para sincronizar.");return}setSales((salesR.data??[]).map((x:any)=>({...x,number:Number(x.sale_number),total:Number(x.total)})));setFinanceEntries((entriesR.data??[]).map((x:any)=>({...x,amount:Number(x.amount)})));setStock((stockR.data??[]).map((x:any)=>({id:x.id,sku:x.sku??"",name:x.name,category:x.category??"",supplier:x.supplier??"",location:x.location??"",quantity:Number(x.quantity),minimum:Number(x.minimum_quantity),cost:Number(x.cost),price:Number(x.price),movements:(x.inventory_movements??[]).map((m:any)=>({type:m.movement_type,date:new Date(m.created_at).toLocaleDateString("pt-BR"),quantity:Number(m.quantity),note:m.notes??""}))})));setDialog(null);alert("Venda registrada com sucesso!");}}/>
  </div>
}

function Sidebar({section,setSection,open,close,collapsed,toggleCollapsed,onCompanySettings}:{section:Section;setSection:(s:Section)=>void;open:boolean;close:()=>void;collapsed:boolean;toggleCollapsed:()=>void;onCompanySettings:()=>void}){
  return <>{open&&<Button variant="ghost" className="fixed inset-0 z-40 h-auto w-auto rounded-none bg-foreground/30 lg:hidden" onClick={close} aria-label="Fechar menu"/>}
    <aside className={"fixed inset-y-0 left-0 z-50 flex flex-col border-r bg-sidebar transition-[width,transform] duration-200 lg:translate-x-0 "+(collapsed?"w-16":"w-64")+" "+(open?"translate-x-0":"-translate-x-full")}>
      <div className={"relative flex h-16 items-center border-b "+(collapsed?"justify-center px-2":"px-4")}>
        <div className="grid size-9 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground"><Wrench className="size-5"/></div>
        {!collapsed&&<div className="ml-3 min-w-0"><div className="truncate text-base font-extrabold leading-4">Service Pro Hub</div><div className="text-[10px] font-bold uppercase text-primary">Gestão inteligente</div></div>}
        <Button variant="ghost" size="icon" onClick={toggleCollapsed} className={collapsed?"flex":"ml-auto flex"} aria-label={collapsed?"Expandir menu":"Minimizar menu"} title={collapsed?"Expandir menu":"Minimizar menu"}><PanelLeft className="size-4"/></Button>
        {!collapsed&&<Button variant="ghost" size="icon" onClick={close} className="ml-auto lg:hidden"><X/></Button>}
      </div>
      <nav className={"flex-1 overflow-y-auto py-4 "+(collapsed?"px-2":"px-3")}>
        {nav.map((item,i)=><div key={item.label}>{item.group&&!collapsed&&<p className={"mb-2 px-3 text-[10px] font-bold text-muted-foreground "+(i?"mt-6":"")}>{item.group}</p>}<Button variant="ghost" onClick={()=>setSection(item.label)} className={"group relative mb-1 h-10 w-full gap-3 "+(collapsed?"justify-center px-2":"justify-start px-3")+" "+(section===item.label?"bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground":"text-sidebar-foreground")} aria-label={item.label}><item.icon className="size-[18px]"/>{!collapsed&&item.label}{collapsed&&<span className="pointer-events-none absolute left-full top-1/2 z-[70] ml-2 hidden -translate-y-1/2 whitespace-nowrap rounded-md border bg-popover px-2.5 py-1.5 text-xs font-medium text-popover-foreground shadow-md group-hover:block">{item.label}</span>}</Button></div>)}
      </nav>
      <div className={"border-t "+(collapsed?"p-2":"p-3")}>
        <Button variant="ghost" onClick={onCompanySettings} className={"group relative h-auto w-full rounded-md bg-muted py-3 "+(collapsed?"justify-center px-2":"justify-start px-3")} aria-label="Configurar empresa">
          <Settings className="size-4 shrink-0 text-primary"/>{!collapsed&&<span className="ml-2 text-xs font-semibold">Configurar empresa</span>}{collapsed&&<span className="pointer-events-none absolute left-full top-1/2 z-[70] ml-2 hidden -translate-y-1/2 whitespace-nowrap rounded-md border bg-popover px-2.5 py-1.5 text-xs font-medium text-popover-foreground shadow-md group-hover:block">Configurar empresa</span>}
        </Button>
      </div>
    </aside>
  </>
}
function Dashboard({orders,stock,sales,onSection}:{orders:Order[];stock:Stock[];sales:Sale[];onSection:(s:Section)=>void}){
  const [salesFilter,setSalesFilter]=useState<"all"|"assistance"|"store"|"parts">("all");
  const recentOrders=orders.slice(0,5);
  const lowStockCount=stock.filter(s=>s.quantity<=s.minimum).length;
  const estimatedRevenue=orders.reduce((a,o)=>a+o.total,0);
  const salesByDay=useMemo(()=>{
    const now=new Date();
    return Array.from({length:7},(_,index)=>{
      const d=new Date(now);
      d.setHours(0,0,0,0);
      d.setDate(now.getDate()-(6-index));
      const key=d.toLocaleDateString("en-CA");
      const total=sales.filter(s=>{
        if(salesFilter!=="all"&&s.department!==salesFilter)return false;
        const sd=new Date(s.sold_at);
        return sd.toLocaleDateString("en-CA")===key;
      }).reduce((sum,s)=>sum+Number(s.total),0);
      return {label:d.toLocaleDateString("pt-BR",{weekday:"short"}).replace(".",""),date:d.toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit"}),total};
    });
  },[sales,salesFilter]);
  const maxDay=Math.max(...salesByDay.map(d=>d.total),1);
  const weekTotal=salesByDay.reduce((a,d)=>a+d.total,0);
  const cards=[
    {title:"Assistência técnica",description:"Ordens de serviço, reparos e acompanhamento",icon:Wrench,classes:"bg-blue-600 text-white",target:"Ordens de serviço" as Section},
    {title:"Loja / Produtos",description:"Produtos, preços e movimentação de vendas",icon:ShoppingBag,classes:"bg-violet-600 text-white",target:"Estoque" as Section},
    {title:"Estoque de peças",description:"Peças, saldos e reposição de estoque",icon:Boxes,classes:"bg-amber-500 text-white",target:"Estoque" as Section},
    {title:"Vendas",description:"Vendas, receitas e histórico financeiro",icon:ShoppingCart,classes:"bg-emerald-600 text-white",target:"Financeiro" as Section},
    {title:"Clientes",description:"Cadastro e histórico de atendimentos",icon:Users,classes:"bg-cyan-600 text-white",target:"Clientes" as Section},
  ];
  return <div className="space-y-6">
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map(card=><button type="button" key={card.title} onClick={()=>onSection(card.target)} className={"group min-h-[150px] rounded-xl p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg "+card.classes}>
        <div className="flex items-start justify-between gap-3"><div className="grid size-11 place-items-center rounded-lg bg-white/15"><card.icon className="size-5"/></div><span className="text-2xl opacity-70 transition group-hover:translate-x-1">→</span></div>
        <h2 className="mt-7 text-lg font-bold">{card.title}</h2>
        <p className="mt-1 text-xs leading-5 text-white/80">{card.description}</p>
      </button>)}
    </section>

    <section className="grid gap-3 sm:grid-cols-3">
      <Stat label="Ordens em andamento" value={String(orders.length)} />
      <Stat label="Receita estimada" value={money(estimatedRevenue)} />
      <Stat label="Vendas nos últimos 7 dias" value={money(weekTotal)} />
    </section>

    <section className="grid gap-6 xl:grid-cols-[1.25fr_1fr]">
      <div className="min-w-0 rounded-lg border bg-card shadow-card">
        <div className="flex items-center justify-between gap-3 border-b px-5 py-4"><div><h2 className="font-bold">Ordens recentes</h2><p className="text-xs text-muted-foreground">Acompanhe apenas os últimos atendimentos</p></div><Button variant="ghost" size="sm" onClick={()=>onSection("Ordens de serviço")}>Ver tudo</Button></div>
        <OrderTable orders={recentOrders}/>
      </div>

      <div className="rounded-lg border bg-card p-5 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h2 className="font-bold">Vendas da semana</h2><p className="text-xs text-muted-foreground">{money(weekTotal)} no período selecionado</p></div>
          <select aria-label="Filtrar vendas da semana" value={salesFilter} onChange={e=>setSalesFilter(e.target.value as "all"|"assistance"|"store"|"parts")} className="h-9 rounded-md border bg-background px-3 text-xs font-semibold">
            <option value="all">Todas</option>
            <option value="store">Produtos da loja</option>
            <option value="assistance">Assistência técnica</option>
            <option value="parts">Peças</option>
          </select>
        </div>
        <div className="mt-7 flex h-48 items-end gap-2 border-b pb-1">
          {salesByDay.map(day=><div key={day.date} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-2">
            <span className="text-[10px] font-semibold text-muted-foreground">{day.total?money(day.total).replace("R$ ",""):"—"}</span>
            <div className="flex h-32 w-full items-end justify-center"><div title={day.date+": "+money(day.total)} className="w-full max-w-8 rounded-t-md bg-primary/80 transition-all" style={{height:day.total?String(Math.max(10,(day.total/maxDay)*100))+"%":"4%"}}/></div>
            <span className="text-[10px] font-medium text-muted-foreground">{day.label}</span>
          </div>)}
        </div>
        <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">{salesByDay.map(day=><span key={day.date}>{day.date}</span>)}</div>
      </div>
    </section>

    <section className="rounded-lg border bg-card shadow-card">
      <div className="flex items-center justify-between gap-3 border-b px-5 py-4"><div><h2 className="font-bold">Produtos em baixo estoque</h2><p className="text-xs text-muted-foreground">Consulte a lista completa somente quando precisar</p></div><Button variant="outline" size="sm" onClick={()=>onSection("Estoque")}>Ver tudo</Button></div>
      <div className="flex items-center justify-between p-5"><div><p className="text-sm font-semibold">{lowStockCount?lowStockCount+" item(ns) precisam de reposição.":"Nenhum item abaixo do estoque mínimo."}</p><p className="mt-1 text-xs text-muted-foreground">Os detalhes ficam concentrados na área de estoque para manter a tela inicial limpa.</p></div><PackageSearch className="size-8 text-primary"/></div>
    </section>
  </div>
}
function InfoCard({icon:Icon,title,text}:{icon:typeof History;title:string;text:string}){return <article className="rounded-lg border bg-card p-5 shadow-card"><Icon className="size-5 text-primary"/><h3 className="mt-4 font-bold">{title}</h3><p className="mt-1 text-sm text-muted-foreground">{text}</p></article>}
function OrderTable({orders,onView,onDelete}:{orders:Order[];onView?:(o:Order)=>void;onDelete?:(o:Order)=>void}){return <div className="overflow-x-auto"><table className="w-full min-w-[800px] text-left text-sm"><thead><tr className="text-xs text-muted-foreground"><th className="px-5 py-3">ORDEM</th><th className="px-3 py-3">CLIENTE / EQUIPAMENTO</th><th className="px-3 py-3">STATUS</th><th className="px-3 py-3">VALOR</th><th className="px-5 py-3">AÇÕES</th></tr></thead><tbody>{orders.map(o=><tr key={o.id} className="border-t hover:bg-muted/50"><td className="px-5 py-4 font-bold text-primary">{o.id}</td><td className="px-3 py-4"><div className="font-semibold">{o.client}</div><div className="text-xs text-muted-foreground">{o.device}</div></td><td className="px-3 py-4"><span className={`status status-${o.tone}`}><i/>{o.stage}</span></td><td className="px-3 py-4 font-semibold">{o.total?money(o.total):"—"}</td><td className="px-5 py-4"><div className="flex items-center gap-1">{onView&&<Button variant="ghost" size="sm" onClick={()=>onView(o)}><Eye/>Abrir</Button>}{onDelete&&<Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" aria-label={`Excluir ordem ${o.id}`} title="Excluir ordem" onClick={()=>onDelete(o)}><Trash2 className="size-4"/></Button>}</div></td></tr>)}</tbody></table>{!orders.length&&<Empty text="Nenhuma ordem encontrada."/>}</div>}
function OrdersView({orders,onNew,onView,onDelete}:{orders:Order[];onNew:()=>void;onView:(o:Order)=>void;onDelete:(o:Order)=>void}){return <section className="rounded-lg border bg-card shadow-card"><div className="flex items-center justify-between border-b p-5"><div><h2 className="font-bold">Todas as ordens</h2><p className="text-xs text-muted-foreground">Pesquise por número, cliente, documento ou equipamento</p></div><Button onClick={onNew}><Plus/>Nova ordem</Button></div><OrderTable orders={orders} onView={onView} onDelete={onDelete}/></section>}
function CustomersView({customers,orders,onNew,onDelete}:{customers:Customer[];orders:Order[];onNew:()=>void;onDelete:(c:Customer)=>void}){return <section className="rounded-lg border bg-card shadow-card"><div className="flex items-center justify-between border-b p-5"><div><h2 className="font-bold">Cadastro de clientes</h2><p className="text-xs text-muted-foreground">Pessoas físicas e empresas com histórico completo</p></div><Button onClick={onNew}><Plus/>Novo cliente</Button></div><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead><tr className="text-xs text-muted-foreground"><th className="px-5 py-3">NOME</th><th className="px-3 py-3">DOCUMENTO</th><th className="px-3 py-3">CONTATO</th><th className="px-5 py-3">ATENDIMENTOS</th><th className="px-5 py-3">AÇÕES</th></tr></thead><tbody>{customers.map(c=><tr key={c.id} className="border-t"><td className="px-5 py-4 font-semibold">{c.name}</td><td className="px-3 py-4">{c.document}</td><td className="px-3 py-4"><div>{c.phone}</div><div className="text-xs text-muted-foreground">{c.email}</div></td><td className="px-5 py-4 font-semibold">{orders.filter(o=>o.customerId===c.id).length}</td><td className="px-5 py-4"><Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" aria-label={`Excluir cliente ${c.name}`} title="Excluir cliente" onClick={()=>onDelete(c)}><Trash2 className="size-4"/></Button></td></tr>)}</tbody></table>{!customers.length&&<Empty text="Nenhum cliente encontrado."/>}</div></section>}
function StockView({stock,onNew,onMove,onDelete}:{stock:Stock[];onNew:()=>void;onMove:(s:Stock)=>void;onDelete:(s:Stock)=>void}){return <div className="space-y-5"><div className="grid gap-3 sm:grid-cols-3"><Stat label="Peças cadastradas" value={String(stock.length)}/><Stat label="Custo em estoque" value={money(stock.reduce((a,s)=>a+s.cost*s.quantity,0))}/><Stat label="Reposição necessária" value={String(stock.filter(s=>s.quantity<=s.minimum).length)}/></div><section className="rounded-lg border bg-card shadow-card"><div className="flex items-center justify-between border-b p-5"><div><h2 className="font-bold">Peças e produtos</h2><p className="text-xs text-muted-foreground">Saldo, preço, localização e histórico de movimentações</p></div><Button onClick={onNew}><Plus/>Nova peça</Button></div><div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead><tr className="text-xs text-muted-foreground"><th className="px-5 py-3">PEÇA / SKU</th><th className="px-3 py-3">LOCAL</th><th className="px-3 py-3">SALDO</th><th className="px-3 py-3">CUSTO / VENDA</th><th className="px-5 py-3">MOVIMENTAR</th><th className="px-4 py-3">AÇÕES</th></tr></thead><tbody>{stock.map(s=><tr key={s.id} className="border-t"><td className="px-5 py-4"><div className="font-semibold">{s.name}</div><div className="text-xs text-muted-foreground">{s.sku} • {s.category}</div></td><td className="px-3 py-4">{s.location}</td><td className="px-3 py-4"><span className={s.quantity<=s.minimum?"font-bold text-destructive":"font-bold text-success"}>{s.quantity}</span><span className="text-xs text-muted-foreground"> / mín. {s.minimum}</span></td><td className="px-3 py-4"><div>{money(s.cost)}</div><div className="text-xs text-muted-foreground">Venda {money(s.price)}</div></td><td className="px-5 py-4"><Button variant="outline" size="sm" onClick={()=>onMove(s)}><ArrowDownToLine/>Entrada / saída</Button></td><td className="px-4 py-4"><Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" aria-label={`Excluir peça ${s.name}`} title="Excluir peça" onClick={()=>onDelete(s)}><Trash2 className="size-4"/></Button></td></tr>)}</tbody></table>{!stock.length&&<Empty text="Nenhuma peça encontrada."/>}</div></section></div>}
function WarrantyView({warranties,onNew,onView}:{warranties:Warranty[];onNew:()=>void;onView:(w:Warranty)=>void}){return <section className="rounded-lg border bg-card shadow-card"><div className="flex items-center justify-between border-b p-5"><div><h2 className="font-bold">Garantias emitidas</h2><p className="text-xs text-muted-foreground">Certificados vinculados às ordens de serviço</p></div><Button onClick={onNew}><Plus/>Emitir garantia</Button></div><div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left text-sm"><thead><tr className="text-xs text-muted-foreground"><th className="px-5 py-3">CÓDIGO / ORDEM</th><th className="px-3 py-3">CLIENTE / EQUIPAMENTO</th><th className="px-3 py-3">VALIDADE</th><th className="px-5 py-3">DOCUMENTO</th></tr></thead><tbody>{warranties.map(w=><tr key={w.id} className="border-t"><td className="px-5 py-4 font-bold text-primary">{w.id}<div className="text-xs font-normal text-muted-foreground">{w.orderId}</div></td><td className="px-3 py-4"><div className="font-semibold">{w.customer}</div><div className="text-xs text-muted-foreground">{w.device}</div></td><td className="px-3 py-4">{w.starts} a {w.expires}</td><td className="px-5 py-4"><Button variant="outline" size="sm" onClick={()=>onView(w)}><FileDown/>Abrir certificado</Button></td></tr>)}</tbody></table></div></section>}
function Stat({label,value}:{label:string;value:string}){return <div className="rounded-lg border bg-card p-5 shadow-card"><p className="text-xs font-semibold text-muted-foreground">{label}</p><p className="mt-2 text-2xl font-bold">{value}</p></div>}
function Empty({text}:{text:string}){return <div className="p-10 text-center text-sm text-muted-foreground">{text}</div>}
function Placeholder({section}:{section:Section}){return <div className="flex min-h-[430px] flex-col items-center justify-center rounded-lg border border-dashed bg-card px-6 text-center"><Building2 className="size-8 text-primary"/><h2 className="mt-5 text-xl font-bold">{section}</h2><p className="mt-2 max-w-md text-sm text-muted-foreground">Esta área mantém o controle administrativo já previsto para a plataforma.</p></div>}
function Field({label,children}:{label:string;children:React.ReactNode}){return <label className="grid gap-1.5 text-sm font-semibold">{label}{children}</label>}
function FormActions({close,label}:{close:()=>void;label:string}){return <div className="mt-2 flex justify-end gap-2"><Button type="button" variant="outline" onClick={close}>Cancelar</Button><Button type="submit"><Check/>{label}</Button></div>}

function CompanySettingsDialog({open,close,company,organizationId,onSave}:{open:boolean;close:()=>void;company:CompanySettings;organizationId:string|null;onSave:(c:CompanySettings)=>void}){
  const [logoPreview,setLogoPreview]=useState(company.logoUrl);
  const [uploading,setUploading]=useState(false);
  useEffect(()=>{if(open)setLogoPreview(company.logoUrl)},[open,company.logoUrl]);
  const submit=async(e:React.FormEvent<HTMLFormElement>)=>{
    e.preventDefault();
    const f=new FormData(e.currentTarget);
    const next={name:String(f.get("name")||"").trim(),document:String(f.get("document")||"").trim(),email:String(f.get("email")||"").trim(),phone:String(f.get("phone")||"").trim(),address:String(f.get("address")||"").trim(),logoUrl:logoPreview||""};
    if(!next.name){alert("Informe o nome da empresa.");return}
    onSave(next);
  };
  const uploadLogo=async(file:File)=>{
    if(!organizationId)return;
    if(!file.type.startsWith("image/")){alert("Selecione uma imagem PNG, JPG/JPEG ou WEBP.");return}
    if(file.size>2*1024*1024){alert("A logo deve ter no máximo 2 MB.");return}
    setUploading(true);
    const ext=(file.name.split(".").pop()||"png").toLowerCase().replace(/[^a-z0-9]/g,"");
    const path=organizationId+"/logo."+ext;
    const {error}=await supabase.storage.from("organization-assets").upload(path,file,{upsert:true,contentType:file.type,cacheControl:"3600"});
    if(error){setUploading(false);alert("Não foi possível enviar a logo: "+error.message);return}
    const {data}=supabase.storage.from("organization-assets").getPublicUrl(path);
    setLogoPreview(data.publicUrl+"?v="+Date.now());
    setUploading(false);
  };
  return <Dialog open={open} onOpenChange={v=>!v&&close()}><DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl"><DialogHeader><DialogTitle>Configurar empresa</DialogTitle><DialogDescription>Esses dados serão usados nos documentos da empresa, como ordens de serviço e certificados de garantia.</DialogDescription></DialogHeader>
    <form className="grid gap-5" onSubmit={submit}>
      <div className="flex flex-col gap-4 rounded-lg border bg-muted/30 p-4 sm:flex-row sm:items-center">
        <div className="grid size-24 shrink-0 place-items-center overflow-hidden rounded-lg border bg-background">{logoPreview?<img src={logoPreview} alt="Logo da empresa" className="max-h-full max-w-full object-contain"/>:<Building2 className="size-8 text-muted-foreground"/>}</div>
        <div className="grid gap-2"><p className="font-semibold">Logo da empresa</p><p className="text-xs text-muted-foreground">PNG, JPG/JPEG ou WEBP • máximo 2 MB</p><label className="inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-md border bg-background px-3 text-sm font-semibold">{uploading?"Enviando…":<><Upload className="size-4"/>Escolher logo</>}<input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" disabled={uploading} onChange={e=>{const file=e.target.files?.[0];if(file)uploadLogo(file)}}/></label></div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nome / razão social"><Input name="name" defaultValue={company.name} required/></Field>
        <Field label="CNPJ"><Input name="document" defaultValue={company.document} placeholder="00.000.000/0001-00"/></Field>
        <Field label="Telefone / WhatsApp"><Input name="phone" defaultValue={company.phone} placeholder="(45) 99999-9999"/></Field>
        <Field label="E-mail"><Input name="email" type="email" defaultValue={company.email} placeholder="contato@empresa.com"/></Field>
      </div>
      <Field label="Endereço"><Input name="address" defaultValue={company.address} placeholder="Rua, número, bairro, cidade - UF"/></Field>
      <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground">A logo e os dados cadastrados aparecem no cabeçalho dos documentos impressos ou salvos em PDF.</div>
      <FormActions close={close} label="Salvar dados da empresa"/>
    </form>
  </DialogContent></Dialog>
}
function CustomerDialog({open,close,onSave}:{open:boolean;close:()=>void;onSave:(c:Customer&{address?:string;notes?:string})=>void}){return <Dialog open={open} onOpenChange={v=>!v&&close()}><DialogContent className="sm:max-w-2xl"><DialogHeader><DialogTitle>Novo cliente</DialogTitle><DialogDescription>Cadastre nome e documento em campos separados para localizar o cliente nas ordens.</DialogDescription></DialogHeader><form className="grid gap-4" onSubmit={e=>{e.preventDefault();const f=new FormData(e.currentTarget);onSave({id:crypto.randomUUID(),name:String(f.get("name")),document:String(f.get("document")),phone:String(f.get("phone")),email:String(f.get("email")),address:String(f.get("address")||""),notes:String(f.get("notes")||"")})}}><div className="grid gap-4 sm:grid-cols-2"><Field label="Nome / razão social"><Input name="name" required placeholder="Nome completo"/></Field><Field label="CPF / CNPJ"><Input name="document" required placeholder="000.000.000-00"/></Field><Field label="Telefone"><Input name="phone" required placeholder="(45) 99999-9999"/></Field><Field label="E-mail"><Input name="email" type="email" placeholder="cliente@email.com"/></Field></div><Field label="Endereço"><Input name="address" placeholder="Rua, número, bairro e cidade"/></Field><Field label="Observações"><Textarea name="notes" placeholder="Preferências e informações importantes"/></Field><FormActions close={close} label="Cadastrar cliente"/></form></DialogContent></Dialog>}
function StockDialog({open,close,onSave}:{open:boolean;close:()=>void;onSave:(s:Stock)=>void}){return <Dialog open={open} onOpenChange={v=>!v&&close()}><DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl"><DialogHeader><DialogTitle>Nova peça ou produto</DialogTitle><DialogDescription>Defina saldo inicial, estoque mínimo, custos e localização.</DialogDescription></DialogHeader><form className="grid gap-4" onSubmit={e=>{e.preventDefault();const f=new FormData(e.currentTarget),qty=Number(f.get("quantity"));onSave({id:crypto.randomUUID(),sku:String(f.get("sku")),name:String(f.get("name")),category:String(f.get("category")),supplier:String(f.get("supplier")),location:String(f.get("location")),quantity:qty,minimum:Number(f.get("minimum")),cost:Number(f.get("cost")),price:Number(f.get("price")),movements:qty?[{type:"Entrada",quantity:qty,date:today(),note:"Saldo inicial"}]:[]})}}><div className="grid gap-4 sm:grid-cols-2"><Field label="Nome da peça"><Input name="name" required placeholder="Ex.: Conector de carga"/></Field><Field label="SKU / código"><Input name="sku" required placeholder="CON-IP14"/></Field><Field label="Categoria"><Input name="category" required placeholder="Conectores"/></Field><Field label="Fornecedor"><Input name="supplier" placeholder="Nome do fornecedor"/></Field><Field label="Localização"><Input name="location" placeholder="A-01"/></Field><Field label="Saldo inicial"><Input name="quantity" type="number" min="0" step="1" defaultValue="0" required/></Field><Field label="Estoque mínimo"><Input name="minimum" type="number" min="0" step="1" defaultValue="1" required/></Field><Field label="Custo unitário"><Input name="cost" type="number" min="0" step="0.01" required/></Field><Field label="Preço de venda"><Input name="price" type="number" min="0" step="0.01" required/></Field></div><FormActions close={close} label="Cadastrar peça"/></form></DialogContent></Dialog>}
function MovementDialog({open,item,close,onSave}:{open:boolean;item:Stock|null;close:()=>void;onSave:(id:string,n:number,t:string,note:string)=>void}){const [type,setType]=useState("entry");if(!item)return null;return <Dialog open={open} onOpenChange={v=>!v&&close()}><DialogContent><DialogHeader><DialogTitle>Movimentar estoque</DialogTitle><DialogDescription>{item.name} • saldo atual: {item.quantity}</DialogDescription></DialogHeader><form className="grid gap-4" onSubmit={e=>{e.preventDefault();const f=new FormData(e.currentTarget),n=Number(f.get("quantity"));if(type==="exit"&&n>item.quantity){alert("A saída não pode ser maior que o saldo disponível.");return}onSave(item.id,n,type,String(f.get("note")))}}><div className="grid grid-cols-2 gap-2"><Button type="button" variant={type==="entry"?"default":"outline"} onClick={()=>setType("entry")}><Plus/>Entrada</Button><Button type="button" variant={type==="exit"?"default":"outline"} onClick={()=>setType("exit")}><Minus/>Saída</Button></div><Field label="Quantidade"><Input name="quantity" type="number" min="1" max={type==="exit"?item.quantity:undefined} required/></Field><Field label="Motivo / referência"><Input name="note" required placeholder="Compra, ajuste, perda…"/></Field><div className="rounded-md bg-muted p-3"><p className="text-xs font-bold">Últimas movimentações</p>{item.movements.slice(0,3).map((m,i)=><p key={i} className="mt-2 text-xs text-muted-foreground">{m.date} • {m.type} • {m.quantity} un. • {m.note}</p>)}</div><FormActions close={close} label="Registrar movimentação"/></form></DialogContent></Dialog>}
function CustomerPicker({customers,onSelect}:{customers:Customer[];onSelect:(id:string)=>void}){const [open,setOpen]=useState(false),[term,setTerm]=useState(""),[chosen,setChosen]=useState<Customer|null>(null);const found=customers.filter(c=>`${c.name} ${c.document}`.toLowerCase().includes(term.toLowerCase()));return <div className="relative"><span className="mb-1.5 block text-sm font-semibold">Cliente</span><Button type="button" variant="outline" className="h-auto min-h-10 w-full justify-between text-left font-normal" onClick={()=>setOpen(v=>!v)}><span>{chosen?<><b>{chosen.name}</b><span className="ml-2 text-muted-foreground">{chosen.document}</span></>:"Selecione pelo nome ou documento"}</span><ChevronDown className="size-4 shrink-0"/></Button>{open&&<div className="absolute z-20 mt-1 w-full rounded-md border bg-popover p-2 shadow-lg"><div className="relative"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/><Input autoFocus value={term} onChange={e=>setTerm(e.target.value)} placeholder="Pesquisar nome, CPF ou CNPJ" className="pl-9"/></div><div className="mt-2 max-h-48 overflow-y-auto">{found.map(c=><Button key={c.id} type="button" variant="ghost" className="h-auto w-full justify-start py-2 text-left" onClick={()=>{setChosen(c);onSelect(c.id);setOpen(false)}}><span><b className="block">{c.name}</b><small className="text-muted-foreground">{c.document}</small></span></Button>)}{!found.length&&<p className="p-3 text-sm text-muted-foreground">Nenhum cliente encontrado.</p>}</div></div>}</div>}
function OrderDialog({open,customers,stock,close,onSave}:{open:boolean;customers:Customer[];stock:Stock[];close:()=>void;onSave:(o:Order,p:{id:string;quantity:number}|null)=>void}){
  const [customerId,setCustomerId]=useState(""),[partId,setPartId]=useState(""),[category,setCategory]=useState(""),[brand,setBrand]=useState(""),[model,setModel]=useState("");
  const brands=Object.keys(deviceCatalog[category]??{});
  const models=(deviceCatalog[category]?.[brand]??[]);
  useEffect(()=>{setBrand("");setModel("")},[category]);
  useEffect(()=>{setModel("")},[brand]);
  return <Dialog open={open} onOpenChange={v=>!v&&close()}><DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
    <DialogHeader><DialogTitle>Nova ordem de serviço</DialogTitle><DialogDescription>Cadastre o aparelho com listas padronizadas e registre o diagnóstico com clareza.</DialogDescription></DialogHeader>
    <form className="grid gap-4" onSubmit={e=>{
      e.preventDefault();
      const f=new FormData(e.currentTarget),c=customers.find(x=>x.id===customerId);
      if(!c){alert("Selecione um cliente cadastrado.");return}
      if(!category||!brand||!model){alert("Selecione categoria, marca e modelo do aparelho.");return}
      const part=stock.find(x=>x.id===partId),qty=Number(f.get("partQuantity")||0);
      if(part&&qty>part.quantity){alert("A quantidade da peça é maior que o saldo disponível.");return}
      const parts=part&&qty?[{name:part.name,quantity:qty,price:part.price}]:[];
      const total=Number(f.get("serviceValue")||0)+parts.reduce((a,p)=>a+p.quantity*p.price,0);
      onSave({id:"OS-PENDENTE",customerId:c.id,client:c.name,document:c.document,device:`${brand} ${model}`,deviceCategory:category,brand,model,serial:String(f.get("serial")||""),issue:String(f.get("issue")||""),apparentIssue:String(f.get("apparentIssue")||""),terms:String(f.get("terms")||""),stage:"Recebida",tech:"Não atribuído",total,due:String(f.get("due")||"A definir"),tone:"slate",parts},part&&qty?{id:part.id,quantity:qty}:null)
    }}>
      <CustomerPicker customers={customers} onSelect={setCustomerId}/>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Tipo de equipamento"><select name="category" value={category} onChange={e=>setCategory(e.target.value)} required className="h-10 rounded-md border bg-background px-3 text-sm"><option value="">Selecione</option>{Object.keys(deviceCatalog).map(x=><option key={x} value={x}>{x}</option>)}</select></Field>
        <Field label="Marca"><select name="brand" value={brand} onChange={e=>setBrand(e.target.value)} disabled={!category} required className="h-10 rounded-md border bg-background px-3 text-sm"><option value="">{category?"Selecione a marca":"Escolha o tipo primeiro"}</option>{brands.map(x=><option key={x} value={x}>{x}</option>)}</select></Field>
        <Field label="Modelo"><select name="model" value={model} onChange={e=>setModel(e.target.value)} disabled={!brand} required className="h-10 rounded-md border bg-background px-3 text-sm"><option value="">{brand?"Selecione o modelo":"Escolha a marca primeiro"}</option>{models.map(x=><option key={x} value={x}>{x}</option>)}</select></Field>
        <Field label="Número de série / IMEI"><Input name="serial" placeholder="Identificação do aparelho"/></Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Defeito relatado pelo cliente"><Textarea name="issue" required placeholder="O que o cliente informou ao deixar o aparelho"/></Field>
        <Field label="Defeito aparente / constatado"><Textarea name="apparentIssue" placeholder="Sinais, danos e sintomas observados na recepção"/></Field>
      </div>
      <Field label="Termos da ordem de serviço"><Textarea name="terms" placeholder="Deixe em branco por enquanto ou registre os termos que você definir para sua segurança."/></Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Peça do estoque (opcional)"><select name="part" value={partId} onChange={e=>setPartId(e.target.value)} className="h-10 rounded-md border bg-background px-3 text-sm"><option value="">Nenhuma peça</option>{stock.filter(s=>s.quantity>0).map(s=><option key={s.id} value={s.id}>{s.name} — saldo {s.quantity}</option>)}</select></Field>
        <Field label="Quantidade da peça"><Input name="partQuantity" type="number" min="0" defaultValue="0"/></Field>
        <Field label="Valor do serviço"><Input name="serviceValue" type="number" min="0" step="0.01" defaultValue="0"/></Field>
        <Field label="Previsão"><Input name="due" type="date"/></Field>
      </div>
      <FormActions close={close} label="Criar ordem"/>
    </form>
  </DialogContent></Dialog>
}
function WarrantyDialog({open,orders,close,onSave}:{open:boolean;orders:Order[];close:()=>void;onSave:(w:Warranty)=>void}){return <Dialog open={open} onOpenChange={v=>!v&&close()}><DialogContent><DialogHeader><DialogTitle>Emitir garantia</DialogTitle><DialogDescription>Crie o certificado a partir de uma ordem de serviço.</DialogDescription></DialogHeader><form className="grid gap-4" onSubmit={e=>{e.preventDefault();const f=new FormData(e.currentTarget),o=orders.find(x=>x.id===f.get("order"));if(!o)return;const days=Number(f.get("days"));onSave({id:`GAR-${crypto.randomUUID().slice(0,6).toUpperCase()}`,orderId:o.id,customer:o.client,device:o.device,starts:today(),expires:addDays(days),coverage:String(f.get("coverage")),status:"Ativa"})}}><Field label="Ordem de serviço"><select name="order" required className="h-10 rounded-md border bg-background px-3 text-sm"><option value="">Selecione a ordem</option>{orders.map(o=><option key={o.id} value={o.id}>{o.id} — {o.client} — {o.device}</option>)}</select></Field><Field label="Prazo de garantia"><select name="days" className="h-10 rounded-md border bg-background px-3 text-sm"><option value="30">30 dias</option><option value="90">90 dias</option><option value="180">180 dias</option><option value="365">1 ano</option></select></Field><Field label="Cobertura"><Textarea name="coverage" required placeholder="Serviços e peças cobertos"/></Field><Field label="Condições e exclusões"><Textarea name="terms" placeholder="Mau uso, líquidos, danos físicos…"/></Field><FormActions close={close} label="Emitir garantia"/></form></DialogContent></Dialog>}
function OrderDocumentDialog({open,order,close,company}:{open:boolean;order:Order|null;close:()=>void;company:CompanySettings}){if(!order)return null;const body=`<h1>Ordem de serviço ${escapeHtml(order.id)}</h1><div class="muted">Emitida em ${today()}</div><h2>Cliente</h2><div class="grid"><div><b>Nome</b><br>${escapeHtml(order.client)}</div><div><b>Documento</b><br>${escapeHtml(order.document)}</div></div><h2>Equipamento</h2><div class="grid"><div><b>Equipamento</b><br>${escapeHtml(order.device)}</div><div><b>Série / IMEI</b><br>${escapeHtml(order.serial||"Não informado")}</div></div><h2>Defeito relatado pelo cliente</h2><div class="box">${escapeHtml(order.issue)}</div><h2>Defeito aparente / constatado</h2><div class="box">${escapeHtml(order.apparentIssue||"Não informado")}</div><h2>Termos da ordem de serviço</h2><div class="box">${escapeHtml(order.terms||"Não informado")}</div><h2>Itens e valores</h2>${order.parts.map(p=>`<div class="row"><span>${p.quantity}x ${escapeHtml(p.name)}</span><b>${money(p.quantity*p.price)}</b></div>`).join("")}<div class="row total"><span>Total da ordem</span><span>${money(order.total)}</span></div><h2>Situação</h2><div class="box">${escapeHtml(order.stage)} • Previsão: ${escapeHtml(order.due)}</div>`;return <DocumentDialog open={open} close={close} title={`Ordem ${order.id}`} subtitle={`${order.client} • ${order.device}`} onPrint={()=>printDocument(`Ordem ${order.id}`,body,company)}><div className="grid gap-4 sm:grid-cols-2"><DocItem label="Cliente" value={order.client}/><DocItem label="Documento" value={order.document}/><DocItem label="Equipamento" value={order.device}/><DocItem label="Série / IMEI" value={order.serial||"Não informado"}/></div><div className="rounded-md bg-muted p-4"><p className="text-xs font-bold text-muted-foreground">DEFEITO RELATADO</p><p className="mt-1 text-sm">{order.issue}</p></div><div className="flex justify-between border-t pt-4 font-bold"><span>Total</span><span>{money(order.total)}</span></div></DocumentDialog>}
function WarrantyDocumentDialog({open,warranty,close,company}:{open:boolean;warranty:Warranty|null;close:()=>void;company:CompanySettings}){if(!warranty)return null;const body=`<h1>Certificado de garantia</h1><div class="muted">Código de autenticidade: ${escapeHtml(warranty.id)}</div><h2>Referência</h2><div class="grid"><div><b>Ordem</b><br>${escapeHtml(warranty.orderId)}</div><div><b>Cliente</b><br>${escapeHtml(warranty.customer)}</div><div><b>Equipamento</b><br>${escapeHtml(warranty.device)}</div><div><b>Validade</b><br>${escapeHtml(warranty.starts)} a ${escapeHtml(warranty.expires)}</div></div><h2>Cobertura</h2><div class="box">${escapeHtml(warranty.coverage)}</div><h2>Condições gerais</h2><div class="box">A garantia cobre exclusivamente os serviços e peças descritos neste certificado. Danos por mau uso, líquidos, quedas, violação ou intervenção de terceiros não estão cobertos.</div>`;return <DocumentDialog open={open} close={close} title="Certificado de garantia" subtitle={`${warranty.id} • ${warranty.orderId}`} onPrint={()=>printDocument(`Garantia ${warranty.id}`,body,company)}><div className="grid gap-4 sm:grid-cols-2"><DocItem label="Cliente" value={warranty.customer}/><DocItem label="Equipamento" value={warranty.device}/><DocItem label="Início" value={warranty.starts}/><DocItem label="Validade" value={warranty.expires}/></div><div className="rounded-md bg-muted p-4"><p className="text-xs font-bold text-muted-foreground">COBERTURA</p><p className="mt-1 text-sm">{warranty.coverage}</p></div></DocumentDialog>}
function DocumentDialog({open,close,title,subtitle,onPrint,children}:{open:boolean;close:()=>void;title:string;subtitle:string;onPrint:()=>void;children:React.ReactNode}){return <Dialog open={open} onOpenChange={v=>!v&&close()}><DialogContent className="sm:max-w-2xl"><DialogHeader><DialogTitle>{title}</DialogTitle><DialogDescription>{subtitle}</DialogDescription></DialogHeader><div className="grid gap-4">{children}<div className="flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:justify-end"><Button variant="outline" onClick={close}>Fechar</Button><Button onClick={onPrint}><Printer/>Imprimir / Salvar PDF</Button></div></div></DialogContent></Dialog>}
function DocItem({label,value}:{label:string;value:string}){return <div><p className="text-xs font-bold text-muted-foreground">{label.toUpperCase()}</p><p className="mt-1 text-sm font-semibold">{value}</p></div>}
