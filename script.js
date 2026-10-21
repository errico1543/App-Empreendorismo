
const nomeTarefa = document.getElementById("nome-tarefa");
const prazoTarefa = document.getElementById("prazo-tarefa");
const adicionarBtn = document.getElementById("adicionar-btn");
const listaTarefas = document.getElementById("Tarefas");

const CHAVE_STORAGE = "estudaPlus_tarefas";
const CHAVE_NOME = "estudaPlus_nome";

const statusNomes = {
    pending: "Pendente",
    doing: "Em andamento",
    done: "Feito"
};

let tarefas = [];

// Identifica o status escrito nos cartões antigos do HTML
function descobrirStatus(texto) {
    const textoNormalizado = texto.toLowerCase();

    if (textoNormalizado.includes("pendente")) {
        return "pending";
    }

    if (textoNormalizado.includes("andamento")) {
        return "doing";
    }

    if (
        textoNormalizado.includes("feito") ||
        textoNormalizado.includes("pronto") ||
        textoNormalizado.includes("conclu")
    ) {
        return "done";
    }

    return "pending";
}

// Recupera os cartões que já estavam escritos no HTML
function importarTarefasAntigas() {
    return Array.from(listaTarefas.querySelectorAll(".task"))
        .map((cartao, indice) => {
            const titulo = cartao.querySelector(".task-title");
            const status = cartao.querySelector(".task-status");
            const prazo = cartao.querySelector(".task-deadline");

            if (!titulo || !status) {
                console.warn(
                    "Cartão ignorado: falta título ou status.",
                    cartao
                );
                return null;
            }

            let dataPrazo = "";

            if (prazo) {
                const correspondencia = prazo.textContent.match(
                    /(\d{2})\/(\d{2})\/(\d{4})/
                );

                if (correspondencia) {
                    dataPrazo =
                        `${correspondencia[3]}-` +
                        `${correspondencia[2]}-` +
                        `${correspondencia[1]}`;
                }
            }

            return {
                id: `antiga-${indice}`,
                nome: titulo.textContent.trim(),
                status: descobrirStatus(status.textContent),
                prazo: dataPrazo
            };
        })
        .filter(tarefa => tarefa !== null);
}

// Salva a lista inteira no navegador
function salvarTarefas() {
    try {
        localStorage.setItem(
            CHAVE_STORAGE,
            JSON.stringify(tarefas)
        );
    } catch (erro) {
        console.error("Não foi possível salvar as tarefas:", erro);
        alert("Não foi possível salvar os dados neste navegador.");
    }
}

// Carrega os dados salvos ou importa os cartões iniciais
function carregarTarefas() {
    try {
        const dadosSalvos = localStorage.getItem(CHAVE_STORAGE);

        if (dadosSalvos !== null) {
            const dados = JSON.parse(dadosSalvos);

            if (Array.isArray(dados)) {
                tarefas = dados
                    .filter(tarefa =>
                        tarefa &&
                        typeof tarefa.nome === "string"
                    )
                    .map((tarefa, indice) => ({
                        id: String(tarefa.id ?? `recuperada-${indice}`),
                        nome: tarefa.nome,
                        status: Object.hasOwn(
                            statusNomes,
                            tarefa.status
                        ) ? tarefa.status : "pending",
                        prazo: typeof tarefa.prazo === "string"
                            ? tarefa.prazo
                            : ""
                    }));

                return;
            }
        }
    } catch (erro) {
        console.error("Erro ao carregar as tarefas:", erro);
    }

    // Na primeira utilização, aproveita os cartões do HTML
    tarefas = importarTarefasAntigas();

    salvarTarefas();
}

// Formata AAAA-MM-DD para DD/MM/AAAA sem problemas de fuso horário
function formatarPrazo(data) {
    if (!data) return "";

    const [ano, mes, dia] = data.split("-");

    if (!ano || !mes || !dia) return "";

    return `${dia}/${mes}/${ano}`;
}

// Atualiza os três contadores
function atualizarContadores() {
    document.getElementById("pendenteID").textContent =
        tarefas.filter(t => t.status === "pending").length;

    document.getElementById("emAndamentoID").textContent =
        tarefas.filter(t => t.status === "doing").length;

    document.getElementById("feitoID").textContent =
        tarefas.filter(t => t.status === "done").length;

        
const total = tarefas.length;
const concluidas = tarefas.filter(
    tarefa => tarefa.status === "done"
).length;

const porcentagem = total === 0
    ? 0
    : Math.round((concluidas / total) * 100);

document.getElementById("progresso-texto").textContent =
    `${concluidas} de ${total} concluídas (${porcentagem}%)`;

document.getElementById("progresso-barra").style.width =
    `${porcentagem}%`;

}

