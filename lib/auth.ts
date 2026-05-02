import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

export async function getAuthUser() {
  const { userId } = await auth();
  if (!userId) return null;

  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const email = clerkUser.emailAddresses[0]?.emailAddress;
  if (!email) return null;

  const user = await db.user.upsert({
    where: { email },
    update: {},
    create: {
      id: userId,
      email,
      name: `${clerkUser.firstName ?? ''} ${clerkUser.lastName ?? ''}`.trim() || null,
    },
  });

  return user;
}
