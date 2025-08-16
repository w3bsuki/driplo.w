import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { session }, url }) => {
  // Provide a target for client-side navigation so the route can render a UI
  if (!session?.user?.id) {
    return { target: `/login?redirect=${encodeURIComponent(url.pathname)}` };
  }
  return { target: `/profile/${session.user.id}` };
};