// src/services/StagApiService.js

const DEFAULT_STAG_WS_BASE_URL = "https://stag-ws.zcu.cz/ws/services/rest2"; // Příklad, upravte dle potřeby
const DEFAULT_STAG_LOGIN_URL = "https://stag-ws.zcu.cz/ws/login";       // Příklad, upravte dle potřeby

class StagApiService {
    /**
     * @param {object} options
     * @param {string} [options.wsBaseUrl] - Základní URL pro STAG Web Services (REST API).
     * @param {string} [options.loginUrl] - URL pro přihlašovací stránku STAGu.
     * @param {string} [options.initialTicket] - Počáteční stagUserTicket, pokud je znám.
     * @param {object} [options.initialUserInfo] - Počáteční informace o uživateli (již dekódované).
     */
    constructor(options = {}) {
        this.wsBaseUrl = options.wsBaseUrl || DEFAULT_STAG_WS_BASE_URL;
        this.loginUrl = options.loginUrl || DEFAULT_STAG_LOGIN_URL;
        this.stagUserTicket = options.initialTicket || null;
        this.userInfo = options.initialUserInfo || { roles: [] }; // Struktura dle stagUserInfo
        this.selectedStagUserRole = null; // Vybraná role ('stagUser' identifikátor)
    }

    /**
     * Nastaví stagUserTicket pro použití v dalších API voláních.
     * @param {string} ticket - Uživatelský ticket.
     */
    setStagUserTicket(ticket) {
        this.stagUserTicket = (ticket === "anonymous") ? null : ticket; // Anonymní ticket neukládáme jako platný pro autorizaci
    }

    /**
     * Nastaví informace o uživateli a jeho rolích.
     * @param {string} base64UserInfo - Base64 kódovaný JSON string s informacemi o uživateli.
     */
    setUserInfoFromBase64(base64UserInfo) {
        if (!base64UserInfo) {
            this.userInfo = { roles: [] };
            this.selectedStagUserRole = null;
            return;
        }
        try {
            const jsonUserInfo = atob(base64UserInfo);
            this.userInfo = JSON.parse(jsonUserInfo);
            // Pokud existují role a žádná není vybrána, můžeme vybrat první jako výchozí
            if (this.userInfo.roles && this.userInfo.roles.length > 0 && !this.selectedStagUserRole) {
                this.selectedStagUserRole = this.userInfo.roles[0].stagUser;
            }
        } catch (error) {
            console.error("Chyba při parsování stagUserInfo:", error);
            this.userInfo = { roles: [] };
            this.selectedStagUserRole = null;
        }
    }

    /**
     * Vrátí aktuálně nastavený stagUserTicket.
     * @returns {string|null}
     */
    getStagUserTicket() {
        return this.stagUserTicket;
    }

    /**
     * Vrátí informace o aktuálně přihlášeném uživateli a jeho rolích.
     * @returns {object}
     */
    getUserInfo() {
        return this.userInfo;
    }

    /**
     * Nastaví vybranou roli STAG uživatele pro API volání.
     * @param {string} stagUser - Identifikátor role ('IS/STAG uživatelské jméno').
     */
    setSelectedStagUserRole(stagUser) {
        if (this.userInfo.roles.find(role => role.stagUser === stagUser)) {
            this.selectedStagUserRole = stagUser;
        } else {
            console.warn(`Role '${stagUser}' nenalezena pro tohoto uživatele.`);
        }
    }

    /**
     * Vrátí aktuálně vybranou roli STAG uživatele.
     * @returns {string|null}
     */
    getSelectedStagUserRole() {
        return this.selectedStagUserRole;
    }

