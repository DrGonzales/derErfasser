<script lang="ts">
    // Einfache Combobox: Textfeld + filterbare Dropdown-Liste.
    // Erlaubt sowohl Auswahl eines vorhandenen Wertes als auch freie
    // Eingabe eines neuen Wertes (kein natives <datalist>, damit Optik/UX
    // auf allen Plattformen konsistent ist).
    let {
        value = $bindable(""),
        options = [],
        placeholder = "",
        required = false,
        id,
        currentValueLabel = "aktuell",
        initialValue = "",
        onselect,
    }: {
        value?: string;
        options?: string[];
        placeholder?: string;
        required?: boolean;
        id?: string;
        currentValueLabel?: string;
        initialValue?: string;
        onselect?: (value: string) => void;
    } = $props();

    let open = $state(false);
    let highlightedIndex = $state(-1);
    let inputEl: HTMLInputElement | undefined;
    let containerEl: HTMLDivElement | undefined;

    const filteredOptions = $derived.by(() => {
        const query = value.trim().toLowerCase();
        if (!query) return options;
        return options.filter((o) => o.toLowerCase().includes(query));
    });

    function selectValue(v: string) {
        value = v;
        open = false;
        highlightedIndex = -1;
        onselect?.(v);
        inputEl?.focus();
    }

    function handleFocus() {
        open = true;
        highlightedIndex = -1;
    }

    function handleInput() {
        open = true;
        highlightedIndex = -1;
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === "ArrowDown") {
            event.preventDefault();
            if (!open) {
                open = true;
                return;
            }
            highlightedIndex = Math.min(
                highlightedIndex + 1,
                filteredOptions.length - 1,
            );
        } else if (event.key === "ArrowUp") {
            event.preventDefault();
            highlightedIndex = Math.max(highlightedIndex - 1, 0);
        } else if (event.key === "Enter") {
            if (open && highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
                event.preventDefault();
                selectValue(filteredOptions[highlightedIndex]);
            } else {
                open = false;
            }
        } else if (event.key === "Escape") {
            open = false;
            highlightedIndex = -1;
        }
    }

    function handleDocumentClick(event: MouseEvent) {
        if (containerEl && !containerEl.contains(event.target as Node)) {
            open = false;
            highlightedIndex = -1;
        }
    }

    $effect(() => {
        if (!open) return;
        document.addEventListener("click", handleDocumentClick);
        return () => document.removeEventListener("click", handleDocumentClick);
    });
</script>

<div class="combobox" bind:this={containerEl}>
    <input
        {id}
        type="text"
        {placeholder}
        {required}
        autocomplete="off"
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        aria-controls={id ? `${id}-listbox` : undefined}
        bind:value
        bind:this={inputEl}
        onfocus={handleFocus}
        oninput={handleInput}
        onkeydown={handleKeydown}
    />
    {#if open && filteredOptions.length > 0}
        <ul class="combobox-list" id={id ? `${id}-listbox` : undefined} role="listbox">
            {#each filteredOptions as option, index (option)}
                <li
                    role="option"
                    aria-selected={index === highlightedIndex}
                    class:highlighted={index === highlightedIndex}
                >
                    <button
                        type="button"
                        class="combobox-option"
                        onmousedown={(e) => {
                            e.preventDefault();
                            selectValue(option);
                        }}
                    >
                        <span>{option}</span>
                        {#if option === initialValue && initialValue}
                            <span class="combobox-badge">{currentValueLabel}</span>
                        {/if}
                    </button>
                </li>
            {/each}
        </ul>
    {/if}
</div>

<style>
    .combobox {
        position: relative;
        width: 100%;
    }

    .combobox input {
        width: 100%;
        min-height: 40px;
        border: 1px solid var(--color-border-input);
        border-radius: 6px;
        padding: 0 12px;
        color: var(--color-text);
        background: #fbfcfa;
        font: inherit;
        font-weight: 400;
        box-sizing: border-box;
    }

    .combobox input:focus {
        border-color: var(--color-primary);
        outline: 3px solid var(--focus-ring);
    }

    .combobox-list {
        position: absolute;
        z-index: 20;
        top: calc(100% + 4px);
        left: 0;
        right: 0;
        margin: 0;
        padding: 4px;
        list-style: none;
        background: var(--color-surface);
        border: 1px solid var(--color-border-input);
        border-radius: 8px;
        box-shadow: var(--modal-panel-shadow);
        max-height: 220px;
        overflow-y: auto;
    }

    .combobox-option {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.5rem;
        border: none;
        background: none;
        text-align: left;
        padding: 8px 10px;
        border-radius: 6px;
        font: inherit;
        font-weight: 400;
        color: var(--color-text);
        cursor: pointer;
    }

    li.highlighted .combobox-option,
    .combobox-option:hover {
        background: var(--color-surface-hover, rgba(0, 0, 0, 0.05));
    }

    .combobox-badge {
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--color-primary);
        background: var(--color-primary-soft, rgba(0, 0, 0, 0.06));
        padding: 2px 6px;
        border-radius: 999px;
        flex-shrink: 0;
    }
</style>
