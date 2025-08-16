<script lang="ts">
  
  let dismissed = $state(false);

  function dismiss() {
    dismissed = true;
  }
</script>

{#if !dismissed}
  <div class="relative bg-black text-white">
    <div class="px-4 py-3 sm:px-6 sm:py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <span class="text-xl">🔥</span>
          <div class="flex flex-col sm:flex-row sm:items-center sm:gap-2">
            <span class="font-bold text-sm sm:text-base">DRIPLO</span>
            <span class="text-xs sm:text-sm text-gray-300">Продавай и купувай дрехи</span>
          </div>
        </div>
        
        <div class="flex items-center gap-3">
          <a 
            href="/sell"
            class="bg-white text-black sm:hover:bg-gray-100 font-bold px-4 py-2 text-sm rounded-lg transition-colors motion-reduce:transition-none select-none [touch-action:manipulation] [-webkit-tap-highlight-color:transparent] sm:transition-all sm:duration-200 sm:hover:scale-105"
          >
            Регистрирай се
          </a>
          
          <button 
            onclick={dismiss}
            class="p-1 sm:hover:bg-white/10 rounded-full transition-colors motion-reduce:transition-none select-none [touch-action:manipulation] [-webkit-tap-highlight-color:transparent]"
            aria-label="Close banner"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}