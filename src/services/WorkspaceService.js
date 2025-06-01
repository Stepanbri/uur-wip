// src/services/WorkspaceService.js
import CourseClass from './CourseClass';
import ScheduleClass from './ScheduleClass';
import CourseEventClass from './CourseEventClass';

const MAX_GENERATED_SCHEDULES = 10; // Maximální počet generovaných rozvrhů

class WorkspaceService {
    constructor() {
        this.semester = '';
        this.year = '';
        this.courses = []; // Všechny načtené předměty (instance CourseClass)
        this.preferences = {}; // Uživatelské preference pro generování

        this.primarySchedule = new ScheduleClass(); // Primární, ručně upravovaný rozvrh
        this.generatedSchedules = []; // Pole vygenerovaných alternativ (ScheduleClass instance)
        this.activeScheduleIndex = -1; // -1 znamená, že aktivní je primarySchedule, jinak index v generatedSchedules
    }

    /**
     * Vrátí aktuálně aktivní rozvrh (buď primární, nebo jeden z vygenerovaných).
     * @returns {ScheduleClass}
     */
    getActiveSchedule() {
        if (this.activeScheduleIndex >= 0 && this.activeScheduleIndex < this.generatedSchedules.length) {
            return this.generatedSchedules[this.activeScheduleIndex];
        }
        return this.primarySchedule;
    }

    /**
     * Nastaví aktivní rozvrh.
     * @param {number} index - Index v poli generatedSchedules, nebo -1 pro primární rozvrh.
     */
    setActiveScheduleIndex(index) {
        if (index >= -1 && index < this.generatedSchedules.length) {
            this.activeScheduleIndex = index;
        } else {
            console.error("Neplatný index pro aktivní rozvrh:", index);
            this.activeScheduleIndex = -1; // Fallback na primární
        }
    }

    addCourse(courseData) {
        const existingCourse = this.courses.find(c =>
            (courseData.stagId && c.stagId === courseData.stagId) ||
            (c.departmentCode === courseData.departmentCode && c.courseCode === courseData.courseCode && c.year === courseData.year && c.semester === courseData.semester)
        );
        if (existingCourse) {
            console.warn("Předmět již existuje ve workspace:", existingCourse.getShortCode());
            // Možná aktualizace existujícího kurzu, např. událostí
            if (courseData.events && courseData.events.length > 0) {
                existingCourse.events = []; // Vyčistit staré, pokud přicházejí nové
                courseData.events.forEach(eventData => {
                    existingCourse.addCourseEvent(new CourseEventClass({
                        ...eventData,
                        courseId: existingCourse.id,
                        courseCode: existingCourse.getShortCode(),
                        departmentCode: existingCourse.departmentCode,
                        year: existingCourse.year,
                        semester: existingCourse.semester
                    }));
                });
            }
            return existingCourse;
        }

        const course = courseData instanceof CourseClass ? courseData : new CourseClass(courseData);
        this.courses.push(course);
        return course;
    }

    removeCourse(courseIdentifier) {
        const courseToRemove = this.courses.find(c => c.id === courseIdentifier || c.stagId === courseIdentifier);
        if (courseToRemove) {
            const eventsToRemoveFromSchedule = courseToRemove.getCourseEvents().map(e => e.id);

            // Odebrání z primárního rozvrhu
            eventsToRemoveFromSchedule.forEach(eventId => this.primarySchedule.removeEventById(eventId));

            // Odebrání z generovaných rozvrhů
            this.generatedSchedules.forEach(schedule => {
                eventsToRemoveFromSchedule.forEach(eventId => schedule.removeEventById(eventId));
            });

            this.courses = this.courses.filter(c => c.id !== courseIdentifier && c.stagId !== courseIdentifier);
        }
    }

    getAllInstructors() {
        const instructors = new Set();
        this.courses.forEach(course => {
            course.events.forEach(event => {
                if (event.instructor) {
                    instructors.add(typeof event.instructor === 'string' ? event.instructor : event.instructor.name);
                }
            });
        });
        return Array.from(instructors).sort();
    }

    getAllCourseEvents() {
        return this.courses.reduce((acc, course) => acc.concat(course.events), []);
    }

    getAllCourses() {
        return [...this.courses];
    }

