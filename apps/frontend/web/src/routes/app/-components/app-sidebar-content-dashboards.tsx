import {
    Collection,
    useDragAndDrop,
    Tree,
    TreeItem,
    TreeItemContent,
    type TreeItemProps,
} from 'react-aria-components'
import { useTreeData } from 'react-stately'
import { EllipsisIcon, FolderIcon, FolderOpenIcon } from 'lucide-react'
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'

type DashboardSummary = {
    key: string
    name: string
    favourite: boolean
    viewed: Date
    edited: Date
    created: Date
}

type ProjectSummary = {
    key: string
    name: string
    children: DashboardSummary[]
}

const placeholder = {
    favourite: false,
    viewed: new Date(),
    edited: new Date(),
    created: new Date(),
}
const items: ProjectSummary[] = [
    {
        key: '1',
        name: 'Project-1',
        children: [
            { key: '2', name: 'Dash-1-1', ...placeholder },
            { key: '3', name: 'Dash-1-2', ...placeholder },
            { key: '4', name: 'Dash-1-3', ...placeholder },
        ],
    },
    {
        key: '5',
        name: 'Project-2',
        children: [
            { key: '6', name: 'Dash-2-1', ...placeholder },
            { key: '7', name: 'Dash-2-2', ...placeholder },
        ],
    },
]

interface DashboardItemProps extends Partial<TreeItemProps> {
    dashboard: DashboardSummary
}

function DashboardItem(props: DashboardItemProps) {
    return (
        <TreeItem textValue={props.dashboard.name} {...props}>
            <TreeItemContent>
                {({ allowsDragging }) => (
                    <SidebarMenuSubItem className="h-8 flex pl-6 gap-1" key={props.dashboard.key}>
                        <SidebarMenuSubButton
                            className="w-full"
                            slot={allowsDragging ? 'drag' : undefined}
                        >
                            {props.dashboard.name}
                        </SidebarMenuSubButton>
                        <Button variant="ghost" className="h-8 w-8">
                            <EllipsisIcon />
                        </Button>
                    </SidebarMenuSubItem>
                )}
            </TreeItemContent>
            {props.children}
        </TreeItem>
    )
}

export function AppSidebarContentDashboards(props: { name: string; draggable?: boolean }) {
    const tree = useTreeData({
        initialItems: items,
    })
    const { dragAndDropHooks } = useDragAndDrop({
        getItems(keys) {
            return [...keys].map((key) => ({
                // biome-ignore lint/style/noNonNullAssertion: <expected to exist>
                'text/plain': tree.getItem(key)!.value.name,
            }))
        },
        onMove(e) {
            let sourceIsDashboard = true
            for (const [key, _] of e.keys.entries()) {
                const sourceNode = tree.getItem(key)
                console.log(sourceNode?.value)
                sourceIsDashboard = !sourceNode?.value.children
            }
            if (!sourceIsDashboard) return

            const targetNode = tree.getItem(e.target.key)
            const targetIsDashboard = !targetNode?.value.children

            // A dashboard can drop before, after or on another dashboard
            if (targetIsDashboard) {
                if (e.target.dropPosition === 'before') return tree.moveBefore(e.target.key, e.keys)
                return tree.moveAfter(e.target.key, e.keys)
            } else {
                // A dashboard can only drop onto folder
                const targetIndex = targetNode.children ? targetNode.children.length : 0
                const keyArray = Array.from(e.keys)
                for (let i = 0; i < keyArray.length; i++) {
                    tree.move(keyArray[i]!, e.target.key, targetIndex + i)
                }
            }
        },
    })

    return (
        <SidebarGroup>
            <SidebarGroupLabel>{props.name}</SidebarGroupLabel>
            <SidebarMenu>
                <Tree
                    aria-label="Tree with hierarchical drag and drop"
                    items={tree.items}
                    dragAndDropHooks={props.draggable ? dragAndDropHooks : (undefined as never)}
                    selectionMode="none"
                >
                    <Collection key="AppSidebarContentDashboards-root" items={tree.items}>
                        {(project) => (
                            <TreeItem textValue={project.value.name}>
                                <TreeItemContent>
                                    {(p) => (
                                        <SidebarMenuItem className="flex gap-1" key={project.key}>
                                            <SidebarMenuButton
                                                onDragStart={(e) => console.log(e)}
                                                tooltip={project.value.name}
                                            >
                                                {p.isExpanded ? <FolderOpenIcon /> : <FolderIcon />}
                                                {project.value.name}
                                            </SidebarMenuButton>
                                            <Button variant="ghost" className="h-8 w-8">
                                                <EllipsisIcon />
                                            </Button>
                                        </SidebarMenuItem>
                                    )}
                                </TreeItemContent>
                                {project.children && (
                                    <Collection key={project.key} items={project.children}>
                                        {(dashboard) => (
                                            <DashboardItem dashboard={dashboard.value as never} />
                                        )}
                                    </Collection>
                                )}
                            </TreeItem>
                        )}
                    </Collection>
                </Tree>
            </SidebarMenu>
        </SidebarGroup>
    )
}
