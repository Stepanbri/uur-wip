// src/services/CourseClass.js
import CourseEventClass from './CourseEventClass'; // Pro generování dummy dat

/**
 * Reprezentuje předmět (Course).
 * Každý předmět má vlastní ID v STAG systému (stagId).
 * Prop `maxEnrollments` přejmenována na `neededEnrollments`.
 */
class CourseClass {
    constructor({
                    id, // Unikátní lokální identifikátor předmětu
                    stagId = null, // ID předmětu ze STAG API
                    name, // Název předmětu [cite: 134]
                    departmentCode, // Zkratka katedry (pracoviště) [cite: 13, 134]
                    courseCode, // Zkratka předmětu (např. MA2) [cite: 13, 134]
                    credits, // Kreditové ohodnocení [cite: 14, 135]
                    neededEnrollments = {}, // Potřebný počet zapsaných akcí daného typu, např. { lecture: 1, practical: 2 }
                    events = [], // Pole instancí CourseEventClass [cite: 15, 137]
                    semester = '', // Semestr (LS, ZS) [cite: 137]
                    year = '', // Akademický rok, ke kterému se předmět vztahuje
                    // selected = false // Indikuje, zda je předmět vybrán uživatelem - toto může být spíše stav v UI/Workspace
                }) {
        this.id = id || crypto.randomUUID();
        this.stagId = stagId;
        this.name = name;
        this.departmentCode = departmentCode;
        this.courseCode = courseCode;
        this.credits = credits;
        this.neededEnrollments = neededEnrollments;
        this.events = events.map(eventData => eventData instanceof CourseEventClass ? eventData : new CourseEventClass({...eventData, courseId: this.id, courseCode: this.getShortCode(), departmentCode: this.departmentCode }));
        this.semester = semester;
        this.year = year;
    }

    getShortCode() {
        return `${this.departmentCode}/${this.courseCode}`; // Např. KMA/MA2 [cite: 14]
    }

    /**
     * Přidá jednu rozvrhovou akci k předmětu.
     * @param {object|CourseEventClass} eventData - Data pro vytvoření nové akce nebo instance CourseEventClass.
     */
    addCourseEvent(eventData) { // Přejmenováno z addRozvrhovouAkci
        const newEvent = eventData instanceof CourseEventClass
            ? eventData
            : new CourseEventClass({
                ...eventData,
                courseId: this.id,
                courseCode: this.getShortCode(),
                departmentCode: this.departmentCode,
                year: this.year,
                semester: this.semester
            });

        if (!this.events.find(e => e.id === newEvent.id)) {
            this.events.push(newEvent);
        }
    }

    /**
     * Přidá více rozvrhových akcí k předmětu.
     * @param {Array<object|CourseEventClass>} eventsData - Pole dat pro vytvoření nových akcí.
     */
    addCourseEvents(eventsData) { // Přejmenováno z addRozvrhovéAkce
        eventsData.forEach(eventData => this.addCourseEvent(eventData));
    }

    /**
     * Vrací rozvrhové akce tohoto předmětu s možností filtrování.
     * @param {object} filters - Objekt s filtry.
     * @param {string} [filters.instructor] - Jméno vyučujícího.
     * @param {string} [filters.semester] - Semestr (LS, ZS).
     * @param {string} [filters.academicYear] - Akademický rok.
     * @param {boolean} [filters.hasCapacity] - True, pokud má volnou kapacitu.
     * @param {string} [filters.room] - Místnost.
     * @param {string} [filters.type] - Typ akce (PŘEDNÁŠKA, CVIČENÍ,...).
     * // Zapsané/Nezapsané se bude řešit spíše ve WorkspaceService ve vztahu k ScheduleClass
     * @returns {CourseEventClass[]}
     */
    getCourseEvents(filters = {}) { // Přejmenováno z getRozvrhovéAkce
        let filteredEvents = this.events;

        if (filters.instructor) {
            filteredEvents = filteredEvents.filter(event => event.instructor === filters.instructor || (typeof event.instructor === 'object' && event.instructor.name === filters.instructor));
        }
        if (filters.semester) {
            filteredEvents = filteredEvents.filter(event => event.semester === filters.semester);
        }
        if (filters.academicYear) {
            filteredEvents = filteredEvents.filter(event => event.year === filters.academicYear);
        }
        if (filters.hasCapacity === true) {
            filteredEvents = filteredEvents.filter(event => event.currentCapacity < event.maxCapacity);
        }
        if (filters.hasCapacity === false) {
            filteredEvents = filteredEvents.filter(event => event.currentCapacity >= event.maxCapacity);
        }
        if (filters.room) {
            filteredEvents = filteredEvents.filter(event => event.room === filters.room);
        }
        if (filters.type) {
            filteredEvents = filteredEvents.filter(event => event.type === filters.type);
        }
        return filteredEvents;
    }

