import HeroMain from "./Hero";
import { HeroHeader } from "./Header";
import { SidebarInset } from "@/components/ui/sidebar";

export default function Hero() {
    return (
        <SidebarInset className="flex flex-col h-screen">
            <HeroHeader />
            <HeroMain />
        </SidebarInset>
    )
}