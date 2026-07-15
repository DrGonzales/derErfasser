<script lang="ts">
    type Segment = { label: string; value: number; color: string };

    let {
        segments,
        size = 110,
        thickness = 18,
        centerLabel,
    }: {
        segments: Segment[];
        size?: number;
        thickness?: number;
        centerLabel?: string;
    } = $props();

    const total = $derived(segments.reduce((sum, s) => sum + s.value, 0));

    const gradientCss = $derived.by(() => {
        if (total === 0) {
            return "conic-gradient(var(--color-border) 0% 100%)";
        }
        let cumulative = 0;
        const stops: string[] = [];
        for (const segment of segments) {
            if (segment.value === 0) continue;
            const start = (cumulative / total) * 100;
            cumulative += segment.value;
            const end = (cumulative / total) * 100;
            stops.push(`${segment.color} ${start}% ${end}%`);
        }
        return `conic-gradient(${stops.join(", ")})`;
    });
</script>

<div class="donut-wrapper" style="width: {size}px; height: {size}px;">
    <div
        class="donut"
        style="width: {size}px; height: {size}px; background: {gradientCss};"
        aria-hidden="true"
    ></div>
    <div class="donut-hole" style="inset: {thickness}px;" aria-hidden="true">
        {#if centerLabel}
            <span class="donut-center-label">{centerLabel}</span>
        {/if}
    </div>
</div>

<style>
    .donut-wrapper {
        position: relative;
        flex-shrink: 0;
    }

    .donut {
        width: 100%;
        height: 100%;
        border-radius: 50%;
    }

    .donut-hole {
        position: absolute;
        border-radius: 50%;
        background: var(--color-surface);
        display: grid;
        place-items: center;
    }

    .donut-center-label {
        font-size: 1.1rem;
        font-weight: 800;
        color: var(--color-text);
        line-height: 1;
    }
</style>
