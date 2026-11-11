// Supabase configuration
const supabaseUrl = 'https://ggoscybduasqnhilwdtq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdnb3NjeWJkdWFzcW5oaWx3ZHRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MDg4OTQsImV4cCI6MjA5MjE4NDg5NH0.sp9pZE9JELgIQExreEoIewu1Zh6VWKxYdt4s87UblR8';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
const supabaseStorageTracksName = 'tracks';
const supabaseTableFlightsName = 'flights';
const supabaseTableGroundName = 'ground';
const supabaseTableStatsName = 'stats';

// --- CONFIGURATION MODE LOCAL / FALLBACK ---
const LOCAL_DATA_PATH = '../local_data';
let isLocalFallback = false; // Passe automatiquement à true si Supabase est en pause

// Function to get the public URL of an IGC file (Supabase or Local Data URL)
function getIGCFileUrl(fileName) {
    if (!isLocalFallback) {
        const { data: storageData, error } = supabaseClient
            .storage
            .from(supabaseStorageTracksName)
            .getPublicUrl(fileName);

        if (error) {
            console.error('Erreur lors de la récupération de l\'URL du fichier:', error);
            return null;
        }

        return storageData.publicUrl;
    } else {
        const relativePath = `${LOCAL_DATA_PATH}/${supabaseStorageTracksName}/${encodeURIComponent(fileName)}`;
        return new URL(relativePath, window.location.href).href;
    }
}

// Function to load tables (flights, ground, stats) from Supabase with automatic local fallback
async function loadTableFromSupabase(tableName) {
    if (!isLocalFallback) {
        const { data, error } = await supabaseClient
            .from(tableName)
            .select('*')
            .order('nbr', { ascending: false });

        if (error) {
            console.error('Erreur lors du chargement des vols:', error);
            return;
        }

        if (data) {
            console.log('Données reçues de Supabase:', data);
            return data;
        }
    } else {
        // --- LECTURE LOCALE (Fallback) ---
        const response = await fetch(`${LOCAL_DATA_PATH}/${tableName}.json`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        console.log(`[Local] Données '${tableName}' chargées depuis ${LOCAL_DATA_PATH}/${tableName}.json :`, data);
        return data;
    }
}

// Function to get the next flight number based on the count of existing flights
async function getNextFlightNumber() {
    let count = 0;

    if (!isLocalFallback) {
        const { count: supCount, error } = await supabaseClient
                .from(supabaseTableFlightsName)
                .select('*', { count: 'exact', head: true });

        if (error) {
            console.error("Erreur lors de la récupération du compte :", error);
            return null;
        }
        count = supCount;
    } else {
        // Fallback local : calcul depuis flights.json
        const flights = await loadTableFromSupabase(supabaseTableFlightsName);
        count = flights.reduce((max, f) => Math.max(max, Number(f.nbr) || 0), 0);
    }
    console.log("Nombre total de vols (Supabase) :", count);
    return count + 1;
}

// Save the IGC file to Supabase Storage and the flight data to Supabase Database
async function saveTrackToSupabase(fileBlob, active_flight) {
    try {
        console.log("1. Upload du fichier vers le Storage...");
        
        const fileName = active_flight.file_name;

        // --- ÉTAPE 2 : Upload vers Supabase Storage ---
        const { data: storageData, error: storageError } = await supabaseClient
            .storage
            .from('tracks')
            .upload(fileName, fileBlob, {
                upsert: true // 'upsert: true' permet d'écraser si le fichier existe déjà
            });

        if (storageError) throw storageError;

        console.log("2. Upload réussi. Enregistrement en base de données...");

        active_flight.nbr = await getNextFlightNumber();
        
        active_flight.site = "None";
        active_flight.monitor = "None";
        let comments = active_flight.comment.split('\n');

        for(line in comments) {
            if (comments[line].search("site:") >= 0) {
                active_flight.site = comments[line].replace("site:", "").trim();
            }
            if (comments[line].search("monitor:") >= 0) {
                active_flight.monitor = comments[line].replace("monitor:", "").trim();
            }
        }
        comments = comments.join('\n');
        active_flight.analyse = comments.replace(/site:.*\n?/, '').replace(/monitor:.*\n?/, '').trim();
        delete active_flight.comment;

        // 2. Envoyer les données à Supabase 
        const { data, error } = await supabaseClient
            .from('flights')
            .insert([active_flight])
            .select(); // On demande à récupérer la ligne créée (avec son ID et son Nbr)

        if (error) {
            alert("Erreur lors de l'enregistrement : " + error.message);
            console.error("Détails de l'erreur :", error);
        } else {
            console.log("Vol enregistré avec succès !", data);
        }

    } catch (err) {
        console.error("Erreur lors de la sauvegarde :", err);
        alert("Erreur : " + err.message);
    }
}

// Function to manage authentification to Supabase Database
function supabaseAuth() {
    const modal = document.getElementById('login-modal');
    const authBtn = document.getElementById('auth-status-btn');

    // Détection localhost dans supabaseAuth()
    if (['localhost', '127.0.0.1'].includes(window.location.hostname)) {
        isLocalFallback = true;
    }

    authBtn.onclick = () => {
        // Permet de basculer manuellement en mode local si besoin
        if (isLocalFallback) {
            alert("Mode local actif (Supabase est hors-ligne ou en pause).");
            return;
        }
        supabaseClient.auth.getSession().then(({ data }) => {
            if (data.session) {
                supabaseClient.auth.signOut().then(() => location.reload());
            } else {
                modal.style.display = "block";
            }
        });
    };

    document.getElementById('close-modal').onclick = () => modal.style.display = "none";

    // Login process
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
            checkUserSession(); // Update UI after login
        }
    };

    // Check user session on page load to update UI accordingly
    async function checkUserSession() {
        const { data: { session } } = await supabaseClient.auth.getSession();
        
        // If connected, show admin elements. Otherwise, hide them.
        const adminElements = [
            document.getElementById('manual_entry_button'),
            document.getElementById('my-file-selector') 
        ];

        if (session) {
            authBtn.innerText = "🔓 Disconnect";
        } else {
            authBtn.innerText = "🔐 Login";
        }
    }

    // To be called on page load to set the correct UI state based on user session
    checkUserSession();

    return isLocalFallback;
}

// Custom element for the login modal
class SupabaseLogin extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <div id="login-modal">
                <div id="login-background">
                    <span id="close-modal">&times;</span>
                    <h3>Access</h3>
                    <input type="email" id="login-email" placeholder="Email">
                    <input type="password" id="login-password" placeholder="Mot de passe">
                    <button id="do-login">Connect</button>
                    <p id="login-error"></p>
                </div>
            </div>
        `;
    }
}
customElements.define('supabase-login', SupabaseLogin);
