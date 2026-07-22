<script lang="ts">
    import { TableCalcIcon, HouseIcon } from "../icons";

    let {
        onDashboard,
        onAdmin,
        activeNav = null,
    }: {
        onDashboard?: () => void;
        onAdmin?: () => void;
        activeNav?: "dashboard" | "admin" | null;
    } = $props();
</script>

<header class="app-header">
    <div class="app-title">
        <img src="/duspol.svg" alt="" class="app-logo" />
        <h1>Prüftool</h1>
    </div>
    <div class="header-actions">
        {#if onDashboard}
            <button
                type="button"
                class="nav-btn"
                class:nav-btn--active={activeNav === "dashboard"}
                aria-label="Dashboard"
                title="Dashboard"
                onclick={onDashboard}
            >
                <TableCalcIcon size={22} />
            </button>
        {/if}
        {#if onAdmin}
            <button
                type="button"
                class="nav-btn"
                class:nav-btn--active={activeNav === "admin"}
                aria-label="Admin"
                title="Admin"
                onclick={onAdmin}
            >
                <HouseIcon size={22} />
            </button>
        {/if}
    </div>
</header>

<style>
    .app-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 1rem;
    }

    .app-title {
        display: flex;
        align-items: center;
        gap: 0.6rem;
    }

    .app-logo {
        width: 32px;
        height: 32px;
        flex-shrink: 0;
    }

    .app-header h1 {
        margin: 0;
    }

    .header-actions {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .nav-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        padding: 0;
        border: 1px solid var(--color-primary);
        border-radius: 6px;
        background: transparent;
        color: var(--color-primary);
        cursor: pointer;
        transition:
            background 0.15s,
            color 0.15s;
    }

    .nav-btn:hover,
    .nav-btn:focus-visible {
        background: var(--color-primary);
        color: #fff;
        outline: none;
    }

    .nav-btn--active {
        background: var(--color-primary);
        color: #fff;
    }
</style>
