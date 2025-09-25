import { createFileRoute, Outlet } from '@tanstack/react-router'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from './-components/app-sidebar'

export const Route = createFileRoute('/app/_pathlessLayout')({
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="max-h-screen overflow-y-scroll">
                <Outlet />
            </SidebarInset>
        </SidebarProvider>
    )
}
