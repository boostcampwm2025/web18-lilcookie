// https://vitepress.dev/guide/custom-theme
import { h } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import './style.css'

import ExtensionPreview from './components/ExtensionPreview.vue'
import DashboardPreview from './components/DashboardPreview.vue'

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
    })
  },
  enhanceApp({ app, router, siteData }) {
    app.component('ExtensionPreview', ExtensionPreview)
    app.component('DashboardPreview', DashboardPreview)
  }
} satisfies Theme
