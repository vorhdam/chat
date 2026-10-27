import { SidebarComponents } from "@/components/blocks/sidebar/components";
import { Sidebar, SidebarContent } from "@/components/ui/sidebar";

export function AppSidebar() {
  return (
    <Sidebar
      collapsible="icon"
      className="top-14 h-[calc(100svh-7rem)] bg-transparent *:data-[slot=sidebar-inner]:bg-transparent py-4 border-transparent"
    >
      <div className="z-50 absolute top-0 right-0 w-px h-full bg-linear-to-b from-transparent via-border to-transparent not-sm:hidden" />
      <div className="z-50 absolute top-0 bg-linear-to-b from-background to-transparent w-full h-10 not-sm:hidden" />
      <SidebarContent className="relative bg-transparent p-2">
        <SidebarComponents />
      </SidebarContent>
      <div className="z-50 absolute bottom-0 bg-linear-to-t from-background to-transparent w-full h-10 not-sm:hidden" />
    </Sidebar>
  );
}
