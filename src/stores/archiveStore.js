import { defineStore } from 'pinia'
import Papa from 'papaparse'

// Import media files with correct base path
const mediaFiles = Object.fromEntries(
  Object.entries(import.meta.glob('/data/**/*.{mp4,png,jpg,jpeg,webm}', { eager: true }))
    .map(([key, value]) => [key.toLowerCase(), key])
);

export const useArchiveStore = defineStore('archive', {
  state: () => ({
    items: [],
    loading: false,
    error: null,
    selectedTags: [],
    currentYear: null,
  }),
  
  getters: {
    doveItems: (state) => state.items.filter(item => item.type === 'Dove'),
    hawkItems: (state) => state.items.filter(item => item.type === 'Hawk'),
    itemsByYear: (state) => (year) => state.items.filter(item => item.year === year),
    itemsByTag: (state) => (tag) => state.items.filter(item => item.tags.includes(tag)),
    years: (state) => [...new Set(state.items.map(item => item.year))].sort(),
    allTags: (state) => [...new Set(state.items.flatMap(item => item.tags))].sort(),
    sortedItems: (state) => [...state.items].sort((a, b) => a.year - b.year || a.visualName.localeCompare(b.visualName)),
    itemsCount: (state) => state.items.length,
    doveCount: (state) => state.items.filter(item => item.type === 'Dove').length,
    hawkCount: (state) => state.items.filter(item => item.type === 'Hawk').length,
    
    // Year navigation getters
    currentYearItems: (state) => state.currentYear ? state.items.filter(item => item.year === state.currentYear) : [],
    hasNextYear: (state) => {
      const years = [...new Set(state.items.map(item => item.year))].sort()
      return state.currentYear ? years.indexOf(state.currentYear) < years.length - 1 : false
    },
    hasPrevYear: (state) => {
      const years = [...new Set(state.items.map(item => item.year))].sort()
      return state.currentYear ? years.indexOf(state.currentYear) > 0 : false
    },
    nextYear: (state) => {
      const years = [...new Set(state.items.map(item => item.year))].sort()
      const currentIndex = years.indexOf(state.currentYear)
      return currentIndex < years.length - 1 ? years[currentIndex + 1] : null
    },
    prevYear: (state) => {
      const years = [...new Set(state.items.map(item => item.year))].sort()
      const currentIndex = years.indexOf(state.currentYear)
      return currentIndex > 0 ? years[currentIndex - 1] : null
    },

    // Tag-related getters
    tagCounts: (state) => {
      const counts = {}
      state.items.forEach(item => {
        item.tags.forEach(tag => {
          counts[tag] = (counts[tag] || 0) + 1
        })
      })
      return counts
    },
    
    filteredByTags: (state) => {
      if (!state.selectedTags.length) return state.items
      return state.items.filter(item => 
        state.selectedTags.every(tag => item.tags.includes(tag))
      )
    },
    
    tagsByType: (state) => (type) => {
      const typeItems = state.items.filter(item => item.type === type)
      return [...new Set(typeItems.flatMap(item => item.tags))].sort()
    },
    
    relatedTags: (state) => (tag) => {
      const itemsWithTag = state.items.filter(item => item.tags.includes(tag))
      return [...new Set(itemsWithTag.flatMap(item => 
        item.tags.filter(t => t !== tag)
      ))].sort()
    }
  },

  actions: {
    async loadArchiveData() {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}data/items.csv`);
        const csvText = await response.text();
        const { data } = Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
        });
        
        this.items = data.map(row => {
          // Parse tags - they might be in multiple lines in the CSV
          const tags = row.Tags ? 
            row.Tags.split(/[\n,]/)
              .map(tag => tag.trim())
              .filter(Boolean) : 
            [];

          // Find matching media file
          const searchName = row.VisualName.toLowerCase();
          const searchType = row.Type.toLowerCase();
          const filePath = Object.keys(mediaFiles).find(path => 
            path.includes(`/${searchType}/`) && 
            path.includes(searchName)
          );

          return {
            visualName: row.VisualName,
            type: row.Type,
            headline: row.Headline,
            text: row.Text || '',
            tags,
            year: parseInt(row.Year),
            filePath: filePath ? mediaFiles[filePath] : ''
          };
        });

        if (!this.currentYear && this.items.length) {
          this.currentYear = Math.min(...this.items.map(item => item.year));
        }
      } catch (err) {
        console.error('Error loading archive data:', err);
        this.error = err?.message || 'Failed to load archive data';
      } finally {
        this.loading = false;
      }
    },

    // Year navigation actions
    setYear(year) {
      const availableYears = [...new Set(this.items.map(item => item.year))]
      if (availableYears.includes(year)) {
        this.currentYear = year
        return true
      }
      return false
    },

    goToNextYear() {
      if (this.hasNextYear) {
        this.currentYear = this.nextYear
        return true
      }
      return false
    },

    goToPrevYear() {
      if (this.hasPrevYear) {
        this.currentYear = this.prevYear
        return true
      }
      return false
    },

    getRandomItems(count = 1) {
      const items = [...this.items]
      const result = []
      while (result.length < count && items.length > 0) {
        const index = Math.floor(Math.random() * items.length)
        result.push(items.splice(index, 1)[0])
      }
      return result
    },

    getRandomByType(type, count = 1) {
      const typeItems = this.items.filter(item => item.type === type)
      const result = []
      const items = [...typeItems]
      while (result.length < count && items.length > 0) {
        const index = Math.floor(Math.random() * items.length)
        result.push(items.splice(index, 1)[0])
      }
      return result
    },

    filterByYearRange(startYear, endYear) {
      return this.items.filter(item => item.year >= startYear && item.year <= endYear)
    },

    searchItems(query) {
      const searchStr = query.toLowerCase()
      return this.items.filter(item => 
        item.headline.toLowerCase().includes(searchStr) ||
        item.text.toLowerCase().includes(searchStr) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchStr))
      )
    },

    // New tag-related actions
    toggleTag(tag) {
      const index = this.selectedTags.indexOf(tag)
      if (index === -1) {
        this.selectedTags.push(tag)
      } else {
        this.selectedTags.splice(index, 1)
      }
    },

    clearSelectedTags() {
      this.selectedTags = []
    },

    getItemsWithAllTags(tags) {
      return this.items.filter(item => 
        tags.every(tag => item.tags.includes(tag))
      )
    },

    getItemsWithAnyTags(tags) {
      return this.items.filter(item => 
        tags.some(tag => item.tags.includes(tag))
      )
    }
  },
}) 