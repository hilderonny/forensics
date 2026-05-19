export default {
    props: {
        selectedTab: String,
    },
    template: `
        <div class="app-toolbar">
            <div class="app-title">Einstellungen</div>

            <button class="tab-button" onclick="location.href='datenbank.html'" :class="{selected: selectedTab === 'Datenbank'}">Datenbank</button>
            <button class="tab-button" onclick="location.href='dienststellen.html'" :class="{selected: selectedTab === 'Dienststellen'}">Dienststellen</button>
            <button class="tab-button" onclick="location.href='persoenlicheEinstellungen.html'" :class="{selected: selectedTab === 'Persönliche Einstellungen'}">Persönliche Einstellungen</button>
            <button class="tab-button" onclick="location.href='vorgangstypen.html'" :class="{selected: selectedTab === 'Vorgangstypen'}">Vorgangstypen</button>

        </div>
    `,
}
