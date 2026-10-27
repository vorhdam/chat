import { AppSidebar } from "@/components/blocks/sidebar/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function ComponentsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider className="w-full min-h-[calc(100dvh-8rem)] items-stretch">
      <AppSidebar />
      <SidebarInset className="bg-transparent">
        <ScrollArea>
          <div className="flex w-full h-full justify-center items-center py-10 px-3 lg:px-[10vw] xl:[20vw] 2xl:px-[25vw]">
            {children}
          </div>
        </ScrollArea>
      </SidebarInset>
    </SidebarProvider>
  );
}
