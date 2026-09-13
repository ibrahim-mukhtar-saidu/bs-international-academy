import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import EditExaminationForm from "../../edit-examination-form";

interface EditExaminationPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditExaminationPage({
  params,
}: EditExaminationPageProps) {
  const session = await auth();

  if (!session?.user?.schoolId || !session.user.role) {
    redirect("/login");
  }

  if (
    session.user.role !== "ADMIN" &&
    session.user.role !== "PRINCIPAL"
  ) {
    redirect("/dashboard");
  }

  const { id } = await params;

  const examination = await prisma.examination.findFirst({
    where: {
      id,
      schoolId: session.user.schoolId,
    },
    select: {
      id: true,
      name: true,
      description: true,
      maxScore: true,
      session: {
        select: {
          name: true,
        },
      },
      term: {
        select: {
          name: true,
        },
      },
      schoolClass: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!examination) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Edit Examination
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Update the examination details.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Session
            </p>
            <p className="mt-1 font-medium text-slate-900">
              {examination.session.name}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Term
            </p>
            <p className="mt-1 font-medium text-slate-900">
              {examination.term.name}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Class
            </p>
            <p className="mt-1 font-medium text-slate-900">
              {examination.schoolClass.name}
            </p>
          </div>
        </div>
      </div>

      <EditExaminationForm
        examination={{
          id: examination.id,
          name: examination.name,
          description: examination.description,
          maxScore: examination.maxScore.toString(),
        }}
      />
    </div>
  );
}
