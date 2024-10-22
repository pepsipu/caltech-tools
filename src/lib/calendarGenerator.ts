import { Course } from "./course";
import { createEvents } from "ics";

export function coursesToIcs(courses: Course[]) {
    const events = courses.flatMap((course) => course.getEvents());
    const { error, value } = createEvents(events);

    if (error) {
        console.error(error);
        return;
    }

    return value;
}