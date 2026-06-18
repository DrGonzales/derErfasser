<script>
  import { onDestroy, onMount } from 'svelte';
  import { addRecord, clearRecords, deleteRecord, getRecords } from './lib/db.js';

  let records = [];
  let title = '';
  let notes = '';
  let imageFile = null;
  let imagePreviewUrl = '';
  let status = 'Bereit fuer neue Eintraege.';
  let isSaving = false;
  let recordImageUrls = [];

  onMount(() => {
    loadRecords();
  });

  onDestroy(() => {
    revokeRecordImageUrls();

    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
  });

  async function loadRecords() {
    revokeRecordImageUrls();

    records = (await getRecords()).map((record) => ({
      ...record,
      imageUrl: record.image?.blob ? URL.createObjectURL(record.image.blob) : ''
    }));
    recordImageUrls = records.map((record) => record.imageUrl).filter(Boolean);
  }

  function revokeRecordImageUrls() {
    recordImageUrls.forEach((url) => URL.revokeObjectURL(url));
    recordImageUrls = [];
  }

  function handleImageChange(event) {
    const [file] = event.currentTarget.files;
    imageFile = file ?? null;

    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }

    imagePreviewUrl = imageFile ? URL.createObjectURL(imageFile) : '';
  }

  async function handleSubmit() {
    const cleanedTitle = title.trim();
    const cleanedNotes = notes.trim();

    if (!cleanedTitle && !cleanedNotes && !imageFile) {
      status = 'Bitte Text oder ein Bild erfassen.';
      return;
    }

    isSaving = true;

    try {
      await addRecord({
        title: cleanedTitle || 'Ohne Titel',
        notes: cleanedNotes,
        image: imageFile
          ? {
              blob: imageFile,
              name: imageFile.name,
              type: imageFile.type,
              size: imageFile.size
            }
          : null
      });

      title = '';
      notes = '';
      imageFile = null;

      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
        imagePreviewUrl = '';
      }

      await loadRecords();
      status = 'Eintrag wurde lokal gespeichert.';
    } catch (error) {
      status = `Speichern fehlgeschlagen: ${error.message}`;
    } finally {
      isSaving = false;
    }
  }

  async function removeRecord(id) {
    await deleteRecord(id);
    await loadRecords();
    status = 'Eintrag wurde geloescht.';
  }

  async function removeAll() {
    const confirmed = window.confirm('Alle lokalen Eintraege wirklich loeschen?');

    if (!confirmed) {
      return;
    }

    await clearRecords();
    await loadRecords();
    status = 'Alle Eintraege wurden geloescht.';
  }

  function formatDate(timestamp) {
    return new Intl.DateTimeFormat('de-DE', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(timestamp);
  }
</script>

<svelte:head>
  <title>derErfasser</title>
</svelte:head>

<main class="app-shell">
  <section class="workspace">
    <form class="capture-panel" on:submit|preventDefault={handleSubmit}>
      <div class="panel-head">
        <div>
          <p class="eyebrow">PWA / IndexedDB</p>
          <h1>derErfasser</h1>
        </div>
        <span class="count">{records.length}</span>
      </div>

      <label>
        Titel
        <input bind:value={title} autocomplete="off" placeholder="z.B. Fundstueck, Beleg, Notiz" />
      </label>

      <label>
        Daten
        <textarea bind:value={notes} rows="6" placeholder="Text, Messwerte oder Beschreibung"></textarea>
      </label>

      <label class="file-drop">
        <input accept="image/*" type="file" on:change={handleImageChange} />
        <span>Bild auswaehlen</span>
        <small>{imageFile ? imageFile.name : 'JPG, PNG, WebP oder Kameraaufnahme'}</small>
      </label>

      {#if imagePreviewUrl}
        <img class="preview" src={imagePreviewUrl} alt="Vorschau des ausgewaehlten Bildes" />
      {/if}

      <div class="actions">
        <button class="primary" disabled={isSaving} type="submit">
          {isSaving ? 'Speichern...' : 'Lokal speichern'}
        </button>
        <button class="ghost" disabled={!records.length} type="button" on:click={removeAll}>
          Alles loeschen
        </button>
      </div>

      <p class="status" aria-live="polite">{status}</p>
    </form>

    <section class="records" aria-label="Gespeicherte Eintraege">
      {#if records.length === 0}
        <div class="empty-state">
          <h2>Noch keine Eintraege</h2>
          <p>Neue Daten und Bilder werden offline in IndexedDB auf diesem Geraet gespeichert.</p>
        </div>
      {:else}
        {#each records as record (record.id)}
          <article class="record-card">
            {#if record.imageUrl}
              <img src={record.imageUrl} alt={`Bild zu ${record.title}`} />
            {/if}

            <div class="record-body">
              <div>
                <h2>{record.title}</h2>
                <time datetime={new Date(record.createdAt).toISOString()}>{formatDate(record.createdAt)}</time>
              </div>

              {#if record.notes}
                <p>{record.notes}</p>
              {/if}

              {#if record.image}
                <small>{record.image.name} - {Math.round(record.image.size / 1024)} KB</small>
              {/if}

              <button class="danger" type="button" on:click={() => removeRecord(record.id)}>Loeschen</button>
            </div>
          </article>
        {/each}
      {/if}
    </section>
  </section>
</main>
