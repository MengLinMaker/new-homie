import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
} from '@/components/ui/sidebar'
import { ChevronRight, File, Folder } from 'lucide-react'

const items = [
    ['sale', ['api', ['hello', ['route.ts']], 'page.tsx', 'layout.tsx', ['blog', ['page.tsx']]]],
    ['rent', ['ui', 'button.tsx', 'card.tsx'], 'header.tsx', 'footer.tsx'],
]

export function AppSidebarContentDashboards() {
    return (
        <SidebarGroup>
            <SidebarGroupLabel>Dashboards</SidebarGroupLabel>
            <SidebarGroupContent>
                <SidebarMenu>
                    {items.map((item, index) => (
                        // biome-ignore lint/suspicious/noArrayIndexKey: <temporary>
                        <Tree key={index} item={item} />
                    ))}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    )
}

// biome-ignore lint/suspicious/noExplicitAny: <reccursive>
function Tree({ item }: { item: string | any[] }) {
    const [name, ...items] = Array.isArray(item) ? item : [item]
    if (!items.length) {
        return (
            <SidebarMenuButton
                isActive={name === 'button.tsx'}
                className="data-[active=true]:bg-transparent"
            >
                <File />
                {name}
            </SidebarMenuButton>
        )
    }
    return (
        <SidebarMenuItem>
            <Collapsible
                className="group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90"
                defaultOpen={name === 'components' || name === 'ui'}
            >
                <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                        <ChevronRight className="transition-transform" />
                        <Folder />
                        {name}
                    </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <SidebarMenuSub>
                        {items.map((subItem, index) => (
                            // biome-ignore lint/suspicious/noArrayIndexKey: <temporary>
                            <Tree key={index} item={subItem} />
                        ))}
                    </SidebarMenuSub>
                </CollapsibleContent>
            </Collapsible>
        </SidebarMenuItem>
    )
}
