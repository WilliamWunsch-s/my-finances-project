import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import React, { ReactNode } from "react";

function layout({ children }: { children: ReactNode }) {
    return ( 
    <div className="relative flex h-screen w-full flex-col">
        <Navbar />
        <div className="w-full">{ children }</div>
        <Footer />
    </div>
    )
}

export default layout