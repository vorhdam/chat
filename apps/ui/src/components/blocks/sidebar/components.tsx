import packages from "@/packages";
import registry from "@/registry";
import Link from "next/link";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import config from "@repo/config";

export function SidebarComponents() {
  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>Menu</SidebarGroupLabel>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href="/">
              <SidebarMenuButton>Home</SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link href="/about">
              <SidebarMenuButton>About</SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link href={config.ui.github.repository}>
              <SidebarMenuButton>Github</SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
      <SidebarGroup>
        <SidebarGroupLabel>Components</SidebarGroupLabel>
        <SidebarMenu>
          {registry.items.map((item) => (
            <SidebarMenuItem key={item.name}>
              <Link href={`/components/${item.name}`}>
                <SidebarMenuButton>{item.title}</SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>
      <SidebarGroup>
        <SidebarGroupLabel>Packages</SidebarGroupLabel>
        <SidebarMenu>
          {packages.items.map((item) => (
            <SidebarMenuItem key={item.name}>
              <Link href={`/packages/${item.name}`}>
                <SidebarMenuButton>{item.title}</SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>
    </>
  );
}
