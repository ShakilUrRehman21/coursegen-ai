"use server";

import { currentUser } from "@clerk/nextjs/server";
import { and, desc, eq, or } from "drizzle-orm";
import { db } from "@/configs/db";
import { Chapters, CourseList } from "@/configs/schema";
import { GenerateChapterContent_AI, GenerateCourseLayout_AI } from "@/configs/AiModel";
import service from "@/configs/service";

const MAX_PROMPT = 20000;

async function getUser() {
  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress || null;
  return { user, email };
}

async function requireEmail() {
  const { user, email } = await getUser();
  if (!email) throw new Error("Unauthorized");
  return { user, email };
}

function id(value) {
  return typeof value === "string" ? value.slice(0, 100) : String(value ?? "").slice(0, 100);
}

async function ownsCourse(courseId, email) {
  const [row] = await db
    .select({ id: CourseList.id })
    .from(CourseList)
    .where(and(eq(CourseList.courseId, id(courseId)), eq(CourseList.createdBy, email)))
    .limit(1);
  return Boolean(row);
}

/** Published courses are public; unpublished ones are visible to their creator only. */
function visibleTo(email) {
  return email ? or(eq(CourseList.publish, true), eq(CourseList.createdBy, email)) : eq(CourseList.publish, true);
}

/* ---------- AI and video (keys stay on the server) ---------- */

function checkPrompt(prompt) {
  if (typeof prompt !== "string" || !prompt.trim() || prompt.length > MAX_PROMPT) throw new Error("Invalid prompt");
}

export async function generateLayoutText(prompt) {
  await requireEmail();
  checkPrompt(prompt);
  try {
    const result = await GenerateCourseLayout_AI.sendMessage(prompt);
    return { text: result.response.text() };
  } catch (err) {
    console.error("Course layout generation failed:", err?.message || err);
    return { error: "The AI service is busy right now (Google Gemini is overloaded or your daily quota is used up). Please try again in a few minutes." };
  }
}

export async function generateChapterText(prompt) {
  await requireEmail();
  checkPrompt(prompt);
  try {
    const result = await GenerateChapterContent_AI.sendMessage(prompt);
    return { text: result.response.text() };
  } catch (err) {
    console.error("Chapter generation failed:", err?.message || err);
    return { error: "The AI service is busy right now (Google Gemini is overloaded or your daily quota is used up). Please try again in a few minutes." };
  }
}

export async function searchVideos(query) {
  await requireEmail();
  if (typeof query !== "string" || !query.trim()) return [];
  return service.getVideos(query.slice(0, 300));
}

/* ---------- Reads ---------- */

export async function getCourseRows(courseId) {
  const { email } = await getUser();
  return db
    .select()
    .from(CourseList)
    .where(and(eq(CourseList.courseId, id(courseId)), visibleTo(email)))
    .limit(1);
}

export async function getChapterRows(courseId, chapterIndex) {
  const { email } = await getUser();
  const [course] = await db
    .select({ id: CourseList.id })
    .from(CourseList)
    .where(and(eq(CourseList.courseId, id(courseId)), visibleTo(email)))
    .limit(1);
  if (!course) return [];
  return db
    .select()
    .from(Chapters)
    .where(and(eq(Chapters.chapterId, Number(chapterIndex)), eq(Chapters.courseId, id(courseId))));
}

export async function getOwnedCourseRows(courseId) {
  const { email } = await requireEmail();
  return db
    .select()
    .from(CourseList)
    .where(and(eq(CourseList.courseId, id(courseId)), eq(CourseList.createdBy, email)))
    .limit(1);
}

export async function listMyCourses() {
  const { email } = await requireEmail();
  return db.select().from(CourseList).where(eq(CourseList.createdBy, email)).orderBy(desc(CourseList.id));
}

export async function listPublishedCourses(pageIndex = 0, pageSize = 9) {
  const size = Math.min(Math.max(Number(pageSize) || 9, 1), 50);
  const page = Math.max(Number(pageIndex) || 0, 0);
  return db
    .select()
    .from(CourseList)
    .where(eq(CourseList.publish, true))
    .orderBy(desc(CourseList.id))
    .limit(size)
    .offset(page * size);
}

/* ---------- Writes (owner only) ---------- */

export async function createCourse(values) {
  const { user, email } = await requireEmail();
  if (!values?.courseId || !values?.courseOutput) throw new Error("Missing course fields");
  await db.insert(CourseList).values({
    courseId: id(values.courseId),
    name: String(values.name ?? "").slice(0, 300) || "Untitled course",
    level: String(values.level ?? "Beginner").slice(0, 50),
    category: String(values.category ?? "General").slice(0, 100),
    includeVideo: String(values.includeVideo ?? "Yes").slice(0, 10),
    courseOutput: values.courseOutput,
    createdBy: email,
    userName: user?.fullName ?? null,
    userProfileImage: user?.imageUrl ?? null,
  });
  return { ok: true };
}

export async function deleteChapters(courseId) {
  const { email } = await requireEmail();
  if (!(await ownsCourse(courseId, email))) throw new Error("Course not found");
  await db.delete(Chapters).where(eq(Chapters.courseId, id(courseId)));
  return { ok: true };
}

export async function insertChapter(values) {
  const { email } = await requireEmail();
  if (!(await ownsCourse(values?.courseId, email))) throw new Error("Course not found");
  await db.insert(Chapters).values({
    chapterId: Number(values.chapterId) || 0,
    courseId: id(values.courseId),
    content: values.content,
    videoId: String(values.videoId ?? "").slice(0, 50),
  });
  return { ok: true };
}

export async function publishCourse(courseId) {
  const { email } = await requireEmail();
  await db
    .update(CourseList)
    .set({ publish: true })
    .where(and(eq(CourseList.courseId, id(courseId)), eq(CourseList.createdBy, email)));
  return { ok: true };
}

export async function updateCourseBanner(courseId, courseBanner) {
  const { email } = await requireEmail();
  if (typeof courseBanner !== "string" || !/^https:\/\//.test(courseBanner)) throw new Error("Invalid banner URL");
  await db
    .update(CourseList)
    .set({ courseBanner: courseBanner.slice(0, 2000) })
    .where(and(eq(CourseList.courseId, id(courseId)), eq(CourseList.createdBy, email)));
  return { ok: true };
}

export async function updateCourseInfo(courseId, { name, courseOutput }) {
  const { email } = await requireEmail();
  await db
    .update(CourseList)
    .set({ name: String(name ?? "").slice(0, 300), courseOutput })
    .where(and(eq(CourseList.courseId, id(courseId)), eq(CourseList.createdBy, email)));
  return { ok: true };
}

export async function deleteCourse(courseId) {
  const { email } = await requireEmail();
  if (!(await ownsCourse(courseId, email))) throw new Error("Course not found");
  await db.delete(Chapters).where(eq(Chapters.courseId, id(courseId)));
  await db.delete(CourseList).where(and(eq(CourseList.courseId, id(courseId)), eq(CourseList.createdBy, email)));
  return { ok: true };
}
