"use client";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";

export function JobImage({ imageUrl, title }: { imageUrl: string; title: string }) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <div className="aspect-video w-full rounded-2xl overflow-hidden border border-slate-100 dark:border-border bg-slate-50 dark:bg-muted/30 cursor-pointer hover:opacity-90 transition-opacity group relative">
                    <div className="absolute inset-x-0 bottom-0 top-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-white font-medium bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm">View Full Image</span>
                    </div>
                    <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
                </div>
            </DialogTrigger>
            <DialogContent className="max-w-[100vw] w-screen h-screen max-h-screen p-0 bg-black/95 backdrop-blur-md border-none rounded-none m-0 shadow-none flex flex-col justify-center items-center">
                <DialogTitle className="sr-only">{title}</DialogTitle>
                <div className="relative w-full h-full flex items-center justify-center p-2 sm:p-4">
                    <img src={imageUrl} alt={title} className="w-full h-full object-contain" />
                </div>
            </DialogContent>
        </Dialog>
    );
}
