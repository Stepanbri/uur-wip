// src/services/CourseEventClass.js

/**
 * Reprezentuje rozvrhovou akci (Course Event).
 * Základní atributy dle dokumentace[cite: 19].
 * Každá rozvrhová akce má vlastní ID v STAG systému (stagId).
 */
class CourseEventClass {
    constructor({
                    id, // Unikátní lokální identifikátor akce (může být generován v aplikaci)
                    stagId = null, // ID akce ze STAG API
                    startTime, // "10:00" [cite: 19]
                    endTime, // "11:30" [cite: 19]
                    day, // 0 pro pondělí, ..., 6 pro neděli [cite: 20]
                    recurrence, // "KAŽDÝ TÝDEN", "SUDÝ TÝDEN", "LICHÝ TÝDEN" [cite: 19]
                    validityStart = null, // Datum začátku platnosti [cite: 19]
                    validityEnd = null, // Datum konce platnosti [cite: 19]
                    courseId, // ID předmětu, ke kterému akce patří (lokální nebo stagId předmětu)
                    courseCode, // Např. KIV/PPA1 pro rychlou referenci
                    room = '', // Místnost [cite: 19]
                    type, // "PŘEDNÁŠKA", "CVIČENÍ", "SEMINÁŘ", "ZKOUŠKA", "ZÁPOČET" [cite: 19, 20]
                    instructor = '', // Jméno vyučujícího (může být objekt InstructorClass) [cite: 19]
                    currentCapacity = 0, // Aktuální počet zapsaných [cite: 19]
                    maxCapacity = 0, // Maximální kapacita [cite: 19]
                    note = '', // Doplňující poznámka [cite: 19]
                    isVirtual = false, // true, pokud je virtuální (pozná se např. absencí místnosti) [cite: 25, 28]
                    year = '', // Akademický rok [cite: 19]
                    semester = '', // Semestr (LS, ZS) [cite: 19]
                    groupId = null, // ID rozvrhové skupiny (propojené akce) [cite: 29, 32]
                    departmentCode = '' // Zkratka katedry [cite: 13]
                }) {
        this.id = id || crypto.randomUUID(); // Generování unikátního ID, pokud není dodáno
        this.stagId = stagId;
        this.startTime = startTime;
        this.endTime = endTime;
        this.day = day;
        this.recurrence = recurrence;
        this.validityStart = validityStart;
        this.validityEnd = validityEnd;
        this.courseId = courseId;
        this.courseCode = courseCode;
        this.room = room;
        this.type = type;
        this.instructor = instructor; // Může být string nebo instance InstructorClass
        this.currentCapacity = currentCapacity;
        this.maxCapacity = maxCapacity;
        this.note = note;
        this.isVirtual = isVirtual || !room;
        this.year = year;
        this.semester = semester;
        this.groupId = groupId;
        this.departmentCode = departmentCode; // Přidáno pro snazší práci s daty v Workspace
    }

    /**
     * Převede číselný den na textový řetězec (vyžaduje i18n funkci).
     * @param {function} tFunction - Funkce t() z useTranslation().
     * @returns {string} Název dne.
     */
    getDayAsString(tFunction) {
        // Implementace dle dokumentu [cite: 20]
        const days = [
            tFunction('courseEvent.monday', 'Pondělí'),
            tFunction('courseEvent.tuesday', 'Úterý'),
            tFunction('courseEvent.wednesday', 'Středa'),
            tFunction('courseEvent.thursday', 'Čtvrtek'),
            tFunction('courseEvent.friday', 'Pátek'),
            tFunction('courseEvent.saturday', 'Sobota'),
            tFunction('courseEvent.sunday', 'Neděle')
        ];
        return days[this.day] || '';
    }

    // Další metody specifické pro CourseEventClass mohou být přidány zde
    // Například: getDurationInMinutes(), conflictsWith(otherEvent), atd.
}

export default CourseEventClass;