
// Tabs component for the navigation bar. It highlights the active tab and includes buttons for file upload, manual entry, and saving data.
class Tabs extends HTMLElement {
    connectedCallback() {
        const activeTab = this.getAttribute('active');

        const text_head = `
            <div class="tabs">
                <a href="index.html" class="tab ${activeTab === 'flight' ? 'active' : ''}">🪂 Flight</a>
                <a href="ground.html" class="tab ${activeTab === 'ground' ? 'active' : ''}">💨 Ground Handling</a>
                <a href="flight.html" class="tab ${activeTab === 'track' ? 'active' : ''}">🗺️ Track Analyser</a>
                <a href="stats.html" class="tab ${activeTab === 'stats' ? 'active' : ''}">📉 Stats</a>
                <div class="right_button">
        `;
        const text_end = `
                    <button id="auth-status-btn">🔐 Login</button>
                </div>
            </div>
            `;

        const flightTabBtn = `
                    <button>
                        <label id="my-file-selector" for="file-selector">📎 Add track</label>
                        <input type="file" id="file-selector" accept=".igc, .gpx" placeholder="Select a file">
                    </button>

                    <button id="view_selected_button">👁️ View flights</button>
        `;

        const manualAndSaveButtons = `
                    <button id="manual_entry_button" type="submit">➕ Manual entry</button>
                    <button id="save_button_json">💾 Save to file</button>
        `;

        let rightButtons = text_head;
        if (activeTab === 'flight') {
            rightButtons += flightTabBtn;
        }
        if ((activeTab === 'ground') || (activeTab === 'stats') || (activeTab === 'flight')) {
            rightButtons += manualAndSaveButtons;
        }
        rightButtons += text_end;
        
        this.innerHTML = rightButtons;
    }
}
customElements.define('app-tabs', Tabs);