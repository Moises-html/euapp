import { db } from './firebase-config.js';
import { navigateTo } from './router.js';

export function updateUserDOM(nome, matricula) {
    const userNameDisplay = document.getElementById('user-name-display');
    const profileUsername = document.querySelector('.profile-bar-username');
    const feedbackNameInput = document.getElementById('feedback-student-name');
    
    // Elementos da Sidebar
    const sidebarName = document.getElementById('sidebar-user-name');
    const sidebarMatricula = document.getElementById('sidebar-matricula-text');

    if (userNameDisplay) userNameDisplay.innerText = nome;
    if (profileUsername) profileUsername.innerText = nome;
    if (feedbackNameInput) feedbackNameInput.value = nome;
    if (sidebarName) sidebarName.innerText = nome;
    if (sidebarMatricula) sidebarMatricula.innerText = matricula;
}

export function checkSession() {
    const activeUser = localStorage.getItem('trackbus_aluno_nome');
    const activeMatricula = localStorage.getItem('trackbus_aluno_matricula');
    if (activeUser && activeMatricula) {
        updateUserDOM(activeUser, activeMatricula);
        navigateTo('screen-home');
    } else {
        navigateTo('screen-login');
    }
}

export function initAuth() {
    const tabSignin = document.getElementById('btn-tab-signin');
    const tabSignup = document.getElementById('btn-tab-signup');
    const formSignin = document.getElementById('form-signin');
    const formSignup = document.getElementById('form-signup');
    const btnGoogle = document.getElementById('btn-login-google');

    // Trata o retorno de login via redirecionamento (caso o pop-up seja bloqueado no mobile)
    firebase.auth().getRedirectResult().then((result) => {
        if (result && result.user) {
            const user = result.user;
            const nomeCompleto = user.displayName;
            const matriculaGerada = user.email.split('@')[0].replace('.', '_');

            db.ref(`estudantes/${matriculaGerada}`).once('value', (snapshot) => {
                if (!snapshot.exists()) {
                    db.ref(`estudantes/${matriculaGerada}`).set({
                        nome: nomeCompleto,
                        senha: 'autenticado_via_google_auth'
                    });
                }
                localStorage.setItem('trackbus_aluno_nome', nomeCompleto);
                localStorage.setItem('trackbus_aluno_matricula', matriculaGerada);
                updateUserDOM(nomeCompleto, matriculaGerada);
                navigateTo('screen-home');
            });
        }
    }).catch((error) => {
        console.error("Erro no retorno do redirect Google:", error);
        Swal.fire({
            title: 'Falha no Login',
            text: `Erro (${error.code}): ${error.message}`,
            icon: 'error'
        });
    });

    tabSignin?.addEventListener('click', () => {
        tabSignin.classList.add('active');
        tabSignup.classList.remove('active');
        formSignin.classList.add('active');
        formSignup.classList.remove('active');
    });

    tabSignup?.addEventListener('click', () => {
        tabSignup.classList.add('active');
        tabSignin.classList.remove('active');
        formSignup.classList.add('active');
        formSignin.classList.remove('active');
    });

    formSignin?.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = document.getElementById('signin-user').value.trim().toLowerCase();
        const pass = document.getElementById('signin-pass').value.trim();

        db.ref(`estudantes/${user}`).once('value', (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                if (data.senha === pass) {
                    localStorage.setItem('trackbus_aluno_nome', data.nome);
                    localStorage.setItem('trackbus_aluno_matricula', user);
                    updateUserDOM(data.nome, user);
                    Swal.fire({
                        title: 'Acesso Autorizado!',
                        text: `Bem-vindo de volta, ${data.nome}!`,
                        icon: 'success',
                        timer: 1500,
                        showConfirmButton: false
                    }).then(() => navigateTo('screen-home'));
                } else {
                    Swal.fire({ title: 'Erro de Senha', text: 'Senha incorreta.', icon: 'error' });
                }
            } else {
                Swal.fire({ title: 'Usuário não encontrado', text: 'Crie uma conta para continuar.', icon: 'error' });
            }
        });
    });

    formSignup?.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('signup-name').value.trim();
        const user = document.getElementById('signup-user').value.trim().toLowerCase();
        const pass = document.getElementById('signup-pass').value.trim();

        if (pass.length < 6) {
            Swal.fire({ title: 'Senha Curta', text: 'Mínimo de 6 caracteres.', icon: 'warning' });
            return;
        }

        db.ref(`estudantes/${user}`).once('value', (snapshot) => {
            if (snapshot.exists()) {
                Swal.fire({ title: 'Usuário Existente', text: 'Matrícula ou usuário já cadastrado.', icon: 'error' });
            } else {
                db.ref(`estudantes/${user}`).set({ nome: name, senha: pass })
                .then(() => {
                    localStorage.setItem('trackbus_aluno_nome', name);
                    localStorage.setItem('trackbus_aluno_matricula', user);
                    updateUserDOM(name, user);
                    Swal.fire({
                        title: 'Conta Criada!',
                        text: `Bem-vindo, ${name}!`,
                        icon: 'success',
                        timer: 1500,
                        showConfirmButton: false
                    }).then(() => navigateTo('screen-home'));
                });
            }
        });
    });

    btnGoogle?.addEventListener('click', () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth().signInWithPopup(provider)
            .then((result) => {
                const user = result.user;
                const nomeCompleto = user.displayName;
                const matriculaGerada = user.email.split('@')[0].replace('.', '_');
                db.ref(`estudantes/${matriculaGerada}`).once('value', (snapshot) => {
                    if (!snapshot.exists()) {
                        db.ref(`estudantes/${matriculaGerada}`).set({
                            nome: nomeCompleto,
                            senha: 'autenticado_via_google_auth'
                        });
                    }
                    localStorage.setItem('trackbus_aluno_nome', nomeCompleto);
                    localStorage.setItem('trackbus_aluno_matricula', matriculaGerada);
                    updateUserDOM(nomeCompleto, matriculaGerada);
                    navigateTo('screen-home');
                });
            })
            .catch((error) => {
                console.error("Erro no login Google:", error);
                
                // Redireciona caso ocorra bloqueio de pop-up no dispositivo móvel
                if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
                    firebase.auth().signInWithRedirect(provider);
                    return;
                }

                Swal.fire({ 
                    title: 'Falha no Login', 
                    text: `Erro (${error.code}): ${error.message}`, 
                    icon: 'error' 
                });
            });
    });

    document.getElementById('btn-logout')?.addEventListener('click', (e) => {
        e.preventDefault();
        firebase.auth().signOut().then(() => {
            localStorage.removeItem('trackbus_aluno_nome');
            localStorage.removeItem('trackbus_aluno_matricula');
            navigateTo('screen-login');
        });
    });
}