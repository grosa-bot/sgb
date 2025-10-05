<template>
  <div class="page">
    <h1>Sugestão de Compra</h1>

    <div class="info">
      <p>
        <strong>Fornecedor:</strong> {{ fornecedor }}<br />
        <strong>Lead Time:</strong> {{ leadTime }} dias<br />
        <strong>Estoque desejado:</strong> {{ estoqueDias }} dias<br />
        <strong>Período:</strong> {{ periodo }}
      </p>
    </div>

    <!-- Filtro de pesquisa -->
    <div class="filters">
      <input v-model="filtros.Codigo" placeholder="Pesquisar Código" />
      <input v-model="filtros.Descricao" placeholder="Pesquisar Descrição" />
      <input v-model="filtros.Ativo" placeholder="Pesquisar Ativo" />
      <input v-model="filtros['Fora de Linha']" placeholder="Pesquisar Fora de Linha" />
      <input v-model="filtros.Unidade" placeholder="Pesquisar Unidade" />
      <input v-model="filtros.Marca" placeholder="Pesquisar Marca" />
      <label>
        <input type="checkbox" v-model="mostrarSomenteSugestao" />
        Mostrar somente itens com sugestão
      </label>
    </div>

    <div v-if="paginatedProdutos.length" class="table-container">
      <table>
        <thead>
          <tr>
            <th>Código</th>
            <th>Descrição</th>
            <th>Ativo</th>
            <th>Fora de Linha</th>
            <th>Unidade</th>
            <th>Marca</th>
            <th>Custo Atual</th>
            <th>Estoque Total</th>
            <th>Giro Dia</th>
            <th>Sugestão (Qtd)</th>
            <th>Comprar</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(p, i) in paginatedProdutos" :key="i">
            <td>{{ p['Codigo do Produto'] }}</td>
            <td>{{ p['Descricao'] }}</td>
            <td>{{ p['Ativo'] }}</td>
            <td>{{ p['Fora de Linha'] }}</td>
            <td>{{ p['Unidade'] }}</td>
            <td>{{ p['Marca'] }}</td>
            <td>{{ p['Custo Atual'] }}</td>
            <td>{{ p['Estoque Total'] }}</td>
            <td>{{ converteGiroMesParaGiroDia(p) }}</td>
            <td>{{ calcularSugestaoQtd(p) }}</td>
            <td><input type="number" v-model.number="p.qtdCompra" min="0" class="input-qtd" /></td>
          </tr>
        </tbody>
      </table>

      <!-- Controles de paginação -->
      <div class="pagination">
        <button @click="prevPage" :disabled="paginaAtual === 1">Anterior</button>
        <span>Página {{ paginaAtual }} de {{ totalPaginas }}</span>
        <button @click="nextPage" :disabled="paginaAtual === totalPaginas">Próxima</button>
      </div>
    </div>

    <div v-else class="empty">
      <p>Carregando dados do CSV...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import Papa from 'papaparse'

const route = useRoute()
const fornecedor = route.query.fornecedor || '—'
const leadTime = Number(route.query.leadTime) || 0
const estoqueDias = Number(route.query.estoqueDias) || 0
const periodo = route.query.periodo || '—'

const produtos = ref([])

// Paginação
const paginaAtual = ref(1)
const itensPorPagina = 20

// Filtros de pesquisa
const filtros = ref({
  Codigo: '',
  Descricao: '',
  Ativo: '',
  'Fora de Linha': '',
  Unidade: '',
  Marca: '',
})

// Filtro para mostrar somente itens com sugestão
const mostrarSomenteSugestao = ref(false)

// Carregar CSV da pasta public
async function carregarCSVLocal() {
  try {
    const response = await fetch('/produtos.csv')
    if (!response.ok) throw new Error('Erro ao carregar CSV')

    const csvText = await response.text()
    const results = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
    })

    produtos.value = results.data.map((p) => ({
      ...p,
      qtdCompra: 0,
    }))
  } catch (error) {
    console.error('Erro ao carregar CSV local:', error)
  }
}

