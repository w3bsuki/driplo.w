<script lang="ts">
  interface Props {
    class?: string;
    padding?: boolean;
    hover?: boolean;
    onclick?: () => void;
    children?: import('svelte').Snippet;
  }

  let { 
    class: className = '',
    padding = true,
    hover = false,
    onclick,
    children
  }: Props = $props();

  const baseClasses = 'bg-white border border-gray-200 rounded-lg shadow-sm [-webkit-tap-highlight-color:transparent] [--tw-tap-highlight-color:transparent] select-none [touch-action:manipulation]';
  const paddingClasses = $derived(padding ? 'p-6' : '');
  const hoverClasses = $derived(
    hover
      ? 'cursor-pointer transform sm:hover:shadow-md sm:hover:-translate-y-0.5 transition-shadow transition-transform motion-reduce:transition-none'
      : ''
  );
  const classes = $derived(`${baseClasses} ${paddingClasses} ${hoverClasses} ${className}`);
</script>

<div 
  class={classes} 
  {onclick}
  role={onclick ? "button" : undefined}
  tabindex={onclick ? 0 : undefined}
  onkeydown={(e) => {
    if (onclick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onclick();
    }
  }}
>
  {@render children?.()}
</div>