export const CA_WEIGHT = 0.4;
export const EXAM_WEIGHT = 0.6;

export interface GradeResult {
  grade: string;
  remark: string;
}

export interface SubjectResult {
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  caScore: number;
  caMaxScore: number;
  caPercentage: number;
  examScore: number;
  examMaxScore: number;
  examPercentage: number;
  finalScore: number;
  grade: string;
  remark: string;
}

export function calculateGrade(score: number): GradeResult {
  if (score >= 75) {
    return { grade: "A", remark: "Excellent" };
  }

  if (score >= 65) {
    return { grade: "B", remark: "Very Good" };
  }

  if (score >= 55) {
    return { grade: "C", remark: "Good" };
  }

  if (score >= 45) {
    return { grade: "D", remark: "Fair" };
  }

  if (score >= 40) {
    return { grade: "E", remark: "Pass" };
  }

  return { grade: "F", remark: "Fail" };
}

export function calculateSubjectResult(input: {
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  caScore: number;
  caMaxScore: number;
  examScore: number;
  examMaxScore: number;
}): SubjectResult {
  const caPercentage =
    input.caMaxScore > 0
      ? (input.caScore / input.caMaxScore) * 100
      : 0;

  const examPercentage =
    input.examMaxScore > 0
      ? (input.examScore / input.examMaxScore) * 100
      : 0;

  const finalScore =
    caPercentage * CA_WEIGHT +
    examPercentage * EXAM_WEIGHT;

  const { grade, remark } = calculateGrade(finalScore);

  return {
    ...input,
    caPercentage,
    examPercentage,
    finalScore,
    grade,
    remark,
  };
}
