<script setup>
import { defineProps, ref, onMounted, watch, computed, nextTick, onUnmounted } from 'vue';
import { useArchiveStore } from '../stores/archiveStore';

const props = defineProps({
    itemType: {
        type: String,
        required: true
    }
});

const archiveStore = useArchiveStore();
const currentItemIndex = ref(0);
const mediaRef = ref(null);
const items = ref([]);

// Update items when store changes
watch(() => archiveStore.items, () => {
    items.value = props.itemType.toUpperCase() === 'DOVE' ? archiveStore.doveItems : archiveStore.hawkItems;
}, { immediate: true });

const currentItem = ref(null);
watch([() => items.value, currentItemIndex], () => {
    currentItem.value = items.value[currentItemIndex.value];
}, { immediate: true });

const isVideo = computed(() => {
    if (!currentItem.value?.filePath) return false;
    return currentItem.value.filePath.toLowerCase().endsWith('.mp4') || 
           currentItem.value.filePath.toLowerCase().endsWith('.webm');
});

const goToNextItem = () => {
    currentItemIndex.value = (currentItemIndex.value + 1) % items.value.length;
};

const goToPrevItem = () => {
    currentItemIndex.value = (currentItemIndex.value - 1 + items.value.length) % items.value.length;
};

const handleMediaEnd = () => {
    if (isVideo.value) {
        goToNextItem();
        // Reset and play the new video
        nextTick(() => {
            if (mediaRef.value) {
                mediaRef.value.currentTime = 0;
                // Always start muted to comply with browser policies
                mediaRef.value.muted = true;
                mediaRef.value.play().catch(err => console.warn('Autoplay failed:', err));
            }
        });
    }
};

const handleMouseEnter = () => {
    if (mediaRef.value && isVideo.value) {
        mediaRef.value.muted = false;
        // Don't reset currentTime or force play on hover
        // This allows the video to continue playing from its current position
    }
};

const handleMouseLeave = () => {
    if (mediaRef.value && isVideo.value) {
        mediaRef.value.muted = true;
    }
};

const imageTimer = ref(null);

const startImageTimer = () => {
    if (!isVideo.value) {
        clearTimeout(imageTimer.value);
        imageTimer.value = setTimeout(() => {
            goToNextItem();
        }, 5000); // 5 seconds
    }
};

// Clear timer when component is destroyed
onUnmounted(() => {
    clearTimeout(imageTimer.value);
});

// Start timer when item changes
watch(currentItem, () => {
    if (mediaRef.value && isVideo.value) {
        clearTimeout(imageTimer.value);
        mediaRef.value.currentTime = 0;
        mediaRef.value.play().catch(err => console.warn('Autoplay on item change failed:', err));
    } else {
        startImageTimer();
    }
});

// Start timer for initial image
onMounted(() => {
    if (mediaRef.value && isVideo.value) {
        mediaRef.value.play().catch(err => console.warn('Initial autoplay failed:', err));
    } else {
        startImageTimer();
    }
});

const totalItems = computed(() => items.value.length);

const isLeftColumn = computed(() => props.itemType === 'Dove');

const goToItem = (index) => {
    currentItemIndex.value = index;
};
</script>

<template>
    <div class="column">
        <div 
            class="media-container"
            @mouseenter="handleMouseEnter"
            @mouseleave="handleMouseLeave"
        >
            <video
                v-if="isVideo && currentItem"
                ref="mediaRef"
                :src="currentItem.filePath"
                autoplay
                muted
                @ended="handleMediaEnd"
                class="media"
                playsinline
            />
            <img
                v-else-if="currentItem"
                :src="currentItem.filePath"
                class="media"
                alt=""
                @load="startImageTimer"
            />
            <div class="media-overlay" :class="{ 'media-overlay--right': isLeftColumn }">
                <div class="nav-circles">
                    <div 
                        v-for="index in totalItems" 
                        :key="index"
                        class="nav-circle"
                        :class="{ 'nav-circle--active': index - 1 === currentItemIndex }"
                        @click="goToItem(index - 1)"
                    ></div>
                </div>
                <div class="nav-arrows">
                    <span class="nav-arrow" @click="goToPrevItem">🢓</span>
                    <span class="nav-arrow" @click="goToNextItem">🢑</span>
                </div>
            </div>
        </div>
        <div class="description" v-if="currentItem">
            {{currentItem.headline}}
        </div>
    </div>
</template>

<style scoped lang="scss">
@use "../assets/styles/variables" as *;

.column {
    display: flex;
    flex-direction: column;
    height: 100%;
    background-color: $background-color;
}

.media-container {
    height: 560px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    background: rgba(0, 0, 0, 0.2);
    position: relative;
}

.media {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.description {
    padding: $spacing-lg;
    background: rgba(0, 0, 0, 0.1);
    font-family: $font-family-mono;
    font-size: $font-size-body;
    font-weight: 700;
    color: $secondary-color;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
}

.tags {
    display: flex;
    flex-wrap: wrap;
    gap: $spacing-sm;
}

.tag {
    font-family: $font-family-mono;
    font-size: $font-size-body;
    background: rgba($primary-color, 0.1);
    color: $primary-color;
    border-radius: 4px;
}

.media-overlay {
    position: absolute;
    bottom: 12px;
    left: 26px;
    gap: 12px;
    display: flex;
    flex-direction: column;
    z-index: 10;
    align-items: center;
    
    &--right {
        left: auto;
        right: 26px;
    }
}

.nav-circles {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.nav-circle {
    position: relative;
    width: 14px;
    height: 14px;
    border: 1px solid #FFFFFF;
    border-radius: 50%;
    cursor: pointer;
    transition: background-color 0.3s ease;

    &--active {
        background: #FFFFFF;
    }
}

.nav-arrows {
    display: flex;
    flex-direction: column;
    color: #FFFFFF;
    font-size: 50px;
    font-weight: 700;
    font-family: $font-family-mono;
    line-height: 0.5;
    gap: 12px;
    cursor: pointer;
}

.nav-arrow {
    &:hover {
        opacity: 0.8;
    }
}
</style>