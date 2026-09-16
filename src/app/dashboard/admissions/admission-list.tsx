import AdmissionStatusControl from "./admission-status-control";
import EnrollForm from "./enroll-form";

type AdmissionApplication = {
  id: string;
  reference: string;
  status: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  submittedAt: Date;
  session: {
    name: string;
  };
  section: {
    name: string;
  } | null;
  schoolClass: {
    name: string;
    code: string;
  } | null;
  studentId: string | null;
};

type AdmissionListProps = {
  applications: AdmissionApplication[];
};

function getStatusClasses(status: string) {
  switch (status) {
    case "APPROVED":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "REJECTED":
      return "border-red-200 bg-red-50 text-red-700";

    case "UNDER_REVIEW":
      return "border-blue-200 bg-blue-50 text-blue-700";

    case "WITHDRAWN":
      return "border-slate-200 bg-slate-100 text-slate-600";

    default:
      return "border-amber-200 bg-amber-50 text-amber-700";
  }
}

function formatStatus(status: string) {
  return status
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export default function AdmissionList({
  applications,
}: AdmissionListProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-5 sm:px-7">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-600">
          Application records
        </p>

        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-950">
              Admission Applications
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Review submitted applications and monitor their admission status.
            </p>
          </div>

          <span className="text-sm font-medium text-slate-400">
            {applications.length} application
            {applications.length === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      {applications.length === 0 ? (
        <div className="px-5 py-12 text-center sm:px-7">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            +
          </div>

          <h3 className="mt-4 text-base font-bold text-slate-900">
            No applications yet
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            New admission applications will appear here.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-left">
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-7">
                  Applicant
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Reference
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Placement
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Session
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-7">
                  Submitted
                </th>
              </tr>
            </thead>

            <tbody>
              {applications.map((application) => (
                <tr
                  key={application.id}
                  className="border-b border-slate-100 last:border-0"
                >
                  <td className="px-5 py-4 sm:px-7">
                    <p className="font-semibold text-slate-900">
                      {application.firstName} {application.lastName}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {application.email || application.phone || "No contact"}
                    </p>
                  </td>

                  <td className="px-5 py-4">
                    <span className="font-mono text-xs font-semibold text-slate-700">
                      {application.reference}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <p className="text-sm font-medium text-slate-800">
                      {application.schoolClass?.name ||
                        application.section?.name ||
                        "Not assigned"}
                    </p>

                    {application.schoolClass?.code ? (
                      <p className="mt-1 text-xs text-slate-400">
                        {application.schoolClass.code}
                      </p>
                    ) : null}
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-600">
                    {application.session.name}
                  </td>

                  <td className="px-5 py-4">
                    <div className="space-y-2">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClasses(
                          application.status,
                        )}`}
                      >
                        {formatStatus(application.status)}
                      </span>

                      <AdmissionStatusControl
                        applicationId={application.id}
                        currentStatus={
                          application.status as
                            | "PENDING"
                            | "UNDER_REVIEW"
                            | "APPROVED"
                            | "REJECTED"
                            | "WITHDRAWN"
                        }
                      />

                      {application.status === "APPROVED" &&
                      !application.studentId ? (
                        <EnrollForm
                          applicationId={application.id}
                          defaultEmail={
                            application.email || ""
                          }
                        />
                      ) : null}

                      {application.studentId ? (
                        <span className="text-xs font-semibold text-emerald-600">
                          Student enrolled
                        </span>
                      ) : null}
                    </div>
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-500 sm:px-7">
                    {formatDate(application.submittedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
