import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import FeeStructureForm from "./fee-structure-form";
import EditFeeStructureForm from "./edit-fee-structure-form";
import AssignStudentFeeForm from "./assign-student-fee-form";
import RecordPaymentForm from "./record-payment-form";

export default async function FeesPage() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  if (
    session.user.role !== "ADMIN" &&
    session.user.role !== "PRINCIPAL"
  ) {
    return (
      <div className="p-6">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
          You do not have permission to access Fees & Payments.
        </div>
      </div>
    );
  }

  const [feeStructures, studentFees, payments, students, sessions] =
    await Promise.all([
    prisma.feeStructure.findMany({
      where: {
        schoolId: session.user.schoolId,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.studentFee.findMany({
      where: {
        student: {
          schoolId: session.user.schoolId,
        },
      },
      select: {
        id: true,
        amountDue: true,
        amountPaid: true,
        status: true,
        student: {
          select: {
            admissionNo: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        feeStructure: {
          select: {
            name: true,
          },
        },
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
      },
    }),

    prisma.payment.findMany({
      where: {
        studentFee: {
          student: {
            schoolId: session.user.schoolId,
          },
          feeStructure: {
            schoolId: session.user.schoolId,
          },
        },
      },
      orderBy: {
        paidAt: "desc",
      },
      select: {
        id: true,
        receiptNo: true,
        amount: true,
        method: true,
        status: true,
        paidAt: true,
        studentFee: {
          select: {
            student: {
              select: {
                admissionNo: true,
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
            feeStructure: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    }),

    prisma.studentProfile.findMany({
      where: {
        schoolId: session.user.schoolId,
      },
      orderBy: {
        admissionNo: "asc",
      },
      select: {
        id: true,
        admissionNo: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    }),

    prisma.academicSession.findMany({
      where: {
        schoolId: session.user.schoolId,
      },
      orderBy: [
        {
          isCurrent: "desc",
        },
        {
          startYear: "desc",
        },
      ],
      select: {
        id: true,
        name: true,
        terms: {
          orderBy: {
            number: "asc",
          },
          select: {
            id: true,
            name: true,
            number: true,
          },
        },
      },
    }),
  ]);

  const studentOptions = students.map((student) => ({
    id: student.id,
    admissionNo: student.admissionNo,
    name: `${student.user.firstName} ${student.user.lastName}`,
  }));

  const feeOptions = feeStructures
    .filter((fee) => fee.isActive)
    .map((fee) => ({
      id: fee.id,
      name: fee.name,
      amount: Number(fee.amount),
    }));

  const sessionOptions = sessions.map((academicSession) => ({
    id: academicSession.id,
    name: academicSession.name,
    terms: academicSession.terms,
  }));

  const outstandingStudentFees = studentFees
    .filter((fee) => fee.status === "PENDING" || fee.status === "PARTIAL")
    .map((fee) => ({
      id: fee.id,
      studentName: `${fee.student.user.firstName} ${fee.student.user.lastName}`,
      admissionNo: fee.student.admissionNo,
      feeName: fee.feeStructure.name,
      sessionName: fee.session.name,
      termName: fee.term.name,
      amountDue: Number(fee.amountDue),
      amountPaid: Number(fee.amountPaid),
      outstanding: Math.max(
        Number(fee.amountDue) - Number(fee.amountPaid),
        0,
      ),
      status: fee.status,
    }))
    .filter((fee) => fee.outstanding > 0);

  const totalExpected = studentFees.reduce(
    (sum, fee) => sum + Number(fee.amountDue),
    0,
  );

  const totalCollected = payments.reduce(
    (sum, payment) => sum + Number(payment.amount),
    0,
  );

  const outstanding = Math.max(totalExpected - totalCollected, 0);

  const paidCount = studentFees.filter(
    (fee) => fee.status === "PAID",
  ).length;

  const partialCount = studentFees.filter(
    (fee) => fee.status === "PARTIAL",
  ).length;

  const pendingCount = studentFees.filter(
    (fee) => fee.status === "PENDING",
  ).length;

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-3xl bg-slate-950 text-white shadow-xl">
        <div className="relative px-6 py-8 sm:px-8 lg:px-10">
          <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl" />

          <div className="relative">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
              Finance Management
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Fees & Payments
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              Manage school fees, student balances, payment records, and
              receipts from one place.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Expected"
          value={`₦${totalExpected.toLocaleString()}`}
          description="Total fees assigned"
        />

        <StatCard
          label="Collected"
          value={`₦${totalCollected.toLocaleString()}`}
          description="Recorded payments"
        />

        <StatCard
          label="Outstanding"
          value={`₦${outstanding.toLocaleString()}`}
          description="Remaining balance"
        />

        <StatCard
          label="Fee Structures"
          value={feeStructures.length.toString()}
          description="Configured fee types"
        />
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <StatusCard
          label="Paid"
          value={paidCount}
          description="Fully settled"
          className="border-emerald-200 bg-emerald-50"
        />

        <StatusCard
          label="Partial"
          value={partialCount}
          description="Partially paid"
          className="border-amber-200 bg-amber-50"
        />

        <StatusCard
          label="Pending"
          value={pendingCount}
          description="No payment recorded"
          className="border-slate-200 bg-slate-50"
        />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Fee Structures
            </h2>

            <p className="mt-1 text-sm text-slate-600">
              Configure the types of fees your school collects.
            </p>
          </div>

          <FeeStructureForm />
        </div>

        {feeStructures.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <p className="font-semibold text-slate-900">
              No fee structures yet
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Create your first fee structure to begin assigning fees to
              students.
            </p>
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Fee
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Type
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Amount
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Status
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {feeStructures.map((fee) => (
                  <tr key={fee.id}>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900">
                        {fee.name}
                      </p>

                      {fee.description && (
                        <p className="mt-1 text-xs text-slate-500">
                          {fee.description}
                        </p>
                      )}
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-700">
                      {fee.feeType}
                    </td>

                    <td className="px-5 py-4 text-sm font-semibold text-slate-900">
                      ₦{Number(fee.amount).toLocaleString()}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          fee.isActive
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {fee.isActive ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <EditFeeStructureForm
                        fee={{
                          id: fee.id,
                          name: fee.name,
                          feeType: fee.feeType,
                          amount: Number(fee.amount),
                          description: fee.description,
                          isActive: fee.isActive,
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Payment Management
          </h2>

          <p className="mt-1 text-sm text-slate-600">
            Student fee assignment, payment recording, and printable receipts
            will appear here.
          </p>
        </div>

        <div className="mt-5 flex flex-col gap-4 rounded-2xl border border-cyan-100 bg-cyan-50/60 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-cyan-700">
              Student Billing
            </p>

            <h3 className="mt-1 text-lg font-bold text-slate-900">
              Assign a fee to a student
            </h3>

            <p className="mt-1 text-sm leading-6 text-slate-600">
              Select a student, fee structure, academic session, and term,
              then create the student&apos;s billing record.
            </p>
          </div>

          <AssignStudentFeeForm
            students={studentOptions}
            feeStructures={feeOptions}
            sessions={sessionOptions}
          />
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <FeatureCard
            title="Assign Fees"
            description="Assign configured fees to students by session and term."
          />

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <h3 className="font-semibold text-slate-900">
              Record Payment
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Record cash, transfer, POS, or online payments.
            </p>

            <div className="mt-4">
              <RecordPaymentForm
                studentFees={outstandingStudentFees}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-600">
                  Payment History
                </p>

                <h3 className="mt-1 text-xl font-bold text-slate-900">
                  Receipts
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  View recorded payments and open printable receipts.
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600">
                {payments.length} payment{payments.length === 1 ? "" : "s"}
              </div>
            </div>

            {payments.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <p className="font-semibold text-slate-900">
                  No payments recorded yet
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Recorded payments will appear here with their printable
                  receipts.
                </p>
              </div>
            ) : (
              <div className="mt-6 overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                      <th className="px-4 py-3 font-semibold">Receipt</th>
                      <th className="px-4 py-3 font-semibold">Student</th>
                      <th className="px-4 py-3 font-semibold">Fee</th>
                      <th className="px-4 py-3 font-semibold">Amount</th>
                      <th className="px-4 py-3 font-semibold">Method</th>
                      <th className="px-4 py-3 font-semibold">Date</th>
                      <th className="px-4 py-3 font-semibold text-right">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {payments.map((payment) => {
                      const studentName =
                        `${payment.studentFee.student.user.firstName} ${payment.studentFee.student.user.lastName}`;

                      const method = payment.method
                        .replaceAll("_", " ")
                        .toLowerCase()
                        .replace(/\b\w/g, (letter) =>
                          letter.toUpperCase(),
                        );

                      return (
                        <tr
                          key={payment.id}
                          className="transition hover:bg-slate-50"
                        >
                          <td className="px-4 py-4">
                            <p className="font-semibold text-slate-900">
                              {payment.receiptNo}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              {payment.status}
                            </p>
                          </td>

                          <td className="px-4 py-4">
                            <p className="font-semibold text-slate-900">
                              {studentName}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {payment.studentFee.student.admissionNo}
                            </p>
                          </td>

                          <td className="px-4 py-4 font-medium text-slate-700">
                            {payment.studentFee.feeStructure.name}
                          </td>

                          <td className="px-4 py-4 font-bold text-slate-900">
                            ₦{Number(payment.amount).toLocaleString("en-NG", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </td>

                          <td className="px-4 py-4 text-slate-600">
                            {method}
                          </td>

                          <td className="px-4 py-4 text-slate-600">
                            {new Intl.DateTimeFormat("en-NG", {
                              dateStyle: "medium",
                            }).format(payment.paidAt)}
                          </td>

                          <td className="px-4 py-4 text-right">
                            <a
                              href={`/dashboard/fees/payments/${payment.id}/receipt`}
                              className="inline-flex rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-cyan-500 hover:bg-cyan-50 hover:text-cyan-700"
                            >
                              View Receipt
                            </a>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>

      <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-500">{description}</p>
    </div>
  );
}

function StatusCard({
  label,
  value,
  description,
  className,
}: {
  label: string;
  value: number;
  description: string;
  className: string;
}) {
  return (
    <div className={`rounded-2xl border p-5 ${className}`}>
      <p className="text-sm font-semibold text-slate-700">{label}</p>

      <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>

      <p className="mt-1 text-xs text-slate-600">{description}</p>
    </div>
  );
}

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <h3 className="font-semibold text-slate-900">{title}</h3>

      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
    </div>
  );
}