    getAllRooms() {
        const rooms = new Set();
        this.courses.forEach(course => {
            course.events.forEach(event => {
                if (event.room) rooms.add(event.room);
            });
        });
        return Array.from(rooms).sort();
    }

    getAllDepartments() {
        const departments = new Set(this.courses.map(course => course.departmentCode));
        return Array.from(departments).sort();
    }

    saveWorkspace() {
        try {
            const workspaceData = {
                semester: this.semester,
                year: this.year,
                courses: this.courses.map(course => ({ // Ukládáme jako plain objekty
                    id: course.id,
                    stagId: course.stagId,
                    name: course.name,
                    departmentCode: course.departmentCode,
                    courseCode: course.courseCode,
                    credits: course.credits,
                    neededEnrollments: course.neededEnrollments,
                    events: course.events.map(event => ({ ...event, instructor: typeof event.instructor === 'object' ? event.instructor.name : event.instructor })), // Serializace instruktora pokud je objekt
                    semester: course.semester,
                    year: course.year,
                })),
                primaryScheduleEvents: this.primarySchedule.getAllEnrolledEvents().map(event => ({ ...event, instructor: typeof event.instructor === 'object' ? event.instructor.name : event.instructor })),
                generatedSchedules: this.generatedSchedules.map(schedule => ({
                    enrolledEvents: schedule.getAllEnrolledEvents().map(event => ({ ...event, instructor: typeof event.instructor === 'object' ? event.instructor.name : event.instructor }))
                })),
                activeScheduleIndex: this.activeScheduleIndex,
                preferences: this.preferences,
            };
            localStorage.setItem('schedulePlannerWorkspace', JSON.stringify(workspaceData));
        } catch (error) {
            console.error("Failed to save workspace:", error);
        }
    }

