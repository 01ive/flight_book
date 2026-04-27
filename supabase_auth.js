// --- GESTION DE L'AUTHENTIFICATION ---
const modal = document.getElementById('login-modal');
const authBtn = document.getElementById('auth-status-btn');

// Ouvrir / Fermer la modale
authBtn.onclick = () => {
    // Si déjà connecté, on propose le logout
    supabaseClient.auth.getSession().then(({ data }) => {
        if (data.session) {
            supabaseClient.auth.signOut().then(() => location.reload());
        } else {
            modal.style.display = "block";
        }
    });
};

document.getElementById('close-modal').onclick = () => modal.style.display = "none";

// Action de login
document.getElementById('do-login').onclick = async () => {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorP = document.getElementById('login-error');

    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });

    if (error) {
        errorP.innerText = "Erreur : " + error.message;
        errorP.style.display = "block";
    } else {
        modal.style.display = "none";
        checkUserSession(); // Mettre à jour l'interface
    }
};

// Vérifier si l'utilisateur est connecté pour afficher/masquer les boutons admin
async function checkUserSession() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    
    // Si connecté, on affiche les boutons d'ajout, sinon on les cache
    const adminElements = [
        document.getElementById('manual_entry_button'),
        document.getElementById('my-file-selector') 
        // ajoute ici tout ce qui permet de modifier les données
    ];

    if (session) {
        authBtn.innerText = "🔓 Disconnect";
    } else {
        authBtn.innerText = "🔐 Login";
    }
}

// Appeler au chargement de la page
checkUserSession();