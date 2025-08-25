// @/hooks/useForm.ts
"use client";
import { useState, useEffect } from "react";
import { Form, ApiResponse } from "@/lib/types";

export function useForm() {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const res = await fetch("/api/form");
        const data: ApiResponse<Form[]> = await res.json();

        if (!data.success) {
          throw new Error(data.message || "Failed to fetch forms");
        }

        setForms(data.data || []);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchForms();
  }, []);

  return { forms, loading, error };
}
