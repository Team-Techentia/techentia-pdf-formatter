"use client";
import React, { useEffect, useRef } from 'react'
import { useOutsideClick } from '@/hooks';

interface BaseModalProps {
    isOpen: boolean;
    closeModal: () => void;
    children: React.ReactNode;
    className?: string;
};

export default function BaseModal({ isOpen, closeModal, children, className = "" }: BaseModalProps) {

    const modalRef = useRef<HTMLDivElement | null>(null);
    const ref = useRef(null)

    modalRef.current

    useEffect(() => {
        document.body.style.overflow = isOpen ? "hidden" : "";
        return () => { document.body.style.overflow = "" };
    }, [isOpen]);

    useOutsideClick(modalRef, closeModal, isOpen)

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1000] bg-black/30 flex justify-center items-center">
            <div ref={modalRef} className={`relative ${className}`}>
                {children}
            </div>
        </div>
    );
}
