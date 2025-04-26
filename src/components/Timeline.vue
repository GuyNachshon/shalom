<script setup>
import { computed, ref } from 'vue';
import { useArchiveStore } from '../stores/archiveStore';

const archiveStore = useArchiveStore();
const currentYear = computed(() => archiveStore.currentYear);
const hasNext = computed(() => archiveStore.hasNextYear);
const hasPrev = computed(() => archiveStore.hasPrevYear);
const currentItems = computed(() => archiveStore.currentYearItems);

const goToNext = () => archiveStore.goToNextYear();
const goToPrev = () => archiveStore.goToPrevYear();

const selectedMode = ref('כרונולוגית');
const toggleMode = (mode) => {
    selectedMode.value = mode;
};
</script>

<template>
    <div class="timeline">
        <div class="timeline__tabs">
            <div 
                class="timeline__tabs__tab" 
                :class="{ 'timeline__tabs__tab--selected': selectedMode === 'כרונולוגית' }"
                @click="toggleMode('כרונולוגית')"
            >כרונולוגית</div>
            <div 
                class="timeline__tabs__tab"
                :class="{ 'timeline__tabs__tab--selected': selectedMode === 'א-כרונולוגית' }"
                @click="toggleMode('א-כרונולוגית')"
            >א־כרונולוגית</div>
        </div>
        <div class="timeline__year">
            <div
                class="timeline__year-nav" 
                :class="{ 'timeline__year-nav--disabled': !hasPrev }"
                @click="goToPrev"
            >◀</div>
            <div class="timeline__year-display">{{ currentYear }}</div>
            <div
                class="timeline__year-nav"
                :class="{ 'timeline__year-nav--disabled': !hasNext }"
                @click="goToNext"
            >▶</div>
        </div>
        <div class="timeline__scroll">
            <template v-for="(item, index) in currentItems" :key="index">
                <div class="timeline__scroll__item"></div>
                <div v-if="index < currentItems.length - 1" class="timeline__scroll__item"></div>
            </template>
        </div>
    </div>
</template>

<style scoped lang="scss">
@use "../assets/styles/variables" as *;
.timeline {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: $spacing-sm;

    &__tabs {
        display: flex;
        flex-direction: row-reverse;
        justify-content: center;
        align-items: center;
        gap: $spacing-md;

        &__tab {
            font-family: $font-family-mono;
            font-size: $font-size-body;
            color: $disabled-color;
            cursor: pointer;
            position: relative;
            transition: color 0.3s ease;

            &:hover {
                color: $primary-color;
            }

            &--selected {
                color: $primary-color;
                text-decoration-line: underline;          /* turn the line on            */
                text-decoration-thickness: 2px;     /* use font’s stroke weight    */
                text-decoration-color: $primary-color;    /* use the same color as text  */
                text-decoration-skip-ink: none;          /* no ink skipping             */
                text-underline-position: under;          /* position the line under text */
                text-decoration-style: dotted;

            }
        }
    }

    &__year {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        gap: $spacing-md;

        &-nav {
            font-family: $font-family-mono;
            font-size: $font-size-subheading;
            color: $primary-color;
            cursor: pointer;
            transition: color 0.3s ease;

            &--disabled {
                color: $disabled-color;
                cursor: not-allowed;
            }
        }

        &-display {
            font-family: $font-family-heading;
            font-size: $font-size-heading;
            font-weight: $font-weight-tzar;
            text-align: center;
            color: $primary-color;
            line-height: 126px;
        }
    }

    &__scroll {
        display: flex;
        flex-direction: row;
        width: 100%;
        flex-grow: 1;
        justify-content: space-around;

        &__item {
            height: 24px;
            width: 1px;
            background: $secondary-color;
        }

        &__separator {
            height: 12px;
            width: 1px;
            background: rgba($secondary-color, 0.5);
            align-self: center;
        }
    }
}
</style>