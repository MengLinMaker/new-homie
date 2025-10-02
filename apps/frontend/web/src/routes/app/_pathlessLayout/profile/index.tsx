import { UserProfile } from '@clerk/clerk-react'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/_pathlessLayout/profile/')({
    component: RouteComponent,
})

const hideElementCss = {
    position: 'absolute',
    visibility: 'hidden',
}

const hideBorderCss = {
    borderRadius: '0px',
    borderWidth: '0px',
}

function RouteComponent() {
    return (
        <UserProfile
            appearance={{
                theme: 'simple',
                elements: {
                    navbar: hideElementCss,
                    navbarMobileMenuRow: hideElementCss,
                    footer: hideElementCss,
                    scrollBox: hideBorderCss,
                    cardBox: hideBorderCss,
                },
            }}
        />
    )
}
