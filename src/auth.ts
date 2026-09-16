import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,

  session: {
    strategy: "jwt",
  },

  providers: [
    Credentials({
      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        const email =
          typeof credentials?.email === "string"
            ? credentials.email.trim().toLowerCase()
            : "";

        const password =
          typeof credentials?.password === "string"
            ? credentials.password
            : "";

        console.log("[AUTH DEBUG] credentials received:", {
          email,
          passwordProvided: Boolean(password),
        });

        if (!email || !password) {
          console.log("[AUTH DEBUG] missing email or password");
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email },
        });

        console.log("[AUTH DEBUG] user lookup:", {
          found: Boolean(user),
          status: user?.status ?? null,
          role: user?.role ?? null,
        });

        if (!user || user.status !== "ACTIVE") {
          console.log("[AUTH DEBUG] user missing or inactive");
          return null;
        }

        const passwordValid = await verifyPassword(
          password,
          user.passwordHash,
        );

        console.log("[AUTH DEBUG] password verification:", {
          passwordValid,
        });

        if (!passwordValid) {
          return null;
        }

        console.log("[AUTH DEBUG] authorize returning user");

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          role: user.role,
          schoolId: user.schoolId,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.role = user.role;
        token.schoolId = user.schoolId;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string;
        session.user.role = token.role as string;
        session.user.schoolId = token.schoolId as string;
      }

      return session;
    },
  },

  pages: {
    signIn: "/login",
  },
});
