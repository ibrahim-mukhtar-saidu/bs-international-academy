import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

interface StudentPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function StudentProfilePage({
  params,
}: StudentPageProps) {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  const { id } = await params;

  const student = await prisma.studentProfile.findFirst({
    where: {
      id,
      schoolId: session.user.schoolId,
    },
    include: {
      user: true,
      schoolClass: {
        include: {
          section: true,
        },
      },
      session: true,
      school: true,
    },
  });

  if (!student) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {student.user.firstName} {student.user.lastName}
        </h1>

        <p className="mt-1 text-sm text-gray-600">
          Student profile and academic information
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Personal Information</h2>

          <div className="space-y-3 text-sm">
            <div>
              <span className="font-medium text-gray-500">Full Name:</span>{" "}
              {student.user.firstName} {student.user.lastName}
            </div>

            <div>
              <span className="font-medium text-gray-500">Email:</span>{" "}
              {student.user.email}
            </div>

            <div>
              <span className="font-medium text-gray-500">Phone:</span>{" "}
              {student.user.phone ?? "Not provided"}
            </div>

            <div>
              <span className="font-medium text-gray-500">Gender:</span>{" "}
              {student.gender ?? "Not provided"}
            </div>

            <div>
              <span className="font-medium text-gray-500">
                Date of Birth:
              </span>{" "}
              {student.dateOfBirth
                ? student.dateOfBirth.toLocaleDateString()
                : "Not provided"}
            </div>

            <div>
              <span className="font-medium text-gray-500">Address:</span>{" "}
              {student.address ?? "Not provided"}
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">
            Academic Information
          </h2>

          <div className="space-y-3 text-sm">
            <div>
              <span className="font-medium text-gray-500">
                Admission Number:
              </span>{" "}
              {student.admissionNo}
            </div>

            <div>
              <span className="font-medium text-gray-500">Class:</span>{" "}
              {student.schoolClass
                ? `${student.schoolClass.name} (${student.schoolClass.code})`
                : "Not assigned"}
            </div>

            <div>
              <span className="font-medium text-gray-500">Section:</span>{" "}
              {student.schoolClass?.section.name ?? "Not assigned"}
            </div>

            <div>
              <span className="font-medium text-gray-500">
                Academic Session:
              </span>{" "}
              {student.session?.name ?? "Not assigned"}
            </div>

            <div>
              <span className="font-medium text-gray-500">Account Status:</span>{" "}
              {student.user.status}
            </div>

            <div>
              <span className="font-medium text-gray-500">School:</span>{" "}
              {student.school.name}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
