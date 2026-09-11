"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Printer,
  Loader2,
  Award,
  Hash,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SubjectResult {
  subjectName: string;
  score: number;
  grade: string | null;
  rank: number | null;
}

interface ReportCardDetail {
  id: string;
  studentId: string;
  examId: string;
  totalScore: number;
  averageScore: number;
  classRank: number | null;
  classSize: number | null;
  overallGrade: string | null;
  remarks: string | null;
  generatedAt: string;
  studentName: string;
  admissionNumber: string;
  className: string;
  examName: string;
  termName: string;
  academicYearName: string;
  subjects: SubjectResult[];
}

const gradeColors: Record<string, string> = {
  A: "bg-emerald-100 text-emerald-800",
  B: "bg-blue-100 text-blue-800",
  C: "bg-yellow-100 text-yellow-800",
  D: "bg-orange-100 text-orange-800",
  E: "bg-red-100 text-red-800",
  F: "bg-red-100 text-red-800",
};

export default function ReportCardDetailPage() {
  const params = useParams();
  const router = useRouter();
  const reportCardId = params.id as string;

  const [reportCard, setReportCard] = useState<ReportCardDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReportCard() {
      try {
        const res = await fetch(`/api/report-cards?id=${reportCardId}`);
        if (!res.ok) {
          setError("Report card not found.");
          setLoading(false);
          return;
        }
        const data = await res.json();
        setReportCard(data.reportCard);
      } catch {
        setError("Failed to load report card.");
      } finally {
        setLoading(false);
      }
    }
    fetchReportCard();
  }, [reportCardId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !reportCard) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">{error ?? "Report card not found."}</p>
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>
    );
  }

  const rankSuffix = (n: number) => {
    if (n % 10 === 1 && n % 100 !== 11) return `${n}st`;
    if (n % 10 === 2 && n % 100 !== 12) return `${n}nd`;
    if (n % 10 === 3 && n % 100 !== 13) return `${n}rd`;
    return `${n}th`;
  };

  return (
    <div className="space-y-6 print:space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Report Card</h1>
        </div>
        <Button variant="outline" size="sm" onClick={() => window.print()}>
          <Printer className="mr-2 h-4 w-4" />
          Print
        </Button>
      </div>

      <Card className="print:border print:shadow-none">
        <CardContent className="p-6 print:p-4">
          <div className="text-center mb-6 border-b border-border pb-4">
            <h2 className="text-xl font-bold text-foreground">
              Student Report Card
            </h2>
            <p className="text-muted-foreground mt-1">
              {reportCard.examName} &mdash; {reportCard.termName} &mdash;{" "}
              {reportCard.academicYearName}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
            <div className="flex items-start gap-2">
              <BookOpen className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Student</p>
                <p className="text-sm font-medium text-foreground">
                  {reportCard.studentName}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Hash className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">
                  Admission No.
                </p>
                <p className="text-sm font-medium text-foreground">
                  {reportCard.admissionNumber}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Award className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Class</p>
                <p className="text-sm font-medium text-foreground">
                  {reportCard.className}
                </p>
              </div>
            </div>
          </div>

          {reportCard.subjects.length > 0 ? (
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-2 text-left font-medium text-muted-foreground">
                      Subject
                    </th>
                    <th className="pb-2 text-right font-medium text-muted-foreground">
                      Score
                    </th>
                    <th className="pb-2 text-center font-medium text-muted-foreground">
                      Grade
                    </th>
                    <th className="pb-2 text-right font-medium text-muted-foreground">
                      Rank
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {reportCard.subjects.map((s) => (
                    <tr
                      key={s.subjectName}
                      className="border-b border-border/50 last:border-0"
                    >
                      <td className="py-2.5 font-medium text-foreground">
                        {s.subjectName}
                      </td>
                      <td className="py-2.5 text-right text-foreground">
                        {s.score}
                      </td>
                      <td className="py-2.5 text-center">
                        {s.grade && (
                          <Badge
                            className={`${gradeColors[s.grade] ?? "bg-gray-100 text-gray-800"} text-xs`}
                          >
                            {s.grade}
                          </Badge>
                        )}
                      </td>
                      <td className="py-2.5 text-right text-muted-foreground">
                        {s.rank ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-6 mb-6">
              No subject results available.
            </p>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-border">
            <div className="text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Total Score
              </p>
              <p className="text-lg font-bold text-foreground mt-0.5">
                {reportCard.totalScore}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Average
              </p>
              <p className="text-lg font-bold text-foreground mt-0.5">
                {reportCard.averageScore.toFixed(1)}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Overall Grade
              </p>
              <div className="mt-0.5">
                {reportCard.overallGrade && (
                  <Badge
                    className={`${gradeColors[reportCard.overallGrade] ?? "bg-gray-100 text-gray-800"} text-sm`}
                  >
                    {reportCard.overallGrade}
                  </Badge>
                )}
              </div>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Class Rank
              </p>
              <p className="text-lg font-bold text-foreground mt-0.5">
                {reportCard.classRank && reportCard.classSize
                  ? `${rankSuffix(reportCard.classRank)} of ${reportCard.classSize}`
                  : "N/A"}
              </p>
            </div>
          </div>

          {reportCard.remarks && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                Remarks
              </p>
              <p className="text-sm text-foreground">{reportCard.remarks}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