    loadWorkspace() {
        try {
            const savedData = localStorage.getItem('schedulePlannerWorkspace');
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                this.semester = parsedData.semester || '';
                this.year = parsedData.year || '';
                this.preferences = parsedData.preferences || {};
                this.activeScheduleIndex = parsedData.activeScheduleIndex !== undefined ? parsedData.activeScheduleIndex : -1;

                this.courses = (parsedData.courses || []).map(courseData => {
                    const events = (courseData.events || []).map(eventData => new CourseEventClass(eventData));
                    return new CourseClass({ ...courseData, events });
                });

                this.primarySchedule = new ScheduleClass();
                const primaryScheduleEvents = (parsedData.primaryScheduleEvents || []).map(eventData => new CourseEventClass(eventData));
                this.primarySchedule.addEvents(primaryScheduleEvents);

                this.generatedSchedules = (parsedData.generatedSchedules || []).map(scheduleData => {
                    const schedule = new ScheduleClass();
                    const events = (scheduleData.enrolledEvents || []).map(eventData => new CourseEventClass(eventData));
                    schedule.addEvents(events);
                    return schedule;
                });
                return true;
            }
        } catch (error) {
            console.error("Failed to load workspace:", error);
            this.clearWorkspace(false);
        }
        return false;
    }

    clearWorkspace(removeFromStorage = true) {
        this.semester = '';
        this.year = '';
        this.courses = [];
        this.primarySchedule.clear();
        this.generatedSchedules = [];
        this.activeScheduleIndex = -1;
        this.preferences = {};
        if (removeFromStorage) {
            localStorage.removeItem('schedulePlannerWorkspace');
        }
    }

    // --- Schedule Generation Logic ---

    /**
     * Kontroluje časový konflikt mezi dvěma událostmi.
     * Zjednodušená verze: prozatím ignoruje `recurrence` (SUDÝ/LICHÝ týden) pro přímý konflikt,
     * ale událost KAŽDÝ TÝDEN bude kolidovat s čímkoliv ve stejný čas.
     * @param {CourseEventClass} event1
     * @param {CourseEventClass} event2
     * @returns {boolean} True, pokud existuje konflikt.
     */
    _eventsConflict(event1, event2) {
        if (event1.day !== event2.day) {
            return false; // Různé dny, žádný konflikt
        }

        // Jednoduchá kontrola překrytí časů
        const start1 = parseInt(event1.startTime.replace(':', ''), 10);
        const end1 = parseInt(event1.endTime.replace(':', ''), 10);
        const start2 = parseInt(event2.startTime.replace(':', ''), 10);
        const end2 = parseInt(event2.endTime.replace(':', ''), 10);

        if (start1 < end2 && start2 < end1) {
            // Pokud jsou časy v konfliktu, zkontrolujme opakování
            if (event1.recurrence === 'KAŽDÝ TÝDEN' || event2.recurrence === 'KAŽDÝ TÝDEN') {
                return true; // Konflikt, pokud jedna z akcí je každý týden
            }
            if (event1.recurrence === event2.recurrence) {
                return true; // Konflikt, pokud jsou obě sudé nebo obě liché
            }
            // Pokud jedna je sudá a druhá lichá, není přímý konflikt v tomto zjednodušení
            return false;
        }
        return false;
    }


    /**
     * Hlavní metoda pro generování rozvrhu. [cite: 162, 176]
     * @param {CourseClass[]} coursesToSchedule - Pole předmětů, které se mají zapsat.
     * @returns {boolean} True, pokud byly nějaké rozvrhy vygenerovány.
     */
    generateSchedule(coursesToSchedule = this.courses) {
        this.generatedSchedules = [];
        this.activeScheduleIndex = -1;
        const solutions = [];

        // Seřadit preference dle priority (číslo, nižší je vyšší priorita)
        const sortedPreferences = Object.entries(this.preferences)
            .sort(([keyA], [keyB]) => parseInt(keyA) - parseInt(keyB))
            .map(([, value]) => value)
            .filter(pref => !pref.skip); // [cite: 186]

        // Helper pro kontrolu "volného dne" dle preference
        const isDayFreePreferred = (dayIndex) => {
            const freeDayPref = sortedPreferences.find(p => p.type === 0 && p.day === dayIndex); // [cite: 188]
            return !!freeDayPref;
        };
        // Další preference (free time block, prefer instructor) by se kontrolovaly podobně [cite: 190, 192]

        // Backtracking funkce
        const findSchedulesRecursive = (courseIdx, currentScheduleInProgress) => {
            if (solutions.length >= MAX_GENERATED_SCHEDULES) {
                return; // Dosáhli jsme maxima
            }

            // Základní případ: všechny předměty jsou zařazeny
            if (courseIdx === coursesToSchedule.length) {
                // Ověření, zda všechny předměty v `currentScheduleInProgress` splňují `neededEnrollments`
                // Toto by mělo být zajištěno již logikou výběru, ale pro jistotu.
                let allCoursesConditionsMet = true;
                for (const course of coursesToSchedule) {
                    const enrolledForThisCourse = currentScheduleInProgress.getAllEnrolledEvents().filter(ev => ev.courseId === course.id);
                    if (!course.areConditionsMet(enrolledForThisCourse)) {
                        allCoursesConditionsMet = false;
                        break;
                    }
                }

                if (allCoursesConditionsMet) {
                    const finalSchedule = new ScheduleClass();
                    finalSchedule.addEvents(currentScheduleInProgress.getAllEnrolledEvents());
                    solutions.push(finalSchedule);
                }
                return;
            }

            const course = coursesToSchedule[courseIdx];
            const needed = course.neededEnrollments; // např. { lecture: 1, practical: 2 }
            const availableEventsByType = {}; // { lecture: [event1, event2], practical: [eventA, eventB, eventC] }

            Object.keys(needed).forEach(type => {
                availableEventsByType[type] = course.getCourseEvents({ type: type.toUpperCase() }) // Předpokládáme, že typ v neededEnrollments je malými písmeny
                    .filter(event => !isDayFreePreferred(event.day)); // Základní zohlednění preference volného dne
                // Zde by se mohly přidat další filtry dle preferencí
            });

            // Tato část je komplexní: potřebujeme najít kombinace akcí, které splní `needed` pro každý typ
            // a zároveň nekolidují. Zde použiji zjednodušený přístup.
            // Plnohodnotné řešení by vyžadovalo rekurzivní generátor kombinací.

            const generateCombinations = (typeIndex, tempCourseEvents) => {
                const eventTypes = Object.keys(needed); // ['lecture', 'practical']
                if (typeIndex === eventTypes.length) {
                    // Máme jednu kompletní sadu akcí pro aktuální předmět
                    // Zkontrolujeme, zda tyto nové akce nekolidují s již přidanými v currentScheduleInProgress
                    let newEventsConflict = false;
                    for (const newEvent of tempCourseEvents) {
                        for (const existingEvent of currentScheduleInProgress.getAllEnrolledEvents()) {
                            if (this._eventsConflict(newEvent, existingEvent)) {
                                newEventsConflict = true;
                                break;
                            }
                        }
                        if (newEventsConflict) break;
                    }

                    if (!newEventsConflict) {
                        tempCourseEvents.forEach(event => currentScheduleInProgress.addEvent(event));
                        findSchedulesRecursive(courseIdx + 1, currentScheduleInProgress);
                        tempCourseEvents.forEach(event => currentScheduleInProgress.removeEventById(event.id)); // Backtrack
                    }
                    return;
                }

                const currentType = eventTypes[typeIndex]; // např. 'lecture'
                const numNeeded = needed[currentType]; // např. 1
                const possibleEventsForType = availableEventsByType[currentType]; // [event1, event2]

                if (possibleEventsForType.length < numNeeded) return; // Nedostatek akcí daného typu

                // Zde by měl být generátor kombinací `k` prvků z `n` (numNeeded z possibleEventsForType.length)
                // Pro jednoduchost, pokud numNeeded=1, vezmeme každou akci zvlášť
                // Pokud numNeeded=2, vezmeme všechny dvojice atd.
                // Toto je výrazné zjednodušení!
                if (numNeeded > 0 && possibleEventsForType.length > 0) {
                    // Příklad pro numNeeded = 1:
                    if (numNeeded === 1) {
                        for (const event of possibleEventsForType) {
                            generateCombinations(typeIndex + 1, [...tempCourseEvents, event]);
                            if (solutions.length >= MAX_GENERATED_SCHEDULES) return;
                        }
                    } else {
                        // Pro numNeeded > 1 je potřeba implementovat generátor kombinací bez opakování
                        // např. pomocí algoritmu jako `itertools.combinations` v Pythonu.
                        // Příklad pro numNeeded = 2 (velmi zjednodušené, bere jen první dvě, pokud existují):
                        if (numNeeded === 2 && possibleEventsForType.length >= 2) {
                            // Toto je jen ilustrace, potřebuje plnohodnotný generátor kombinací
                            for (let i = 0; i < possibleEventsForType.length; i++) {
                                for (let j = i + 1; j < possibleEventsForType.length; j++) {
                                    const combination = [possibleEventsForType[i], possibleEventsForType[j]];
                                    // Ověření, zda kombinované akce nekolidují mezi sebou (pokud je to možné v rámci jednoho předmětu)
                                    let internalConflict = false;
                                    if (combination.length > 1 && this._eventsConflict(combination[0], combination[1])) {
                                        internalConflict = true;
                                    }
                                    if (!internalConflict) {
                                        generateCombinations(typeIndex + 1, [...tempCourseEvents, ...combination]);
                                    }
                                    if (solutions.length >= MAX_GENERATED_SCHEDULES) return;
                                }
                            }
                        } else {
                            console.warn(`Generování pro ${numNeeded} akcí typu ${currentType} není plně implementováno pro ${course.getShortCode()}.`);
                        }
                    }
                } else { // Pro typy, kde numNeeded = 0 nebo nejsou dostupné akce
                    generateCombinations(typeIndex + 1, tempCourseEvents);
                }
            };

            generateCombinations(0, []); // Začneme s prvním typem akce a prázdným seznamem akcí pro tento kurz
        };

        const initialSchedule = new ScheduleClass();
        findSchedulesRecursive(0, initialSchedule);

        this.generatedSchedules = solutions;
        if (solutions.length > 0) {
            this.activeScheduleIndex = 0; // Aktivujeme první vygenerovaný
            return true;
        }
        // Pokud se nepodařilo nic vygenerovat, může se zobrazit informace uživateli
        // a případně se zapíše částečný rozvrh, pokud by algoritmus toto podporoval.
        return false;
    }
}

export default WorkspaceService;