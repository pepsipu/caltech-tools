<script lang="ts">
  import Dropzone from "svelte-file-dropzone";
  import fileDownload from "js-file-download";
  import { EnrollmentParser } from "../lib/enrollmentParser";
  import { Course } from "../lib/course";

  import { coursesToIcs } from "../lib/calendarGenerator";

  let courses: Course[] = [];

  async function handleFilesSelect(e: any) {
    const { acceptedFiles } = e.detail;

    const file = acceptedFiles[0];
    const content = await file.text();

    const parser = new EnrollmentParser(content);
    courses = parser.getCourses();

    const icsFile = coursesToIcs(courses);
    fileDownload(icsFile, "schedule.ics");
  }
</script>

<Dropzone on:drop={handleFilesSelect} />
<ol>
  {#each courses as item}
    <li>{item.title}</li>
  {/each}
</ol>