    /**
     * Přesměruje uživatele na přihlašovací stránku STAGu.
     * Aplikace by měla tuto metodu zavolat a zajistit, že originalURL je správně nastavena
     * na adresu, kam se má STAG vrátit.
     * @param {string} originalURL - URL, na kterou se má uživatel vrátit po přihlášení.
     * @param {boolean} [useOnlyMainLogin=true] - Použít pouze hlavní přihlašovací metodu školy (např. Shibboleth). [cite: 61]
     * @param {boolean} [requestLongTicket=false] - Požadovat ticket s delší platností. [cite: 62]
     */
    redirectToLogin(originalURL, useOnlyMainLogin = true, requestLongTicket = false) {
        const encodedOriginalURL = encodeURIComponent(originalURL); // [cite: 63]
        let loginRedirectUrl = `${this.loginUrl}?originalURL=${encodedOriginalURL}`;
        if (useOnlyMainLogin) {
            loginRedirectUrl += "&onlyMainLoginMethod=1"; // $l=1 dle dokumentace [cite: 61]
        }
        if (requestLongTicket) {
            loginRedirectUrl += "&longTicket=1"; // $t=1 dle dokumentace [cite: 62]
        }
        window.location.href = loginRedirectUrl;
    }

    /**
     * Zpracuje parametry z URL po návratu z přihlašovací stránky STAGu.
     * Tuto metodu by měla zavolat aplikace po detekci parametrů v URL.
     * @param {URLSearchParams} queryParams - Objekt URLSearchParams z aktuální URL.
     * @returns {boolean} True, pokud byl ticket úspěšně zpracován.
     */
    handleLoginCallback(queryParams) {
        const ticket = queryParams.get('stagUserTicket');
        const userInfoBase64 = queryParams.get('stagUserInfo');

        if (ticket) {
            this.setStagUserTicket(ticket); // [cite: 63]
            if (userInfoBase64) {
                this.setUserInfoFromBase64(userInfoBase64); // [cite: 64]
            }
            return true;
        }
        return false;
    }

    /**
     * Interní metoda pro provádění HTTP GET/POST požadavků na STAG API.
     * @private
     * @param {string} endpoint - Cesta k API endpointu (např. "predmety/getPredmetInfo").
     * @param {object} params - Objekt s parametry pro API volání.
     * @param {string} [method='GET'] - HTTP metoda.
     * @param {boolean} [requiresAuth=true] - Zda endpoint vyžaduje autentizaci.
     * @returns {Promise<object>} Promise s JSON odpovědí.
     * @throws {Error} Pokud dojde k chybě sítě nebo API vrátí chybu.
     */
    async _doRequest(endpoint, params = {}, method = 'GET', requiresAuth = true) {
        const queryParams = new URLSearchParams(params);
        queryParams.set("outputFormat", "JSON"); // Vždy požadujeme JSON [cite: 91]

        // Přidání stagUser parametru, pokud je vyžadován a role je vybrána [cite: 70]
        // Některé endpointy vyžadují stagUser i pro GET (např. dle studijního plánu)
        if (this.selectedStagUserRole && (params.stagUser === undefined)) { // Pokud není explicitně v params
            // Zjistit, zda endpoint typicky vyžaduje stagUser (toto je zjednodušení,
            // ideálně by to mělo být specifikováno pro každý endpoint)
            const endpointsRequiringStagUser = [
                "predmety/getPredmetyByStudent",
                // další endpointy...
            ];
            if (endpointsRequiringStagUser.includes(endpoint.split('/')[0] + '/' + endpoint.split('/')[1]) || requiresAuth) { // zjednodušená kontrola
                queryParams.set("stagUser", this.selectedStagUserRole);
            }
        }


        const url = `${this.wsBaseUrl}/${endpoint}?${queryParams.toString()}`;
        const options = {
            method: method,
            headers: {},
        };

        if (requiresAuth) {
            if (!this.stagUserTicket) {
                // V reálné aplikaci by zde mohlo dojít k přesměrování na login
                // nebo k chybě, pokud se pokoušíme o autorizované volání bez ticketu.
                console.warn(`API volání na ${endpoint} vyžaduje autentizaci, ale není dostupný ticket.`);
                // Pro některé služby může anonymní volání vrátit méně dat nebo chybu. [cite: 53, 54]
                // Prozatím necháme požadavek projít, STAG API vrátí 401/403 pokud je třeba.
            } else {
                // HTTP Basic Authentication s ticketem [cite: 55, 57, 66]
                // Uživatelské jméno je ticket, heslo je prázdný řetězec.
                options.headers['Authorization'] = 'Basic ' + btoa(`${this.stagUserTicket}:`);
            }
        }

        try {
            const response = await fetch(url, options); // Protokol HTTPS je vyžadován [cite: 52]
            if (!response.ok) {
                // Zpracování chybových HTTP kódů [cite: 71]
                if (response.status === 401 || response.status === 403) {
                    console.error(`Chyba autorizace (${response.status}) pro ${url}. Ticket může být neplatný.`);
                    // Zde by aplikace mohla invalidovat ticket a vyzvat k novému přihlášení.
                    this.stagUserTicket = null; // Invalidace ticketu
                }
                throw new Error(`HTTP chyba ${response.status}: ${response.statusText} na ${url}`);
            }
            // Některé STAG endpointy mohou vracet prázdnou odpověď s kódem 200 nebo 204,
            // což způsobí chybu při JSON.parse(). Je třeba to ošetřit.
            const responseText = await response.text();
            if (!responseText) {
                return {}; // Nebo null, dle preferencí pro prázdnou odpověď
            }
            return JSON.parse(responseText);
        } catch (error) {
            console.error("Chyba API požadavku:", error);
            throw error; // Předat chybu dál pro zpracování v aplikaci
        }
    }

