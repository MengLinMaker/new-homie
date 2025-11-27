import { SignInButton, SignOutButton, useAuth, UserButton } from '@clerk/clerk-react'
import { ChevronsUpDownIcon, LockIcon, LogOutIcon, SparklesIcon, UserRoundIcon } from 'lucide-react'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'
import {
    DropdownMenu,
    DropdownMenuItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'

function ProfileDropDown() {
    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <div className="absolute w-full h-full z-50 left-0" />
                            <UserButton
                                showName
                                appearance={{
                                    elements: {
                                        avatarBox: {
                                            height: '2rem',
                                            width: '2rem',
                                            borderRadius: '0.75em',
                                        },
                                        userButtonBox: {
                                            flexDirection: 'row-reverse',
                                        },
                                        userButtonOuterIdentifier: {
                                            fontSize: '1rem',
                                            paddingLeft: '0px',
                                            fontWeight: 'normal',
                                        },
                                    },
                                }}
                            />
                            <ChevronsUpDownIcon className="ml-auto" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width)"
                        align="start"
                    >
                        <DropdownMenuItem disabled>
                            <SparklesIcon />
                            Upgrade to Pro
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <a href="/app/profile#/">
                            <DropdownMenuItem>
                                <UserRoundIcon />
                                Profile
                            </DropdownMenuItem>
                        </a>
                        <a href="/app/profile#/security">
                            <DropdownMenuItem>
                                <LockIcon />
                                Security
                            </DropdownMenuItem>
                        </a>
                        <DropdownMenuSeparator />
                        <SignOutButton>
                            <DropdownMenuItem>
                                <LogOutIcon />
                                Sign out
                            </DropdownMenuItem>
                        </SignOutButton>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}

export function AppSidebarHeader() {
    const { isSignedIn, isLoaded } = useAuth()

    if (!isLoaded) {
        return (
            <Skeleton className="h-12 w-full p-2 gap-2 flex">
                <Skeleton className="rounded-lg min-w-8" />
                <Skeleton className="rounded-lg w-full" />
            </Skeleton>
        )
    }
    if (isSignedIn) return <ProfileDropDown />
    return (
        <SignInButton>
            <SidebarMenuButton className="border">
                <span className="mx-auto">Sign in</span>
            </SidebarMenuButton>
        </SignInButton>
    )
}
