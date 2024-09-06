import React from 'react'
import Logo from './Logo'

function Footer() {
    return (
        <>
            <DesktopFooter />
            <MobileFooter />
        </>
    )
}

function MobileFooter() {

    return (
        <div className="block border-separate bg-background md:hidden">
            <footer className="p-8">
                <div className="container mx-auto flex flex-col items-center justify-between gap-6 px-4 sm:flex-row sm:gap-0">
                    <div className="flex items-center gap-2">
                        Logo
                    </div>
                    <p className="text-sm text-muted-foreground">&copy; 2024 FinanceApp. All rights reserved.</p>
                </div>
            </footer>
        </div>
    )
}

function DesktopFooter() {
    return (
        <div className="hidden border-separate bg-background md:block">
            <footer className="py-10 px-4">
                <div className="container mx-auto flex flex-col items-center justify-between gap-6 px-4 sm:flex-row sm:gap-0">
                    <div className="flex items-center gap-2">
                        <Logo />
                    </div>
                    <p className="text-sm text-muted-foreground">&copy; 2024 Wunsch Software LTDA. Todos os direitos reservados.</p>
                </div>
            </footer>
        </div>
    )
}

export default Footer