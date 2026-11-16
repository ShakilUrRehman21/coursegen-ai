"use client";
import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import CourseBasicInfo from "./_components/CourseBasicInfo";
import CourseDetail from "./_components/CourseDetail";
import ChapterList from "./_components/ChapterList";
import { Button } from "@/components/ui/button";
import { GenerateChapterContent_AI } from "@/configs/aiClient";
import LoadingDialog from "../_components/LoadingDialog";
import service from "@/configs/aiClient";
import { useRouter } from "next/navigation";
import { safeJsonParse } from "@/lib/jsonHelper";
import { HiOutlineSparkles, HiOutlineArrowRight } from "react-icons/hi2";
import { deleteChapters, getOwnedCourseRows, insertChapter, publishCourse } from "@/app/actions/courses";

function CourseLayout({ params }) {
  const { user } = useUser();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (params?.courseId && user) {
      GetCourse();
    }
  }, [params, user]);

  const GetCourse = async () => {
    try {
      const email = user?.primaryEmailAddress?.emailAddress;
      const result = await getOwnedCourseRows(params?.courseId);

      if (result.length > 0) {
        setCourse(result[0]);
      } else {
        setCourse(null);
      }
    } catch (err) {
      console.error("Error fetching course layout:", err);
    }
  };

  const GenerateChapterContent = async () => {
    const chapters = course?.courseOutput?.chapters;
    if (!chapters || chapters.length === 0) {
      alert("No chapters found in course curriculum.");
      return;
    }

    setLoading(true);

    try {
      // 1. Clean up any existing chapters for this course to prevent duplicates
      await deleteChapters(course?.courseId);

      const courseTitle =
        course?.courseOutput?.course_name || course?.name || "Tutorial";
      const isVideoEnabled = course?.includeVideo !== "No";

      // 2. Sequentially generate content and sync videos for each chapter
      for (let index = 0; index < chapters.length; index++) {
        const chapter = chapters[index];
        const chapterTitle =
          chapter?.chapter_name ||
          chapter?.ChapterName ||
          chapter?.name ||
          `Chapter ${index + 1}`;

        setLoadingMessage(
          `Generating Chapter ${index + 1} of ${chapters.length}: "${chapterTitle}"...`
        );

        // Targeted YouTube search query
        let videoId = "";
        if (isVideoEnabled) {
          const videoSearchQuery = `${courseTitle} ${chapterTitle} tutorial`;
          try {
            const videoResp = await service.getVideos(videoSearchQuery);
            videoId = videoResp?.[0]?.id?.videoId || "";
          } catch (videoErr) {
            console.warn(`Video fetch warning for chapter ${index + 1}:`, videoErr);
            videoId = "";
          }
        }

        // Generate in-depth chapter content with AI
        const prompt = `Explain the educational concepts in detail for:
Topic: "${courseTitle}"
Chapter: "${chapterTitle}"
Overview: "${chapter?.about || ""}"

Requirements:
- Break down the chapter into 2 to 4 key sub-topics/concepts.
- Each concept must have:
  - "title": Concept title
  - "description": Comprehensive, pedagogical explanation with clear formatting and bullet points where helpful.
  - "codeExample": Practical, formatted code example if applicable to programming/tech, or an empty string "" if non-technical.

Return strictly a valid JSON array of objects.`;

        const result = await GenerateChapterContent_AI.sendMessage(prompt);
        const rawContent = result?.response?.text();
        const parsedContent = safeJsonParse(rawContent, [
          {
            title: chapterTitle,
            description: chapter?.about || "Comprehensive lesson material.",
            codeExample: "",
          },
        ]);

        // Save into Chapters table
        await insertChapter({
          chapterId: index,
          courseId: course?.courseId,
          content: parsedContent,
          videoId: videoId,
        });
      }

      // 3. Mark course as published once all chapters are generated
      setLoadingMessage("Finalizing course curriculum...");
      await publishCourse(course?.courseId);

      // 4. Navigate to finish screen
      router.replace(`/create-course/${course?.courseId}/finish`);
    } catch (error) {
      console.error("Critical error generating chapter content:", error);
      alert(
        error?.message?.includes("AI service is busy")
          ? error.message
          : "Something went wrong while generating chapters. Please try again."
      );
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] py-10 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-primary text-xs font-semibold mb-2">
              <HiOutlineSparkles className="w-3.5 h-3.5" />
              <span>Step 2: Review & Generate</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Course Structure & Outline
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Review your course details and chapters before generating lessons and video sync.
            </p>
          </div>

          <Button
            onClick={GenerateChapterContent}
            className="bg-primary hover:bg-primary-700 text-white font-semibold rounded-xl gap-2 shadow-lg px-6 self-start sm:self-auto"
          >
            <HiOutlineSparkles className="w-5 h-5" />
            <span>Generate Course Content</span>
            <HiOutlineArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Basic Info Banner Component */}
        <CourseBasicInfo course={course} refreshData={GetCourse} />

        {/* Course Detail Spec Component */}
        <CourseDetail course={course} />

        {/* List of Lessons Component */}
        <ChapterList course={course} />

        {/* Bottom Action CTA */}
        <div className="pt-6 flex justify-end">
          <Button
            size="lg"
            onClick={GenerateChapterContent}
            className="w-full sm:w-auto bg-primary hover:bg-primary-700 text-white font-bold rounded-xl gap-2 shadow-lg px-8"
          >
            <HiOutlineSparkles className="w-5 h-5" />
            <span>Generate All Chapters & Sync Videos</span>
          </Button>
        </div>
      </div>

      <LoadingDialog
        loading={loading}
        title="Generating Chapter Content"
        message={loadingMessage}
      />
    </div>
  );
}

export default CourseLayout;