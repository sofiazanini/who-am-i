import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '../pages/HomeView.vue'
import PersonalityView from '../pages/PersonalityView.vue'
import LifeView from '../pages/LifeView.vue'
import WorkView from '../pages/WorkView.vue'
import { storyGroups } from '../data/storyGroups.js'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/personalita',
      name: 'personality',
      component: PersonalityView,
      props: { group: storyGroups.find((group) => group.id === 'personality') },
    },
    {
      path: '/vita',
      name: 'life',
      component: LifeView,
      props: { group: storyGroups.find((group) => group.id === 'life') },
    },
    {
      path: '/lavoro',
      name: 'work',
      component: WorkView,
      props: { group: storyGroups.find((group) => group.id === 'work') },
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
