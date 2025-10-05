<template>
  <div class="page">
    <div class="container">
      <h1>Sugestão de Compra</h1>

      <form @submit.prevent="irParaSugestao" class="form">
        <div class="grid">
          <!-- Fornecedor -->
          <div class="form-group col-span-2">
            <label>Fornecedor</label>
            <input
              type="text"
              v-model="filtroFornecedor"
              placeholder="Digite nome ou código..."
              class="input"
            />
            <ul v-if="fornecedoresFiltrados.length" class="dropdown">
              <li
                v-for="f in fornecedoresFiltrados"
                :key="f.codigo"
                @click="selecionarFornecedor(f)"
              >
                {{ f.codigo }} - {{ f.nome }}
              </li>
            </ul>
          </div>

          <!-- Lead Time -->
          <div class="form-group">
            <label>Lead Time (dias)</label>
            <input type="number" v-model.number="leadTime" min="0" class="input" />
          </div>

          <!-- Estoque -->
          <div class="form-group">
            <label>Tempo de Estoque (dias)</label>
            <input type="number" v-model.number="estoqueDias" min="0" class="input" />
          </div>

          <!-- Período -->
          <div class="form-group col-span-2">
            <label>Período</label>
            <div class="period-row">
              <div>
                <span>De:</span>
                <input type="month" v-model="periodoInicio" class="input" />
              </div>
              <div>
                <span>Até:</span>
                <input type="month" v-model="periodoFim" class="input" />
              </div>
            </div>
          </div>
        </div>

        <div class="actions">
          <button type="submit" class="btn">Avançar</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const filtroFornecedor = ref("");
const leadTime = ref(0);
const estoqueDias = ref(0);
const periodoInicio = ref("");
const periodoFim = ref("");
const fornecedorSelecionado = ref(null);

// Mock de fornecedores
const fornecedores = [
  { codigo: "F001", nome: "Fornecedor Alpha" },
  { codigo: "F002", nome: "Fornecedor Beta" },
  { codigo: "F003", nome: "Fornecedor Gama" },
];

const fornecedoresFiltrados = computed(() =>
  filtroFornecedor.value
    ? fornecedores.filter(
        (f) =>
          f.nome.toLowerCase().includes(filtroFornecedor.value.toLowerCase()) ||
          f.codigo.toLowerCase().includes(filtroFornecedor.value.toLowerCase())
      )
    : []
);

function selecionarFornecedor(f) {
  fornecedorSelecionado.value = f;
  filtroFornecedor.value = `${f.codigo} - ${f.nome}`;
}

function irParaSugestao() {
  if (!fornecedorSelecionado.value) {
    alert("Selecione um fornecedor!");
    return;
  }
  if (!periodoInicio.value || !periodoFim.value) {
    alert("Informe o período inicial e final!");
    return;
  }

  router.push({
    name: "sugestao",
    query: {
      fornecedor: fornecedorSelecionado.value.codigo,
      leadTime: leadTime.value,
      estoqueDias: estoqueDias.value,
      periodoInicio: periodoInicio.value,
      periodoFim: periodoFim.value,
    },
  });
}
</script>

<style scoped>
/* --- Layout geral --- */
.page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(180deg, #f4f6f9 0%, #e9ecf1 100%);
  font-family: "Segoe UI", Roboto, sans-serif;
  padding: 40px 60px;
}

.container {
  background: #fff;
  border-radius: 14px;
  padding: 40px 50px;
  box-shadow: 0 4px 25px rgba(0, 0, 0, 0.08);
  flex: 1;
  display: flex;
  flex-direction: column;
}

h1 {
  text-align: left;
  margin-bottom: 40px;
  color: #1a1a1a;
  font-size: 2rem;
  font-weight: 700;
}

/* --- Formulário --- */
.form {
  width: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 25px;
}

.form-group {
  display: flex;
  flex-direction: column;
  position: relative;
}

label {
  margin-bottom: 8px;
  color: #333;
  font-weight: 600;
  font-size: 15px;
}

.input {
  padding: 12px 14px;
  border: 1px solid #ccc;
  border-radius: 10px;
  font-size: 16px;
  transition: border-color 0.3s, box-shadow 0.3s;
  background: #fafafa;
  width: 100%;
}

.input:focus {
  outline: none;
  border-color: #007bff;
  background: #fff;
  box-shadow: 0 0 6px rgba(0, 123, 255, 0.2);
}

/* --- Dropdown Fornecedores --- */
.dropdown {
  position: absolute;
  top: 70px;
  width: 100%;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 10px;
  list-style: none;
  padding: 0;
  margin: 0;
  z-index: 10;
  max-height: 180px;
  overflow-y: auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.dropdown li {
  padding: 10px 14px;
  cursor: pointer;
  transition: background 0.2s;
  font-size: 15px;
}

.dropdown li:hover {
  background: #f2f6ff;
}

/* --- Período Range --- */
.period-row {
  display: flex;
  gap: 20px;
  align-items: center;
}

.period-row div {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.period-row span {
  margin-bottom: 6px;
  font-weight: 500;
  color: #555;
  font-size: 14px;
}

/* --- Botão --- */
.actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 40px;
}

.btn {
  padding: 14px 32px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.3s, transform 0.2s;
}

.btn:hover {
  background: #0056b3;
  transform: translateY(-2px);
}

/* --- Responsivo --- */
@media (max-width: 768px) {
  .page {
    padding: 20px;
  }
  .container {
    padding: 25px;
  }
}
</style>
