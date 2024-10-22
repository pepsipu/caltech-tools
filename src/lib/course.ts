import { parse, nextDay } from 'date-fns';
import { createEvents } from 'ics';


// Define the Timeslot interface
interface Timeslot {
    start: Date;
    end: Date;
    location: string;
    geo?: { lat: number; lon: number };
}

// Implement the parseTimestamps function
function parseTimestamps(timestamp: string): Timeslot[] {
    const dayMap: { [key: string]: number } = { M: 1, T: 2, W: 3, R: 4, F: 5 };
    const timeslots: Timeslot[] = [];
    timestamp = timestamp.trim();

    if (timestamp.startsWith('OM')) return [];

    const [daysPart, timePart] = timestamp.split(/\s+/);
    if (!timePart || daysPart!.startsWith('OM')) return [];

    const [startTimeStr, endTimeStr] = timePart.split('-');
    const days = daysPart!.split(',').flatMap((group) =>
        [...group].map((ch) => dayMap[ch]).filter(Boolean)
    );

    days.forEach((day) => {
        const now = new Date();
        now.setDate(now.getDate() - 1);
        // @ts-ignore
        const startDate = nextDay(now, day % 7);
        const start = parse(startTimeStr!, 'HH:mm', startDate);
        const end = parse(endTimeStr!, 'HH:mm', startDate);
        timeslots.push({ start, end, location: '' });
    });

    return timeslots;
}

// Implement the Course class
export class Course {
    title: string;
    description: string;
    timeslots: Timeslot[];
    locations: string[];

    constructor(
        offering: [string, string],
        public offeringCode: string,
        public sectionInstructor: string,
        timestamps: string[],
        _locations: string[]
    ) {
        [this.title, this.description] = offering;
        this.locations = _locations;
        this.timeslots = [];

        for (let i = 0; i < timestamps.length; i++) {
            const timestamp = timestamps[i];
            const location = _locations[i] || '';
            const parsedTimeslots = parseTimestamps(timestamp!);
            parsedTimeslots.forEach((timeslot) => {
                timeslot.location = location;
                this.timeslots.push(timeslot);
            });
        }
    }

    // Method to generate events for the ICS file
    getEvents() {
        return this.timeslots.map((timeslot) => {
            const start = timeslot.start.getTime()

            const durationMinutes = (timeslot.end.getTime() - timeslot.start.getTime()) / (60 * 1000);
            const duration = { minutes: durationMinutes };

            return {
                start,
                duration,
                title: this.getTitle(),
                description: this.getDescription(),
                location: timeslot.location,
                recurrenceRule: "FREQ=WEEKLY;WKST=SU"
                // geo: timeslot.geo,
            };
        });
    }

    // Additional getter methods if needed
    getTitle() {
        return `${this.offeringCode}: ${this.title}`;
    }

    getDescription() {
        return this.description;
    }

    getLocation() {
        return this.locations;
    }

    getGeo() {
        // Returns an array of geo coordinates
        return this.timeslots.map((timeslot) => timeslot.geo);
    }
}