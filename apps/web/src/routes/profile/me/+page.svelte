<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import Header from '$lib/components/Header.svelte';
  import type { PageData } from './$types';
  import * as i18n from '@repo/i18n';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  let autoNavigated = $state(false);

  onMount(() => {
    // Navigate as soon as the page is interactive
    if (data?.target) {
      goto(data.target, { replaceState: true }).then(() => (autoNavigated = true));
    }
  });
</script>

<svelte:head>
  <title>{i18n.profile_yourProfile?.() ?? 'Your profile'} - Driplo</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<div class="min-h-screen bg-white flex flex-col pb-[max(5rem,env(safe-area-inset-bottom))] sm:pb-0">
  <Header />

  <main class="flex-1 flex items-center justify-center p-6">
    <section
      class="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm"
      role="status"
      aria-live="polite"
    >
      <div class="mx-auto mb-4 h-12 w-12 text-black/80" aria-hidden="true">
        <svg class="animate-spin motion-reduce:animate-none" viewBox="0 0 24 24" fill="none">
          <circle class="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-80" d="M4 12a8 8 0 018-8" stroke="currentColor" stroke-width="4" stroke-linecap="round" />
        </svg>
      </div>

      <h1 class="text-base font-semibold mb-1">{i18n.profile_redirecting?.() ?? 'Redirecting'}</h1>
      <p class="text-sm text-gray-600 mb-4">
        {i18n.profile_takingYouToYourProfile?.() ?? 'Taking you to your profile...'}
      </p>

      {#if data?.target}
        <a
          href={data.target}
          class="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow-sm hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/50 select-none [touch-action:manipulation] [-webkit-tap-highlight-color:transparent]"
          rel="noopener"
        >
          {i18n.common_continue?.() ?? 'Continue'}
        </a>
      {/if}

      <p class="mt-4 text-xs text-gray-500">
        {i18n.common_notRedirecting?.() ?? 'If you are not redirected, use the button above.'}
      </p>
    </section>
  </main>
</div>
