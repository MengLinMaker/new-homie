import { BookOpen } from 'lucide-react'
import { Sidebar, SidebarContent, SidebarHeader } from '@/components/ui/sidebar'

import { AppSidebarContent } from './app-sidebar-content'
import { AppSidebarHeader } from './app-sidebar-header'
import { AppSidebarContentDashboards } from './app-sidebar-content-dashboards'

const data = [
    {
        key: '1',
        title: 'Documentation',
        url: '#',
        icon: BookOpen,
        items: [
            {
                title: 'Introduction',
                url: '#',
                key: '3',
            },
            {
                title: 'Get Started',
                url: '#',
                key: '4',
            },
            {
                title: 'Tutorials',
                url: '#',
                key: '5',
            },
            {
                title: 'Changelog',
                url: '#',
                key: '6',
            },
        ],
    },
]

export function AppSidebar() {
    return (
        <Sidebar collapsible="none" className="border-r min-h-screen">
            <SidebarHeader>
                <AppSidebarHeader />
            </SidebarHeader>
            <SidebarContent>
                <AppSidebarContentDashboards name="Projects" draggable />
                <AppSidebarContent items={data} />
            </SidebarContent>
        </Sidebar>
    )
}
