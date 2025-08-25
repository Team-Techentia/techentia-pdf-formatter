'use client';

import { Sidebar, Navbar, ToastProvider } from '@/components';
import { useResize } from '@/hooks';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const { collapsed, setCollapsed } = useResize()

    return (
        <>
            <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
            <ToastProvider />
            <div className={`flex flex-col transition-all duration-300 h-screen ${collapsed ? 'ml-16.25' : 'md:ml-64'}`}>
                <Navbar />
                <main className="px-4 pt-17.5 bg-red-60 h-full">{children}</main>
            </div>
        </>
    );
}
