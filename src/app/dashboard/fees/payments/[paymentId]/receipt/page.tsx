import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import PrintReceiptButton from "./print-receipt-button";

export default async function PaymentReceiptPage({
  params,
}: {
  params: Promise<{ paymentId: string }>;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const { paymentId } = await params;

  const payment = await prisma.payment.findFirst({
    where: {
      id: paymentId,
      studentFee: {
        student: {
          schoolId: session.user.schoolId,
        },
        feeStructure: {
          schoolId: session.user.schoolId,
        },
      },
    },
    select: {
      id: true,
      receiptNo: true,
      amount: true,
      method: true,
      status: true,
      reference: true,
      notes: true,
      paidAt: true,
      studentFee: {
        select: {
          amountDue: true,
          amountPaid: true,
          dueDate: true,
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
              feeType: true,
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
      },
      recordedBy: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  if (!payment) {
    notFound();
  }

  const school = await prisma.school.findUnique({
    where: {
      id: session.user.schoolId,
    },
    select: {
      name: true,
      address: true,
      phone: true,
      email: true,
      website: true,
      logoUrl: true,
    },
  });

  if (!school) {
    notFound();
  }

  const amountPaid = Number(payment.amount);
  const amountDue = Number(payment.studentFee.amountDue);
  const totalPaid = Number(payment.studentFee.amountPaid);
  const balance = Math.max(amountDue - totalPaid, 0);

  const paymentDate = new Intl.DateTimeFormat("en-NG", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(payment.paidAt);

  const studentName = `${payment.studentFee.student.user.firstName} ${payment.studentFee.student.user.lastName}`;

  const paymentMethod = payment.method
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="print-hidden mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-600">
              Finance Management
            </p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">
              Payment Receipt
            </h1>
          </div>

          <PrintReceiptButton />
        </div>

        <section className="receipt-page overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5">
          <div className="border-b-4 border-cyan-500 bg-slate-950 px-6 py-8 text-white sm:px-10">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                {school.logoUrl ? (
                  <img
                    src={school.logoUrl}
                    alt={`${school.name} logo`}
                    className="h-16 w-16 rounded-2xl bg-white object-contain p-2"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500 text-xl font-black text-slate-950">
                    BS
                  </div>
                )}

                <div>
                  <h2 className="text-xl font-black tracking-tight sm:text-2xl">
                    {school.name}
                  </h2>

                  <p className="mt-1 text-sm text-slate-300">
                    Official Payment Receipt
                  </p>
                </div>
              </div>

              <div className="sm:text-right">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
                  Receipt No.
                </p>

                <p className="mt-1 text-lg font-bold tracking-wide">
                  {payment.receiptNo}
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-2 text-sm text-slate-300 sm:grid-cols-2">
              {school.address && <p>{school.address}</p>}

              <div className="sm:text-right">
                {school.phone && <p>{school.phone}</p>}
                {school.email && <p>{school.email}</p>}
                {school.website && <p>{school.website}</p>}
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-10">
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
                  Student
                </p>

                <p className="mt-2 text-xl font-bold text-slate-900">
                  {studentName}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Admission No: {payment.studentFee.student.admissionNo}
                </p>
              </div>

              <div className="sm:text-right">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
                  Payment Date
                </p>

                <p className="mt-2 text-base font-semibold text-slate-900">
                  {paymentDate}
                </p>
              </div>
            </div>

            <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200">
              <div className="grid grid-cols-2 border-b border-slate-200 bg-slate-50 px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <span>Description</span>
                <span className="text-right">Amount</span>
              </div>

              <div className="grid grid-cols-2 px-5 py-5">
                <div>
                  <p className="font-bold text-slate-900">
                    {payment.studentFee.feeStructure.name}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {payment.studentFee.feeStructure.feeType}
                  </p>

                  <p className="mt-2 text-xs text-slate-500">
                    {payment.studentFee.session.name} ·{" "}
                    {payment.studentFee.term.name}
                  </p>
                </div>

                <p className="text-right text-lg font-bold text-slate-900">
                  ₦{amountPaid.toLocaleString("en-NG", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium text-slate-500">
                  Total Fee
                </p>
                <p className="mt-1 text-lg font-bold text-slate-900">
                  ₦{amountDue.toLocaleString("en-NG", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-xs font-medium text-emerald-700">
                  Total Paid
                </p>
                <p className="mt-1 text-lg font-bold text-emerald-900">
                  ₦{totalPaid.toLocaleString("en-NG", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>

              <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-4">
                <p className="text-xs font-medium text-cyan-700">
                  Balance
                </p>
                <p className="mt-1 text-lg font-bold text-cyan-900">
                  ₦{balance.toLocaleString("en-NG", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
            </div>

            <div className="mt-8 grid gap-5 border-t border-slate-200 pt-6 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
                  Payment Method
                </p>
                <p className="mt-1 font-semibold text-slate-900">
                  {paymentMethod}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
                  Payment Status
                </p>
                <p className="mt-1 font-semibold text-emerald-700">
                  {payment.status}
                </p>
              </div>

              {payment.reference && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
                    Reference
                  </p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {payment.reference}
                  </p>
                </div>
              )}

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
                  Recorded By
                </p>
                <p className="mt-1 font-semibold text-slate-900">
                  {payment.recordedBy.firstName}{" "}
                  {payment.recordedBy.lastName}
                </p>
              </div>
            </div>

            {payment.notes && (
              <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-amber-700">
                  Notes
                </p>
                <p className="mt-1 text-sm text-amber-900">
                  {payment.notes}
                </p>
              </div>
            )}

            <div className="mt-10 border-t border-dashed border-slate-300 pt-6 text-center">
              <p className="text-sm font-semibold text-slate-700">
                Thank you for your payment.
              </p>

              <p className="mt-1 text-xs text-slate-400">
                This receipt was generated by the BS International Academy
                management system.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
