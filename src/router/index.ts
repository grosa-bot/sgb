import { createRouter, createWebHistory } from 'vue-router'
import FornecedorView from '../views/FornecedorView.vue'
import SugestaoView from "../views/SugestaoView.vue";


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/fornecedor", name: "fornecedor", component: FornecedorView },
    { path: "/sugestao", name: "sugestao", component: SugestaoView },

  ],
})

export default router
