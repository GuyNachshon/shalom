<script setup>
import { onMounted } from 'vue';
import Timeline from "./components/Timeline.vue";
import { useArchiveStore } from './stores/archiveStore';
import VideoColumn from "./components/videoColumn.vue";

const archiveStore = useArchiveStore();

onMounted(async () => {
  await archiveStore.loadArchiveData();
});
</script>

<template>
    <div class="app">
        <Timeline></Timeline>
        <main class="main">
            <video-column itemType="Dove"></video-column>
            <video-column itemType="Hawk"></video-column>
        </main>
        
    </div>
</template>

<style lang="scss">
@use "assets/styles/variables" as *;

body {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

.app {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    box-sizing: border-box;

    background-color: $background-color;
    padding: $spacing-xl*2 0;
}

.main {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-gap: 0;
    width: 100%;
    height: 100%;
    padding-top: $spacing-lg;
}

</style>