onMounted(() => {
  carregarCSVLocal()
})

// Converte giro mensal para giro diário
function converteGiroMesParaGiroDia(p) {
  const giro = parseFloat(p['Venda.giro_mes']) || 0
  const giro_dia = giro / 21
  return giro_dia
}

// Calcular sugestão de compra
function calcularSugestaoQtd(p) {
  const estoqueTotal = parseFloat(p['Estoque Total']) || 0
  const giroMes = parseFloat(p['Venda.giro_mes']) || 0
  const giroDia = giroMes / 21
  const qtdCompra = parseFloat(p.qtdCompra) || 0

  // if (estoqueTotal <= 0 || giroDia <= 0) return 0

  const sugestao = (leadTime + estoqueDias) * giroDia - estoqueTotal - qtdCompra
  return sugestao > 0 ? Math.ceil(sugestao) : 0
}


// Computed para filtrar produtos
const produtosFiltrados = computed(() => {
  return produtos.value.filter((p) => {
    const sugestaoQtd = calcularSugestaoQtd(p) || 0
    if (mostrarSomenteSugestao.value && sugestaoQtd <= 0) return false

    return (
      (!filtros.value.Codigo ||
        (p['Codigo do Produto'] || '')
          .toString()
          .toLowerCase()
          .includes(filtros.value.Codigo.toLowerCase())) &&
      (!filtros.value.Descricao ||
        (p['Descricao'] || '').toLowerCase().includes(filtros.value.Descricao.toLowerCase())) &&
      (!filtros.value.Ativo ||
        (p['Ativo'] || '').toLowerCase().includes(filtros.value.Ativo.toLowerCase())) &&
      (!filtros.value['Fora de Linha'] ||
        (p['Fora de Linha'] || '')
          .toLowerCase()
          .includes(filtros.value['Fora de Linha'].toLowerCase())) &&
      (!filtros.value.Unidade ||
        (p['Unidade'] || '').toLowerCase().includes(filtros.value.Unidade.toLowerCase())) &&
      (!filtros.value.Marca ||
        (p['Marca'] || '').toLowerCase().includes(filtros.value.Marca.toLowerCase()))
    )
  })
})


// Computed para produtos paginados
const paginatedProdutos = computed(() => {
  const start = (paginaAtual.value - 1) * itensPorPagina
  return produtosFiltrados.value.slice(start, start + itensPorPagina)
})

const totalPaginas = computed(() => {
  return Math.ceil(produtosFiltrados.value.length / itensPorPagina) || 1
})

function nextPage() {
  if (paginaAtual.value < totalPaginas.value) paginaAtual.value++
}

function prevPage() {
  if (paginaAtual.value > 1) paginaAtual.value--
}
</script>

<style scoped>
.page {
  width: 100%;
  min-height: 100vh;
  padding: 30px;
  background: #f7f9fc;
  font-family: 'Segoe UI', Roboto, sans-serif;
}

h1 {
  text-align: center;
  margin-bottom: 25px;
  color: #222;
}

.info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.filters {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 15px;
}

.filters input {
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 14px;
}

.filters label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
}

.table-container {
  overflow-x: auto;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

table {
  width: 100%;
  border-collapse: collapse;
  min-width: 1200px;
}

th,
td {
  border: 1px solid #e0e0e0;
  padding: 10px;
  text-align: left;
  font-size: 14px;
}

th {
  background-color: #f1f3f6;
  font-weight: 600;
  color: #333;
}

tr:nth-child(even) {
  background-color: #fafafa;
}

.input-qtd {
  width: 80px;
  padding: 6px;
  border-radius: 6px;
  border: 1px solid #ccc;
  text-align: center;
}

.empty {
  text-align: center;
  color: #666;
  margin-top: 40px;
}

.pagination {
  margin-top: 15px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.pagination button {
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid #ccc;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination span {
  font-weight: 600;
}
</style>
