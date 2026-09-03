"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";

interface School {
  id: string;
  name: string;
  slug: string;
}

interface SchoolContextType {
  schools: School[];
  currentSchool: School | null;
  setCurrentSchool: (school: School) => void;
  loading: boolean;
}

const SchoolContext = createContext<SchoolContextType>({
  schools: [],
  currentSchool: null,
  setCurrentSchool: () => {},
  loading: true,
});

export function useSchoolContext() {
  return useContext(SchoolContext);
}

export function SchoolProvider({ children }: { children: ReactNode }) {
  const [schools, setSchools] = useState<School[]>([]);
  const [currentSchool, setCurrentSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    supabase
      .from("schools")
      .select("id, name, slug")
      .order("name")
      .then(({ data }) => {
        setSchools(data ?? []);
        if (data && data.length > 0) {
          const saved = localStorage.getItem("super-admin-school");
          const found = saved ? data.find((s) => s.id === saved) : null;
          setCurrentSchool(found ?? data[0]);
        }
        setLoading(false);
      });
  }, []);

  const handleSetSchool = (school: School) => {
    setCurrentSchool(school);
    localStorage.setItem("super-admin-school", school.id);
  };

  return (
    <SchoolContext.Provider
      value={{ schools, currentSchool, setCurrentSchool: handleSetSchool, loading }}
    >
      {children}
    </SchoolContext.Provider>
  );
}
