export function Footer() {
    return (
        <footer className="w-full border-t bg-background py-6">
            <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row md:py-0">
                <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                    Built for University of Ruhuna Faculty of Technology undergraduates.
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>&copy; {new Date().getFullYear()} UOR Internships</span>
                </div>
            </div>
        </footer>
    );
}
