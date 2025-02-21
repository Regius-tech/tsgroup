import NextAuth from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";

export default NextAuth({
  providers: [
    AzureADProvider({
      clientId: process.env.338dfcf4-750c-4ebb-b75e-aab4c3d9c8f5,
      clientSecret: process.env.gHC8Q~c5kDPxU7VKDpxyyY7_E~LANMkYwQwBMbKE,
      tenantId: process.env.1a0f6b20-b0bd-49d0-a7dd-367a5548ebbc,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      const allowedDomains = ["tsoslo.no", "mtf.no", "bla-kurer.no"];
      const emailDomain = user.email.split("@")[1];
      if (!allowedDomains.includes(emailDomain)) {
        return false; // Avvis innlogging hvis ikke på godkjente domener
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) token.email = user.email;
      return token;
    },
    async session({ session, token }) {
      session.user.email = token.email;
      return session;
    },
  },
});