// Cria e organiza os cartões na tela
function renderizarTarefas() {
    listaTarefas.replaceChildren();

    const tarefasOrdenadas = [...tarefas].sort((a, b) => {
    // Tarefas sem prazo ficam no final
    if (!a.prazo && !b.prazo) return 0;
    if (!a.prazo) return 1;
    if (!b.prazo) return -1;

    // Datas no formato AAAA-MM-DD podem ser comparadas diretamente
    return a.prazo.localeCompare(b.prazo);
});

tarefasOrdenadas.forEach(tarefa => {
        const cartao = document.createElement("div");
        cartao.className = "task";
        cartao.dataset.id = tarefa.id;

        const titulo = document.createElement("h2");
        titulo.className = "task-title";
        titulo.textContent = tarefa.nome;

        const status = document.createElement("p");
        status.className = "task-status";
        status.textContent = statusNomes[tarefa.status];

        cartao.appendChild(titulo);
        cartao.appendChild(status);

        // Só mostra o prazo quando existe uma data
        if (tarefa.prazo) {
            const prazo = document.createElement("p");
            prazo.className = "task-deadline";
            prazo.textContent = `Prazo: ${formatarPrazo(tarefa.prazo)}`;

            cartao.appendChild(prazo);
        }

        const acoes = document.createElement("div");
        acoes.className = "task-actions";

        const avancarBtn = document.createElement("button");
        avancarBtn.type = "button";
        avancarBtn.className = "task-advance";
        avancarBtn.dataset.action = "avancar";

        if (tarefa.status === "pending") {
            avancarBtn.textContent = "Começar";
        } else if (tarefa.status === "doing") {
            avancarBtn.textContent = "Concluir";
        } else {
            avancarBtn.textContent = "Reabrir";
        }

        const excluirBtn = document.createElement("button");
        excluirBtn.type = "button";
        excluirBtn.className = "task-delete";
        excluirBtn.dataset.action = "excluir";
        excluirBtn.textContent = "Excluir";

        acoes.appendChild(avancarBtn);
        acoes.appendChild(excluirBtn);
        cartao.appendChild(acoes);

        listaTarefas.appendChild(cartao);
    });

    atualizarContadores();
}

// Cria uma nova tarefa
adicionarBtn.addEventListener("click", function() {
    const nome = nomeTarefa.value.trim();
    const prazo = prazoTarefa.value;

    if (nome === "") {
        alert("Digite o nome da tarefa!");
        nomeTarefa.focus();
        return;
    }

    tarefas.push({
        id: `tarefa-${Date.now()}-${tarefas.length}`,
        nome: nome,
        status: "pending",
        prazo: prazo
    });

    salvarTarefas();
    renderizarTarefas();

    nomeTarefa.value = "";
    prazoTarefa.value = "";
    nomeTarefa.focus();
});

// Gerencia os botões de todos os cartões
listaTarefas.addEventListener("click", function(evento) {
    const botao = evento.target.closest("button[data-action]");

    if (!botao) return;

    const cartao = botao.closest(".task");

    if (!cartao) return;

    const tarefa = tarefas.find(
        item => item.id === cartao.dataset.id
    );

    if (!tarefa) return;

    if (botao.dataset.action === "avancar") {
        if (tarefa.status === "pending") {
            tarefa.status = "doing";
        } else if (tarefa.status === "doing") {
            tarefa.status = "done";
        } else {
            tarefa.status = "pending";
        }
    }

    if (botao.dataset.action === "excluir") {
        tarefas = tarefas.filter(
            item => item.id !== tarefa.id
        );
    }

    salvarTarefas();
    renderizarTarefas();
});

const nomeDisplay = document.getElementById("usernameDisplayer");
const alterarNomeBtn = document.getElementById("alterar-nome-btn");

function alterarNome() {
    const nomeAtual = localStorage.getItem(CHAVE_NOME) || "";

    const novoNome = prompt(
        "Qual é o seu nome?",
        nomeAtual
    );

    if (novoNome === null || novoNome.trim() === "") {
        return;
    }

    const nomeLimpo = novoNome.trim();

    localStorage.setItem(CHAVE_NOME, nomeLimpo);
    nomeDisplay.textContent = "Bem-vindo, " + nomeLimpo + "!";
}

// Pergunta o nome se ainda não houver um salvo
const nomeSalvo = localStorage.getItem(CHAVE_NOME);

if (nomeSalvo) {
    nomeDisplay.textContent = "Bem-vindo, " + nomeSalvo + "!";
} else {
    alterarNome();
}

// Botão discreto
alterarNomeBtn.addEventListener("click", alterarNome);

// Atalho: Alt + Shift + U
document.addEventListener("keydown", function(evento) {
    if (
        evento.altKey &&
        evento.shiftKey &&
        evento.code === "KeyU"
    ) {
        evento.preventDefault();
        alterarNome();
    }
});


const serieDisplay = document.getElementById("serieDisplay");
const alterarSerieBtn = document.getElementById("alterar-serie-btn");

function alterarSerie() {
    const serieAtual = localStorage.getItem("estudaPlus_serie") || "8º Ano";

    const novaSerie = prompt(
        "Em qual série você está estudando?",
        serieAtual
    );

    if (novaSerie === null || novaSerie.trim() === "") {
        return;
    }

    const serieLimpa = novaSerie.trim();

    localStorage.setItem("estudaPlus_serie", serieLimpa);
    serieDisplay.textContent = "Série: " + serieLimpa;
}

// Carrega a série salva
const serieSalva = localStorage.getItem("estudaPlus_serie");

if (serieSalva) {
    serieDisplay.textContent = "Série: " + serieSalva;
}

// Botão de alteração
alterarSerieBtn.addEventListener("click", alterarSerie);

// Inicialização do Estuda+
carregarTarefas();
renderizarTarefas();
