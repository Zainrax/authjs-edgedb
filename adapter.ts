import { Adapter } from "@auth/core/adapters"; // npm install @auth/core
import e from "@db/edgeql"; // wherever  you generated edgeql module https://www.edgedb.com/docs/clients/js/generation
import { Client } from "edgedb";

export function EdgeDBAdapter(db: Client): Adapter {
  return {
    async createUser(data) {
      const user = await e
        .select(e.insert(e.auth.User, data), () => ({
          ...e.auth.User["*"],
        }))
        .run(db);
      if (!user) throw new Error("Inserted user not found");
      return user;
    },
    async getUser(id) {
      return e
        .select(e.auth.User, () => ({
          ...e.auth.User["*"],
          filter_single: { id },
        }))
        .run(db);
    },
    async getUserByEmail(email) {
      return e
        .select(e.auth.User, () => ({
          ...e.auth.User["*"],
          filter_single: { email },
        }))
        .run(db);
    },
    async getUserByAccount(providerAccount) {
      const account = await e
        .select(e.auth.Account, () => ({
          user: {
            ...e.auth.User["*"],
          },
          provider: true,
          filter_single: providerAccount,
        }))
        .run(db);
      return account?.user ?? null;
    },
    async updateUser(data) {
      const id = data.id;
      if (!id) throw new Error("Cannot update user without id");
      const updated = e.update(e.auth.User, () => ({
        ...e.auth.User["*"],
        filter_single: { id },
        set: data,
      }));
      const user = await e
        .select(updated, () => ({
          ...e.auth.User["*"],
        }))
        .run(db);
      if (!user) throw new Error("Updated user not found");
      return user;
    },
    async deleteUser(id) {
      const deletion = e.delete(e.auth.User, () => ({
        filter_single: { id },
      }));
      return await e
        .select(deletion, () => ({
          ...e.auth.User["*"],
        }))
        .run(db);
    },
    async linkAccount(data) {
      const { userId, ...account } = data;
      const user = e.select(e.auth.User, () => ({
        filter_single: { id: userId },
      }));
      const accountInsert = e.insert(e.auth.Account, { ...account, user });
      await e
        .select(accountInsert, () => ({
          ...e.auth.Account["*"],
        }))
        .run(db);
    },
    async unlinkAccount(providerAccountId) {
      await e
        .delete(e.auth.Account, () => ({
          filter_single: providerAccountId,
        }))
        .run(db);
    },
    async createSession(data) {
      const { userId, ...session } = data;
      const user = e.select(e.auth.User, () => ({
        filter_single: { id: userId },
      }));
      const inserted = await e
        .select(e.insert(e.auth.Session, { ...session, user }), () => ({
          ...e.auth.Session["*"],
        }))
        .run(db);
      return { ...inserted, userId };
    },
    async getSessionAndUser(sessionToken) {
      const sessionAndUser = e.select(e.auth.Session, () => ({
        ...e.auth.Session["*"],
        user: {
          ...e.auth.User["*"],
        },
        filter_single: { sessionToken },
      }));
      const result = await sessionAndUser.run(db);
      if (!result) return null;
      const { user, ...session } = result;
      return { user, session: { ...session, userId: user.id } };
    },
    async updateSession(data) {
      console.log(data);
      const { userId, ...session } = data;
      if (!userId) return null;
      const updated = e.update(e.auth.Session, () => ({
        filter_single: session,
        set: session,
      }));
      const result = await e
        .select(updated, () => ({
          ...e.auth.Session["*"],
        }))
        .run(db);
      if (!result) return null;
      return { ...result, userId };
    },
    async deleteSession(sessionToken) {
      await e
        .delete(e.auth.Session, () => ({
          filter_single: { sessionToken },
        }))
        .run(db);
    },
    async createVerificationToken(data) {
      const inserted = await e
        .select(
          e.insert(e.auth.VerificationToken, {
            ...data,
          }),
          () => ({
            ...e.auth.VerificationToken["*"],
          })
        )
        .run(db);
      if (!inserted) return null;
      return inserted;
    },
  };
}