    // --- Veřejné metody pro volání konkrétních STAG API endpointů ---

    /**
     * Vrátí informace o aktuálním akademickém roce a semestru.
     * Endpoint: kalendar/getAktualniObdobiInfo [cite: 85]
     * @returns {Promise<object>}
     */
    async getCurrentSemesterInfo() {
        return this._doRequest("kalendar/getAktualniObdobiInfo", {}, 'GET', false);
    }

    /**
     * Vrátí seznam IS/STAG rolí pro uživatele identifikovaného ticketem.
     * Používá V2 verzi endpointu, pokud je dostupná, jinak V1.
     * Endpoint: help/getStagUserListForLoginTicket nebo help/getStagUserListForLoginTicketV2 [cite: 77]
     * @param {string} ticket - stagUserTicket.
     * @returns {Promise<Array<object>>} Pole objektů reprezentujících role.
     */
    async getStagUserListForLoginTicket(ticket = this.stagUserTicket) {
        if (!ticket) throw new Error("Ticket je vyžadován pro getStagUserListForLoginTicket.");
        try {
            // Preferujeme V2, pokud existuje
            return await this._doRequest("help/getStagUserListForLoginTicketV2", { ticket }, 'GET', false);
        } catch (error) {
            console.warn("getStagUserListForLoginTicketV2 selhal, zkouším V1:", error.message);
            // Fallback na V1
            const roles = await this._doRequest("help/getStagUserListForLoginTicket", { ticket }, 'GET', false);
            // V1 může vracet objekt s vlastností `role`, V2 přímo pole. Sjednotíme.
            return Array.isArray(roles) ? roles : (roles.role ? (Array.isArray(roles.role) ? roles.role : [roles.role]) : []);
        }
    }

    /**
     * Vrátí kompletní informace o jednom předmětu.
     * Endpoint: predmety/getPredmetInfo [cite: 82]
     * @param {string} departmentCode - Zkratka katedry.
     * @param {string} subjectShortCode - Zkratka předmětu.
     * @param {string} year - Akademický rok.
     * @param {string} [lang='cs'] - Jazyk.
     * @returns {Promise<object>}
     */
    async getSubjectInfo(departmentCode, subjectShortCode, year, lang = 'cs') {
        const params = {
            katedra: departmentCode,
            zkratka: subjectShortCode,
            rok: year,
            lang: lang,
        };
        return this._doRequest("predmety/getPredmetInfo", params, 'GET', false); // Předpokládáme, že info o předmětu je veřejné
    }