    /**
     * Kontroluje, zda poskytnutý seznam zapsaných akcí splňuje požadavky `neededEnrollments`.
     * @param {CourseEventClass[]} enrolledEventsForThisCourse - Pole zapsaných akcí *pro tento konkrétní předmět*.
     * @returns {boolean} True, pokud jsou podmínky splněny.
     */
    areConditionsMet(enrolledEventsForThisCourse = []) { //
        if (Object.keys(this.neededEnrollments).length === 0) {
            return true; // Pokud nejsou definovány žádné požadavky, považujeme za splněné.
        }

        const counts = {};
        Object.keys(this.neededEnrollments).forEach(type => counts[type] = 0);

        enrolledEventsForThisCourse.forEach(event => {
            if (counts[event.type] !== undefined) {
                counts[event.type]++;
            }
        });

        for (const type in this.neededEnrollments) {
            if (counts[type] !== this.neededEnrollments[type]) {
                return false; // Pokud počet zapsaných akcí daného typu neodpovídá potřebnému počtu.
            }
        }
        return true;
    }

    /**
     * Generuje dummy rozvrhové akce pro tento předmět pro testovací účely.
     * @param {number} count - Počet akcí k vygenerování pro každý typ (P, CV, SE).
     */
    generateDummyCourseEvents(count = 2) { // Přejmenováno z generateRozvrhovéAkce
        const types = ['PŘEDNÁŠKA', 'CVIČENÍ', 'SEMINÁŘ'];
        const days = [0, 1, 2, 3, 4]; // Po-Pá
        const startTimes = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00'];
        const instructors = ['Dr. Novák', 'Ing. Svoboda', 'Doc. Procházka'];
        const rooms = ['UC101', 'UC102', 'UP105', 'UI30'];

        this.events = []; // Vymažeme existující pro dummy data

        types.forEach(type => {
            for (let i = 0; i < count; i++) {
                const day = days[Math.floor(Math.random() * days.length)];
                const startTimeIndex = Math.floor(Math.random() * startTimes.length);
                const startTime = startTimes[startTimeIndex];
                const hour = parseInt(startTime.split(':')[0]);
                const endTime = `${String(hour + 1 + Math.floor(Math.random() * 2)).padStart(2, '0')}:00`; // 1-2h délka

                this.addCourseEvent(new CourseEventClass({
                    stagId: `dummyStagEv${this.courseCode}${type.substring(0,1)}${i}`,
                    startTime,
                    endTime,
                    day,
                    recurrence: 'KAŽDÝ TÝDEN',
                    courseId: this.id,
                    courseCode: this.getShortCode(),
                    departmentCode: this.departmentCode,
                    room: rooms[Math.floor(Math.random() * rooms.length)],
                    type: type,
                    instructor: instructors[Math.floor(Math.random() * instructors.length)],
                    currentCapacity: Math.floor(Math.random() * 20),
                    maxCapacity: 20 + Math.floor(Math.random() * 30),
                    year: this.year || '2023/2024',
                    semester: this.semester || 'ZS',
                    note: `Dummy ${type} ${i+1}`
                }));
            }
        });
    }
}

export default CourseClass;