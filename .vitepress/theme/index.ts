import { h } from 'vue'
import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'

import ProviderCards from './components/ProviderCards.vue'
import './style.css'

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      // Slot hooks if needed in the future
    })
  },
  enhanceApp({ app }) {
    // Register components globally so they can be used in any .md file
    app.component('ProviderCards', ProviderCards)
  },
} satisfies Theme