    /**
     * Vrátí seznam rozvrhových akcí podle zadaných kritérií.
     * Endpoint: rozvrhy/getRozvrhoveAkce [cite: 83, 84]
     * Vyžaduje rok, semestr a alespoň jedno další kritérium.
     * @param {object} criteria
     * @param {string} criteria.rok - Akademický rok (povinné).
     * @param {string} criteria.semestr - Semestr (ZS/LS) (povinné).
     * @param {string} [criteria.zkrPredm] - Zkratka předmětu (např. PPA1).
     * @param {string} [criteria.pracoviste] - Zkratka pracoviště (katedry).
     * @param {string} [criteria.ucitIdno] - Osobní číslo učitele.
     * // ... další parametry dle dokumentace [cite: 84]
     * @param {string} [lang='cs'] - Jazyk.
     * @returns {Promise<Array<object>>} Pole objektů rozvrhových akcí.
     */
    async getScheduleEvents(criteria, lang = 'cs') {
        if (!criteria.rok || !criteria.semestr) {
            throw new Error("Rok a semestr jsou povinné pro getRozvrhoveAkce.");
        }
        const params = { ...criteria, lang: lang };
        // Tento endpoint může vyžadovat autentizaci pro některé detaily nebo v závislosti na konfiguraci STAGu
        const response = await this._doRequest("rozvrhy/getRozvrhoveAkce", params, 'GET', true); // Předpokládáme auth pro jistotu
        return Array.isArray(response.rozvrhovaAkce) ? response.rozvrhovaAkce : (response.rozvrhovaAkce ? [response.rozvrhovaAkce] : []);
    }

    /**
     * Vyhledá předměty podle kritérií.
     * Endpoint: predmety/najdiPredmety [cite: 79, 80]
     * @param {object} criteria
     * @param {string} criteria.rok - Akademický rok.
     * @param {string} [criteria.nazev] - Část názvu předmětu.
     * @param {string} [criteria.pracoviste] - Zkratka pracoviště (katedry).
     * @param {string} [criteria.zkratka] - Zkratka předmětu.
     * @param {string} [lang='cs'] - Jazyk.
     * @returns {Promise<Array<object>>} Pole nalezených předmětů.
     */
    async findSubjects(criteria, lang = 'cs') {
        if (!criteria.rok) {
            throw new Error("Rok je povinný parametr pro findSubjects.");
        }
        const params = { ...criteria, lang: lang };
        const response = await this._doRequest("predmety/najdiPredmety", params, 'GET', false);
        return Array.isArray(response.predmet) ? response.predmet : (response.predmet ? [response.predmet] : []);
    }

    /**
     * Vrátí seznam předmětů studenta zapsaných v IS/STAG.
     * Endpoint: predmety/getPredmetyByStudent [cite: 81]
     * Vyžaduje autentizaci a nastavenou roli studenta (this.selectedStagUserRole).
     * @param {string} year - Akademický rok.
     * @param {string} semester - Semestr (ZS/LS).
     * @param {boolean} [nevracetUznane=true] - Nezahrnovat uznané předměty.
     * @param {string} [lang='cs'] - Jazyk.
     * @returns {Promise<Array<object>>}
     */
    async getStudentEnrolledSubjects(year, semester, nevracetUznane = true, lang = 'cs') {
        if (!this.selectedStagUserRole) {
            throw new Error("Pro getStudentEnrolledSubjects musí být vybrána role studenta (stagUser).");
        }
        const params = {
            osCislo: this.selectedStagUserRole, // Předpoklad, že stagUser je osCislo pro studenta
            rok: year,
            semestr: semester,
            nevracetUznane: nevracetUznane ? 'A' : 'N', // STAG API očekává A/N
            lang: lang,
        };
        // stagUser parametr je zde explicitně osCislo, ale _doRequest by ho také přidal
        // pokud by byl obecně nastaven this.selectedStagUserRole.
        // Pro jistotu ho zde předáme jako osCislo.
        const response = await this._doRequest("predmety/getPredmetyByStudent", params, 'GET', true);
        return Array.isArray(response.predmetStudenta) ? response.predmetStudenta : (response.predmetStudenta ? [response.predmetStudenta] : []);
    }

    // TODO: Implementovat další metody dle potřeby:
    // - getPredmetyByKatedra [cite: 80]
    // - getHarmonogramRoku [cite: 86]
    // - getCiselnik, getSeznamDomen [cite: 87]
    // - getStudentInfo, getOsobniCislaByExternalLogin
}

export default StagApiService;