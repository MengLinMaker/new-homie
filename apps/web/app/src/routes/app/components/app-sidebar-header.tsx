import { Button } from '@/components/ui/button'
import { SignedIn, SignedOut, SignInButton, SignOutButton, UserButton } from '@clerk/clerk-react'
import { Lock, LogOut, UserRound } from 'lucide-react'
import { SidebarMenuButton } from '@/components/ui/sidebar'

export function AppSidebarHeader() {
    return (
        <>
            <SignedIn treatPendingAsSignedOut>
                <div className="relative p-1 pr-2 w-full flex border rounded-lg">
                    <div className="absolute w-full h-full z-50" />
                    <UserButton
                        showName
                        appearance={{
                            elements: {
                                avatarBox: {
                                    borderRadius: '0.6em',
                                    height: '3em',
                                    width: '3em',
                                },
                                userButtonBox: {
                                    flexDirection: 'row-reverse',
                                },
                            },
                        }}
                    />
                </div>

                {/* <SidebarMenuButton>
                    <Sparkles />
                    Upgrade to Pro
                </SidebarMenuButton> */}
                <SidebarMenuButton>
                    <UserRound />
                    <a href="/app/profile">Profile</a>
                </SidebarMenuButton>
                <SidebarMenuButton>
                    <Lock />
                    <a href="/app/profile#/security">Security</a>
                </SidebarMenuButton>
                <SignOutButton>
                    <SidebarMenuButton>
                        <LogOut />
                        Sign out
                    </SidebarMenuButton>
                </SignOutButton>
            </SignedIn>

            <SignedOut treatPendingAsSignedOut>
                <SignInButton>
                    <Button variant="outline" className="w-full">
                        Sign in
                    </Button>
                </SignInButton>
            </SignedOut>
        </>
    )
}
