
const nomeTarefa = document.getElementById("nome-tarefa");
const adicionarBtn = document.getElementById("adicionar-btn");
const listaTarefas = document.getElementById("Tarefas");
const prazoTarefa = document.getElementById("prazo-tarefa");

const statusNomes = {
    pending: "Pendente",
    doing: "Em andamento",
    done: "Feito"
};

// Descobre o status inicial dos cartões que já estão no HTML
function descobrirStatus(texto) {
    if (texto.includes("Pendente")) return "pending";
    if (texto.includes("Andamento")) return "doing";
    if (texto.includes("Feito") || texto.includes("Pronto")) return "done";

    return "pending";
}

// Atualiza os três contadores
function atualizarContadores() {
    const tarefas = Array.from(listaTarefas.querySelectorAll(".task"));

    document.getElementById("pendenteID").textContent =
        tarefas.filter(t => t.dataset.status === "pending").length;

    document.getElementById("emAndamentoID").textContent =
        tarefas.filter(t => t.dataset.status === "doing").length;

    document.getElementById("feitoID").textContent =
        tarefas.filter(t => t.dataset.status === "done").length;
}

// Adiciona os controles a um cartão de tarefa
function configurarTarefa(tarefa) {
    // Evita adicionar os mesmos botões duas vezes
    if (tarefa.querySelector(".task-actions")) return;

    const statusElement = tarefa.querySelector(".task-status");

    if (!statusElement) {
        console.error("A tarefa precisa ter um <p> com seu status:", tarefa);
        return;
    }

    tarefa.dataset.status = descobrirStatus(tarefa.textContent);

    const acoes = document.createElement("div");
    acoes.className = "task-actions";

    const avancarBtn = document.createElement("button");
    const excluirBtn = document.createElement("button");

    function atualizarBotao() {
        avancarBtn.textContent =
            tarefa.dataset.status === "pending" ? "Começar" :
            tarefa.dataset.status === "doing" ? "Concluir" :
            "Reabrir";
    }

    avancarBtn.addEventListener("click", function() {
        const statusAtual = tarefa.dataset.status;

        if (statusAtual === "pending") {
            tarefa.dataset.status = "doing";
        } else if (statusAtual === "doing") {
            tarefa.dataset.status = "done";
        } else {
            tarefa.dataset.status = "pending";
        }

        statusElement.textContent = statusNomes[tarefa.dataset.status];

        atualizarBotao();
        atualizarContadores();
    });

    excluirBtn.textContent = "Excluir";

    excluirBtn.addEventListener("click", function() {
        tarefa.remove();
        atualizarContadores();
    });

    acoes.appendChild(avancarBtn);
    acoes.appendChild(excluirBtn);
    tarefa.appendChild(acoes);

    atualizarBotao();
}

// Prepara os cartões que já existem no HTML
listaTarefas.querySelectorAll(".task").forEach(configurarTarefa);

// Cadastra novas tarefas
adicionarBtn.addEventListener("click", function() {
    const nome = nomeTarefa.value.trim();

    if (nome === "") {
        alert("Digite o nome da tarefa!");
        return;
    }

    
const tarefa = document.createElement("div");
tarefa.className = "task";
tarefa.dataset.status = "pending";

const titulo = document.createElement("h2");
titulo.className = "task-title";
titulo.textContent = nome;

const status = document.createElement("p");
status.className = "task-status";
status.textContent = "Pendente";

const prazo = document.createElement("p");
prazo.className = "task-deadline";

if (prazoTarefa.value !== "") {
    const [ano, mes, dia] = prazoTarefa.value.split("-");
    prazo.textContent = `Prazo: ${dia}/${mes}/${ano}`;
} else {
    prazo.textContent = "";
}

tarefa.appendChild(titulo);
tarefa.appendChild(status);
tarefa.appendChild(prazo);


    listaTarefas.appendChild(tarefa);

    configurarTarefa(tarefa);

    nomeTarefa.value = "";
    atualizarContadores();
    nomeTarefa.value = "";
prazoTarefa.value = "";



});

// Calcula os números iniciais
atualizarContadores();
