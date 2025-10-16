import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
    component: App,
    loader: () => {
        throw redirect({ to: '/app' })
    },
})

function App() {
    return (
        <div className="text-center">
            <header className="min-h-screen flex flex-col items-center justify-center bg-[#282c34] text-white text-[calc(10px+2vmin)]">
                hello
            </header>
        </div>
    )
}
