<script lang="ts">
  import { browser } from '$app/environment';

  interface Props {
    show: boolean;
    onSuccess?: () => void;
    onCancel?: () => void;
    onClose?: () => void;
    publishableKey: string;
  }

  let { show, onSuccess, onCancel, onClose, publishableKey }: Props = $props();

  let loading = $state(false);
  let error = $state('');
  let stripe: any = $state(null);
  let elements: any = $state(null);
  let cardElement: any = $state(null);
  let cardContainer: HTMLDivElement;
  let modalRef = $state<HTMLDivElement | null>(null);
  let cancelBtnRef = $state<HTMLButtonElement | null>(null);

  // Brand plan ID
  const BRAND_PLAN_ID = 'd3735d51-cbba-4b77-9e21-e50bdf9e53e8';

  // Initialize Stripe when modal shows
  $effect(() => {
    if (show && browser && !stripe) {
      initializeStripe();
    }
  });

  // Scroll lock and focus management
  $effect(() => {
    if (!browser) return;
    if (show) {
      // Lock scroll
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      // Focus first actionable element (Cancel button as fallback)
      queueMicrotask(() => {
        cancelBtnRef?.focus();
      });
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  });

  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      e.stopPropagation();
      onClose?.();
    }
    if (e.key === 'Tab' && modalRef) {
      // Trap focus inside modal
      const focusables = modalRef.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
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

  async function initializeStripe() {
    try {
      console.log('🔥 PAYMENT MODAL - Initializing Stripe');
      const { loadStripe } = await import('@stripe/stripe-js');
      if (!publishableKey) {
        error = 'Missing Stripe publishable key';
        console.error('🔥 PAYMENT MODAL - Missing publishableKey prop');
        return;
      }
      stripe = await loadStripe(publishableKey);
      
      if (stripe && cardContainer) {
        elements = stripe.elements();
        cardElement = elements.create('card', {
          style: {
            base: {
              // Prevent iOS input zoom by keeping font-size >= 16px
              fontSize: '16px',
              color: '#424770',
              fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
              fontSmoothing: 'antialiased',
              '::placeholder': {
                color: '#aab7c4',
              },
            },
            invalid: {
              color: '#fa755a',
              iconColor: '#fa755a'
            },
          },
        });
        cardElement.mount(cardContainer);
        console.log('🔥 PAYMENT MODAL - Card element mounted');
      }
    } catch (err) {
      console.error('🔥 PAYMENT MODAL - Stripe initialization error:', err);
      error = 'Failed to load payment form';
    }
  }

  async function handlePayment() {
    if (!stripe || !cardElement) {
      error = 'Payment form not ready';
      return;
    }
    
    loading = true;
    error = '';
    
    try {
      console.log('🔥 PAYMENT MODAL - Starting payment for brand plan:', BRAND_PLAN_ID);
      
      // Create subscription on server
      const response = await fetch('/api/subscriptions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          planId: BRAND_PLAN_ID,
          discountPercent: 0
        })
      });

      const result = await response.json();
      console.log('🔥 PAYMENT MODAL - API response:', result);
      
      if (result.error) {
        throw new Error(result.error);
      }

      const { clientSecret } = result;
      
      if (!clientSecret) {
        throw new Error('No payment client secret received from server');
      }

      // Confirm payment with card element
      console.log('🔥 PAYMENT MODAL - Confirming payment with card');
      const { error: paymentError } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        }
      });

      if (paymentError) {
        console.error('🔥 PAYMENT MODAL - Payment error:', paymentError);
        error = paymentError.message || 'Payment failed';
      } else {
        console.log('🔥 PAYMENT MODAL - Payment successful!');
        onSuccess?.();
      }
      
    } catch (err) {
      console.error('🔥 PAYMENT MODAL - Error:', err);
      error = err instanceof Error ? err.message : 'Payment failed';
    } finally {
      loading = false;
    }
  }

  function handleCancel() {
    onCancel?.();
    onClose?.();
  }
</script>

{#if show}
  <div class="fixed inset-0 z-50 flex items-stretch sm:items-center sm:justify-center bg-black/20 backdrop-blur-sm"
       aria-hidden="false">
    <div bind:this={modalRef}
         role="dialog"
         aria-modal="true"
         aria-labelledby="brand-payment-title"
         onkeydown={onKeydown}
         tabindex="-1"
         class="w-full h-[100dvh] sm:h-auto sm:max-w-sm bg-white rounded-none sm:rounded-lg shadow-lg border border-gray-200 outline-none flex flex-col overscroll-contain">
      <!-- Sticky Header -->
      <div class="px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-3 sticky top-0 bg-white/95 supports-[backdrop-filter]:bg-white/80 backdrop-blur border-b border-gray-100">
        <div class="text-center">
          <h3 id="brand-payment-title" class="text-base sm:text-lg font-semibold text-gray-900 mb-0.5">Brand Account</h3>
          <p class="text-sm text-gray-600">50 BGN/month subscription</p>
        </div>
      </div>

      <!-- Scrollable Content -->
      <div class="flex-1 overflow-y-auto px-5 py-4">
        <!-- Card Input -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Payment Details
          </label>
          <div bind:this={cardContainer} class="p-2.5 border border-gray-300 rounded bg-white text-sm min-h-[44px]"></div>
        </div>

        <!-- Error Message -->
        {#if error}
          <div class="mb-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
            {error}
          </div>
        {/if}

<style>
  /* Respect user reduced-motion preference: stop spinner animation */
  @media (prefers-reduced-motion: reduce) {
    .animate-spin {
      animation: none !important;
    }
  }

  /* Remove tap highlight on iOS for cleaner touch feedback without enlargements */
  button, a {
    -webkit-tap-highlight-color: transparent;
  }
</style>

        <!-- Security Note -->
        <div class="mt-2 text-center text-xs text-gray-500">
          Secured by Stripe
        </div>
      </div>

      <!-- Sticky Footer Actions -->
      <div class="px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] sm:pb-4 border-t border-gray-100 bg-white/95 supports-[backdrop-filter]:bg-white/80 sticky bottom-0">
        <div class="flex gap-2">
          <button
            bind:this={cancelBtnRef}
            onclick={handleCancel}
            disabled={loading}
            class="px-3 py-2 text-sm text-gray-700 bg-gray-100 border border-gray-300 rounded disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-gray-300 select-none [touch-action:manipulation] [-webkit-tap-highlight-color:transparent]"
          >
            Cancel
          </button>
          <button
            onclick={handlePayment}
            disabled={loading || !stripe}
            class="flex-1 px-3 py-2 text-sm text-white bg-gray-900 rounded disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-black/40 select-none [touch-action:manipulation] [-webkit-tap-highlight-color:transparent]"
          >
            {#if loading}
              <div class="flex items-center justify-center gap-1">
                <div class="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                Processing...
              </div>
            {:else}
              Pay 50 BGN
            {/if}
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}