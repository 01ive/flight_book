// Supabase configuration
const supabaseUrl = 'https://ggoscybduasqnhilwdtq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdnb3NjeWJkdWFzcW5oaWx3ZHRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MDg4OTQsImV4cCI6MjA5MjE4NDg5NH0.sp9pZE9JELgIQExreEoIewu1Zh6VWKxYdt4s87UblR8'; // Utilise ta clé complète ici
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
const supabaseStorageTracksName = 'tracks';
const supabaseTableFlightsName = 'flights';
const supabaseTableGroundName = 'ground';
const supabaseTableStatsName = 'stats';

// Function to get the public URL of an IGC file stored in Supabase
function getIGCFileUrl(fileName) {
    const { data: storageData, error } = supabaseClient
        .storage
        .from(supabaseStorageTracksName)
        .getPublicUrl(fileName);

    if (error) {
        console.error('Erreur lors de la récupération de l\'URL du fichier:', error);
        return null;
    }

    return storageData.publicUrl;
}

// Function to load flights from Supabase
async function loadTableFromSupabase(tableName) {
    const { data, error } = await supabaseClient
        .from(tableName)
        .select('*')
        .order('date', { ascending: false }); // Optional: sort by date, newest first

    if (error) {
        console.error('Erreur lors du chargement des vols:', error);
        return;
    }

    if (data) {
        console.log('Données reçues de Supabase:', data);
        return data;
    }
}

// Function to get the next flight number based on the count of existing flights in Supabase
async function getNextFlightNumber() {
    const { count, error } = await supabaseClient
        .from('flights')
        .select('*', { count: 'exact', head: true });

    if (error) {
        console.error("Erreur lors de la récupération du compte :", error);
        return null;
    }

    console.log("Nombre total de vols :", count);
    
    // Pour ton prochain vol, le numéro sera :
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
