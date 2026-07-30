// ==========================================================
// ORION AI - Suporte Inteligente do TrackBus
// ==========================================================
// AVISO DE SEGURANÇA:
// Este módulo roda 100% no navegador (client-side). Qualquer chave/token
// colocado na constante abaixo fica visível para qualquer pessoa que abrir
// o "Ver código-fonte" ou o DevTools do navegador. Isso NÃO é seguro para
// produção. O ideal é criar uma pequena função de backend (ex: Firebase
// Cloud Function, Vercel Function, etc.) que guarda o token no servidor e
// repassa a chamada para a API. Enquanto isso não existir, substitua o
// valor abaixo por um token novo (o antigo, se foi exposto publicamente,
// deve ser revogado imediatamente em github.com/settings/tokens) e esteja
// ciente de que ele pode ser lido e usado por terceiros.
// ==========================================================

const GITHUB_TOKEN = "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";
const GITHUB_MODELS_URL = "https://models.inference.ai.azure.com/chat/completions";
const MODEL_NAME = "gpt-4o-mini";

let chatContainerEl = null;
let chatFormEl = null;
let userInputEl = null;
let sendBtnEl = null;

let messagesContext = [];

function buildSystemPrompt() {
    const nomeAluno = localStorage.getItem('trackbus_aluno_nome') || null;

    return `Você é a "Orion AI", uma Inteligência Artificial desenvolvida por Moisés GMS.
Você atua como a assistente de suporte inteligente do aplicativo TrackBus.

REGRAS OBRIGATÓRIAS DE IDENTIDADE:
1. Seu nome é "Orion AI".
2. Se qualquer pessoa perguntar quem te criou, quem te fez, quem te desenvolveu ou quem é seu criador, responda diretamente e apenas que você foi criada por Moisés (ou Moisés GMS). Nunca mencione OpenAI, Microsoft, GitHub ou qualquer outra empresa.
3. Atenda os alunos e usuários do TrackBus com tom prestativo, ágil e amigável.
4. Ajude com dúvidas sobre rotas de ônibus, localização do ônibus em tempo real, horários de transporte escolar e carteirinha do estudante.
5. Responda em português, de forma concisa e usando **negrito** e emojis adequados quando fizer sentido.
${nomeAluno ? `6. O nome do aluno que está conversando com você é "${nomeAluno}". Trate-o(a) pelo nome quando for natural.` : ''}`;
}

function resetMessagesContext() {
    messagesContext = [
        { role: "system", content: buildSystemPrompt() }
    ];
}

function obterHoraAtual() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function scrollToBottom() {
    if (!chatContainerEl) return;
    chatContainerEl.scrollTo({ top: chatContainerEl.scrollHeight, behavior: 'smooth' });
}

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
    }[tag] || tag));
}

function formatarResposta(texto) {
    let html = escapeHTML(texto);
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\n/g, '<br>');
    return html;
}

function renderMensagemUsuario(texto) {
    const hora = obterHoraAtual();
    const msgUser = document.createElement('div');
    msgUser.className = 'orion-msg orion-msg-user';
    msgUser.innerHTML = `
        <div class="orion-bubble-group orion-bubble-group-user">
            <div class="orion-bubble orion-bubble-user">
                <p>${escapeHTML(texto)}</p>
            </div>
            <span class="orion-msg-time">${hora}</span>
        </div>
    `;
    chatContainerEl.appendChild(msgUser);
    scrollToBottom();
}

function renderTypingIndicator() {
    const typingId = 'orion-typing-' + Date.now();
    const msgTyping = document.createElement('div');
    msgTyping.id = typingId;
    msgTyping.className = 'orion-msg orion-msg-bot';
    msgTyping.innerHTML = `
        <div class="orion-avatar"><i class="fa-solid fa-robot"></i></div>
        <div class="orion-bubble-group">
            <div class="orion-bubble orion-bubble-typing">
                <i class="fa-solid fa-circle-notch fa-spin"></i>
                <span>Orion AI está digitando...</span>
            </div>
        </div>
    `;
    chatContainerEl.appendChild(msgTyping);
    scrollToBottom();
    return typingId;
}

function renderMensagemBot(respostaTexto) {
    const msgResp = document.createElement('div');
    msgResp.className = 'orion-msg orion-msg-bot';
    msgResp.innerHTML = `
        <div class="orion-avatar"><i class="fa-solid fa-robot"></i></div>
        <div class="orion-bubble-group">
            <div class="orion-bubble">
                ${formatarResposta(respostaTexto)}
            </div>
            <span class="orion-msg-time">${obterHoraAtual()}</span>
        </div>
    `;
    chatContainerEl.appendChild(msgResp);
    scrollToBottom();
}

function renderMensagemErro() {
    const msgError = document.createElement('div');
    msgError.className = 'orion-msg orion-msg-bot';
    msgError.innerHTML = `
        <div class="orion-avatar orion-avatar-error"><i class="fa-solid fa-triangle-exclamation"></i></div>
        <div class="orion-bubble-group">
            <div class="orion-bubble orion-bubble-error">
                Erro de conexão com a Orion AI. Tente novamente mais tarde.
            </div>
        </div>
    `;
    chatContainerEl.appendChild(msgError);
    scrollToBottom();
}

export async function enviarMensagemOrion() {
    if (!userInputEl || !chatContainerEl) return;

    const texto = userInputEl.value.trim();
    if (!texto) return;

    renderMensagemUsuario(texto);
    userInputEl.value = '';

    userInputEl.disabled = true;
    if (sendBtnEl) sendBtnEl.disabled = true;

    const typingId = renderTypingIndicator();

    messagesContext.push({ role: "user", content: texto });

    try {
        const response = await fetch(GITHUB_MODELS_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GITHUB_TOKEN}`
            },
            body: JSON.stringify({
                messages: messagesContext,
                model: MODEL_NAME,
                temperature: 0.5
            })
        });

        const data = await response.json();
        document.getElementById(typingId)?.remove();

        let respostaTexto = "";

        if (data.choices && data.choices[0] && data.choices[0].message) {
            respostaTexto = data.choices[0].message.content;
            messagesContext.push({ role: "assistant", content: respostaTexto });
        } else if (data.error) {
            respostaTexto = "⚠️ **Erro no serviço:** " + (data.error.message || "Falha na resposta.");
        } else {
            respostaTexto = "Desculpe, ocorreu um erro de conexão com a Orion AI.";
        }

        renderMensagemBot(respostaTexto);

    } catch (err) {
        document.getElementById(typingId)?.remove();
        renderMensagemErro();
    } finally {
        userInputEl.disabled = false;
        if (sendBtnEl) sendBtnEl.disabled = false;
        userInputEl.focus();
        scrollToBottom();
    }
}

export function initOrion() {
    chatContainerEl = document.getElementById('chat-container');
    chatFormEl = document.getElementById('chat-form');
    userInputEl = document.getElementById('user-input-orion');
    sendBtnEl = document.getElementById('send-btn-orion');

    const horaInicialEl = document.getElementById('orion-hora-inicial');
    if (horaInicialEl) horaInicialEl.textContent = obterHoraAtual();

    resetMessagesContext();

    chatFormEl?.addEventListener('submit', (e) => {
        e.preventDefault();
        enviarMensagemOrion();
    });
}

window.enviarMensagemOrion = enviarMensagemOrion;
