import { BarChart3, Boxes, Building2, ChevronLeft, ChevronRight, CircleDollarSign, ClipboardList, FileCheck2, LayoutDashboard, LockKeyhole, Receipt, ShieldCheck, Users, Wrench, X, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type Section = 'Visão geral' | 'Dashboard' | 'Bancada' | 'Ordens de serviço' | 'Clientes' | 'Garantias' | 'Estoque' | 'Financeiro / Vendas' | 'Despesas' | 'Relatórios' | 'Tutoriais' | 'Assinatura' | 'Administração';
export const systemNavigation: { label: Section; icon: typeof Wrench; group?: string }[] = [
  {label:'Visão geral',icon:LayoutDashboard},{label:'Dashboard',icon:BarChart3},
  {label:'Bancada',icon:Wrench,group:'OPERAÇÃO'},{label:'Ordens de serviço',icon:ClipboardList},{label:'Clientes',icon:Users},{label:'Garantias',icon:ShieldCheck},
  {label:'Estoque',icon:Boxes,group:'GESTÃO'},{label:'Financeiro / Vendas',icon:CircleDollarSign},{label:'Despesas',icon:Receipt},{label:'Relatórios',icon:FileCheck2},{label:'Tutoriais',icon:GraduationCap,group:'AJUDA'},
  {label:'Assinatura',icon:CircleDollarSign,group:'PLATAFORMA'},{label:'Administração',icon:Building2},
];
export function SystemSidebar({section,setSection,open,close,collapsed,toggleCollapsed,locked=false}:{section:Section;setSection:(section:Section)=>void;open:boolean;close:()=>void;collapsed:boolean;toggleCollapsed:()=>void;locked?:boolean}) {
  return <>{open && <Button variant="ghost" className="fixed inset-0 z-40 h-auto w-auto rounded-none bg-foreground/30 lg:hidden" onClick={close} aria-label="Fechar menu"/>}
    <aside className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r bg-sidebar transition-[width,transform] duration-200 lg:translate-x-0 ${collapsed?'w-16':'w-64'} ${open?'translate-x-0':'-translate-x-full'}`}>
      <div className={`flex h-16 shrink-0 items-center border-b ${collapsed?'justify-center px-2':'px-4'}`}>
        <span className="grid size-9 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground"><Wrench className="size-5"/></span>
        {!collapsed && <div className="ml-3 min-w-0"><p className="truncate font-display text-sm font-extrabold">Service Pro OS</p><p className="text-[10px] font-bold text-primary">GESTÃO INTELIGENTE</p></div>}
        <Button variant="ghost" size="icon" onClick={toggleCollapsed} className="ml-auto hidden lg:flex" aria-label={collapsed?'Expandir menu':'Minimizar menu'} title={collapsed?'Expandir menu':'Minimizar menu'}>{collapsed?<ChevronRight className="size-4"/>:<ChevronLeft className="size-4"/>}</Button>
        <Button variant="ghost" size="icon" onClick={close} className="ml-auto lg:hidden" aria-label="Fechar menu lateral"><X/></Button>
      </div>
      <nav aria-label="Áreas do sistema" className={`flex-1 overflow-y-auto py-4 ${collapsed?'px-2':'px-3'}`}>
        {systemNavigation.map((item,i)=><div key={item.label}>{item.group&&!collapsed&&<p className={`mb-2 px-3 text-[10px] font-bold text-muted-foreground ${i?'mt-6':''}`}>{item.group}</p>}<Button variant="ghost" onClick={()=>setSection(item.label)} title={locked?`${item.label} · disponível após assinar`:item.label} aria-label={item.label} className={`mb-1 h-10 w-full gap-3 ${collapsed?'justify-center px-2':'justify-start px-3'} ${section===item.label?'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground':'text-sidebar-foreground'}`}><item.icon className="size-[18px] shrink-0"/>{!collapsed&&<span className="flex min-w-0 flex-1 items-center justify-between gap-2"><span className="text-xs">{item.label}</span>{locked&&item.label!=='Assinatura'&&<LockKeyhole className="size-3 shrink-0"/>}</span>}</Button></div>)}
      </nav>
    </aside>
  </>;
}