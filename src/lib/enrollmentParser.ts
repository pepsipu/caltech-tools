export class EnrollmentParser {
  document: Document;

  constructor(src: string) {
    const parser = new DOMParser();
    this.document = parser.parseFromString(src, "text/html");
  }

  getTable() {
    const table = this.document.querySelector(
      'table[summary="Course Enrollment"]'
    );
    if (!table) {
      throw new Error("this doesn't look like a course enrollment document!");
    }
    return table;
  }

  parseRows(table: Element) {
    const rows = table.querySelectorAll("tbody tr");
    if (!rows) {
      throw new Error("could not find courses in course enrollment table");
    }
    const courseRecords = [...rows].map((row) => parseCourseRow(row));
    const enrolledCourses = courseRecords.filter(
      (courseRecord) => courseRecord.get("STATUS") == "Enrolled"
    );
    // return enrolledCourses;
    return enrolledCourses.map(
      (course) =>
        new Course(
          course.get("OFFERING_TITLE"),
          course.get("OFFERING_NAME"),
          course.get("SECTION_INSTRUCTOR"),
          course.get("DAYS_AND_TIME"),
          course.get("LOCATION")
        )
    );
  }

  getCourses() {
    const table = this.getTable();
    const courseList = this.parseRows(table);
    return courseList;
  }
}

class Course {
  title: string;
  description: string;

  constructor(
    offering: [string, string],
    public offeringCode: string,
    public sectionInstructor: string,
    timestamps: string[],
    locations: string[]
  ) {
    [this.title, this.description] = offering;
  }
}

const parseCourseRow = (row: Element) => {
  const map = new Map();
  const cells = row.querySelectorAll('td[class="t-Report-cell"]');
  for (const cell of cells) {
    const headers = cell.getAttribute("headers");
    switch (headers) {
      case "OFFERING_TITLE":
      case "LOCATION":
      case "DAYS_AND_TIME":
        const segments = [...cell.childNodes]
          .filter((node) => node.nodeName != "BR")
          .map((node) => node.textContent?.trim());
        map.set(headers, segments);
        break;
      case null:
        break;
      default:
        const text = cell.textContent?.trim() || "";
        // TODO: dont do janky text cleaning
        const cleanedText = text
          .split("\n")
          .map((segment) => segment.trim())
          .join(" ");
        map.set(headers, cleanedText);
    }
  }
  return map;
};
