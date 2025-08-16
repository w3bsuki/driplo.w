<script lang="ts">
  interface WelcomeStep {
    id: string;
    title: string;
    description: string;
    icon: string;
    gradient?: string;
    color?: string;
  }

  interface Translations {
    welcome?: string;
    welcomeBrand?: string;
    welcomePersonal?: string;
    discover?: string;
    discoverDesc?: string;
    sell?: string;
    sellDesc?: string;
    ready?: string;
    readyDesc?: string;
    back?: string;
    next?: string;
    getStarted?: string;
    skip?: string;
    designer?: string;
    vintage?: string;
    trending?: string;
    totalSales?: string;
    happySellers?: string;
    trustedMarketplace?: string;
  }

  interface Props {
    show?: boolean;
    steps?: WelcomeStep[];
    currentStep?: number;
    onNext?: () => void;
    onPrevious?: () => void;
    onComplete?: () => void;
    onSkip?: () => void;
    translations?: Translations;
  }

  let { 
    show = false,
    steps = [
      {
        id: 'welcome',
        title: 'Welcome to Driplo',
        description: 'The trusted marketplace for buying and selling pre-owned fashion. Join thousands of users trading quality clothing.',
        icon: '',
        gradient: 'bg-gray-900',
        color: 'bg-gray-900'
      },
      {
        id: 'discover',
        title: 'Discover Quality Fashion',
        description: 'Browse curated items from verified sellers. Find authentic pieces, designer brands, and unique vintage items.',
        icon: '',
        gradient: 'bg-blue-600',
        color: 'bg-blue-600'
      },
      {
        id: 'sell',
        title: 'Sell with Confidence',
        description: 'List your items quickly with our simple tools. Secure payments, buyer protection, and transparent fees.',
        icon: '',
        gradient: 'bg-green-600',
        color: 'bg-green-600'
      },
      {
        id: 'ready',
        title: 'Ready to Start',
        description: 'Complete your profile setup to start buying and selling. Your secure marketplace experience begins now.',
        icon: '',
        gradient: 'bg-black',
        color: 'bg-black'
      }
    ],
    currentStep = 0,
    onNext,
    onPrevious,
    onComplete,
    onSkip,
    translations = {}
  }: Props = $props();

  const currentStepData = $derived(steps[currentStep]);
  const isLastStep = $derived(currentStep === steps.length - 1);
  const isFirstStep = $derived(currentStep === 0);

  // Accessibility & focus management
  let modalRef = $state<HTMLDivElement | null>(null);
  let firstFocusRef = $state<HTMLButtonElement | null>(null);

  $effect(() => {
    if (show && typeof document !== 'undefined') {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      queueMicrotask(() => firstFocusRef?.focus());
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  });

  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      // Prefer skip if available, otherwise complete if on last step
      if (onSkip && !isLastStep) onSkip();
      else if (isLastStep && onComplete) onComplete();
      e.stopPropagation();
    }
    if (e.key === 'Tab' && modalRef) {
      const focusables = modalRef.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  function handleNext() {
    if (isLastStep) {
      onComplete?.();
    } else {
      onNext?.();
    }
  }
</script>

{#if show}
  <!-- Backdrop -->
  <div class="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
    <div class="w-full max-w-md mx-auto">
      <!-- Main Modal -->
      <div
        bind:this={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-modal-title"
        tabindex="-1"
        onkeydown={onKeydown}
        class="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl ring-1 ring-white/20 border border-white/30 overflow-hidden"
      >
        <!-- Progress Bar -->
        <div class="h-1 bg-gray-200/50">
          <div 
            class="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out"
            style="width: {((currentStep + 1) / steps.length) * 100}%"
          ></div>
        </div>

        <!-- Content -->
        <div class="p-8 text-center">
          <!-- Icon -->
          <div class="mb-6">
            <div class="w-16 h-16 mx-auto rounded-xl {currentStepData.color} flex items-center justify-center">
              <span class="text-2xl text-white">{currentStepData.icon}</span>
            </div>
          </div>

          <!-- Content -->
          <div class="mb-8">
            <h2 id="welcome-modal-title" class="text-2xl font-bold text-gray-900 mb-4 leading-tight">
              {currentStepData.title}
            </h2>
            <p class="text-gray-600 text-base leading-relaxed">
              {currentStepData.description}
            </p>
          </div>

          <!-- Step Indicators -->
          <div class="flex justify-center space-x-2 mb-8">
            {#each steps as step, index}
              <button
                onclick={() => currentStep = index}
                aria-label={`Go to step ${index + 1}: ${step.title}`}
                class="w-2 h-2 rounded-full transition-all duration-200 {index === currentStep ? 'bg-black w-8' : 'bg-gray-300'} focus:outline-none focus:ring-2 focus:ring-gray-300"
              ></button>
            {/each}
          </div>

          <!-- Actions -->
          <div class="flex space-x-3">
            {#if !isFirstStep}
              <button
                bind:this={firstFocusRef}
                onclick={onPrevious}
                class="flex-1 px-6 py-3 text-gray-700 font-medium rounded-xl bg-gray-100/60 focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
{translations.back || 'Back'}
              </button>
            {/if}

            <button
              onclick={handleNext}
              class="flex-1 px-6 py-3 bg-black text-white font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-black/40"
            >
              {#if isLastStep}
{translations.getStarted || 'Get Started'}
              {:else}
{translations.next || 'Next'}
              {/if}
            </button>

            {#if !isLastStep && onSkip}
              <button
                onclick={onSkip}
                class="px-4 py-3 text-gray-600 text-sm font-medium rounded-xl bg-transparent focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
{translations.skip || 'Skip'}
              </button>
            {/if}
          </div>
        </div>
      </div>

      <!-- Feature Highlights for Discovery Step -->
      {#if currentStepData.id === 'discover'}
        <div class="grid grid-cols-3 gap-3 mt-6">
          <div class="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-white/30 text-center">
            <div class="text-lg mb-1"></div>
            <div class="text-xs font-medium text-gray-700">{translations.designer || 'Designer'}</div>
          </div>
          <div class="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-white/30 text-center">
            <div class="text-lg mb-1"></div>
            <div class="text-xs font-medium text-gray-700">{translations.vintage || 'Vintage'}</div>
          </div>
          <div class="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-white/30 text-center">
            <div class="text-lg mb-1"></div>
            <div class="text-xs font-medium text-gray-700">{translations.trending || 'Trending'}</div>
          </div>
        </div>
      {/if}

      <!-- Stats for Sell Step -->
      {#if currentStepData.id === 'sell'}
        <div class="grid grid-cols-2 gap-3 mt-6">
          <div class="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/30 text-center">
            <div class="text-lg font-bold text-green-600 mb-1">$2.5M+</div>
            <div class="text-xs text-gray-600">{translations.totalSales || 'Total Sales'}</div>
          </div>
          <div class="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/30 text-center">
            <div class="text-lg font-bold text-blue-600 mb-1">50K+</div>
            <div class="text-xs text-gray-600">{translations.happySellers || 'Happy Sellers'}</div>
          </div>
        </div>
      {/if}
    </div>
  </div>
{/if}