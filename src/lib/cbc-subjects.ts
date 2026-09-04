import { createClient } from "@/lib/supabase/client";

interface CbcSubject {
  name: string;
  code: string;
  required_room_type?: string;
}

const JUNIOR_SCHOOL_SUBJECTS: CbcSubject[] = [
  { name: "Mathematics", code: "MAT" },
  { name: "English", code: "ENG" },
  { name: "Kiswahili", code: "KIS" },
  { name: "Integrated Science", code: "SCI" },
  { name: "Social Studies", code: "SST" },
  { name: "Creative Arts and Sports", code: "CAS" },
  { name: "Christian Religious Education", code: "CRE" },
  { name: "Islamic Religious Education", code: "IRE" },
  { name: "Hindu Religious Education", code: "HRE" },
  { name: "Pre-Technical and Pre-Career Studies", code: "PTS" },
  { name: "Digital Literacy", code: "DL", required_room_type: "computer" },
  { name: "Home Science", code: "HSC" },
];

const SENIOR_SCHOOL_SUBJECTS: CbcSubject[] = [
  { name: "Mathematics", code: "MAT" },
  { name: "English", code: "ENG" },
  { name: "Kiswahili", code: "KIS" },
  { name: "Community Service Learning", code: "CSL" },
  { name: "Physics", code: "PHY", required_room_type: "lab" },
  { name: "Chemistry", code: "CHM", required_room_type: "lab" },
  { name: "Biology", code: "BIO", required_room_type: "lab" },
  { name: "Computer Science", code: "CMP", required_room_type: "computer" },
  { name: "History", code: "HIS" },
  { name: "Geography", code: "GEO" },
  { name: "Business Studies", code: "BUS" },
  { name: "Religious Studies", code: "RLS" },
  { name: "Fine Art", code: "FAR" },
  { name: "Music", code: "MUS" },
  { name: "Sports Science", code: "SPT" },
  { name: "Home Science", code: "HSC" },
  { name: "Agriculture", code: "AGP" },
];

export async function seedCbcSubjects(
  schoolId: string,
  educationLevel: string
): Promise<{ inserted: number }> {
  const supabase = createClient();

  const { data: existing } = await supabase
    .from("subjects")
    .select("id")
    .eq("school_id", schoolId)
    .limit(1);

  if (existing && existing.length > 0) {
    return { inserted: 0 };
  }

  let subjects: CbcSubject[] = [];

  if (educationLevel === "junior") {
    subjects = JUNIOR_SCHOOL_SUBJECTS;
  } else if (educationLevel === "senior") {
    subjects = SENIOR_SCHOOL_SUBJECTS;
  } else if (educationLevel === "junior_senior") {
    subjects = [...JUNIOR_SCHOOL_SUBJECTS, ...SENIOR_SCHOOL_SUBJECTS];
  }

  if (subjects.length === 0) {
    return { inserted: 0 };
  }

  const rows = subjects.map((s) => ({
    school_id: schoolId,
    name: s.name,
    code: s.code,
    required_room_type: s.required_room_type ?? null,
  }));

  const { error } = await supabase.from("subjects").insert(rows);

  if (error) {
    throw new Error(`Failed to seed CBC subjects: ${error.message}`);
  }

  await supabase
    .from("schools")
    .update({ curriculum_subjects_loaded: true })
    .eq("id", schoolId);

  return { inserted: rows.length };
}

export { JUNIOR_SCHOOL_SUBJECTS, SENIOR_SCHOOL_SUBJECTS };
