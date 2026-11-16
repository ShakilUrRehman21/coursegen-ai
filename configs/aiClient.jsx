import { generateChapterText, generateLayoutText, searchVideos } from "@/app/actions/courses";

/** Browser-side stand-ins. Prompts and video searches run on the server, so API keys stay private. */
const wrap = (fn) => ({
  sendMessage: async (prompt) => {
    const result = await fn(prompt);
    if (result?.error) throw new Error(result.error);
    return { response: { text: () => result.text } };
  },
});

export const GenerateCourseLayout_AI = wrap(generateLayoutText);
export const GenerateChapterContent_AI = wrap(generateChapterText);

const service = { getVideos: (query) => searchVideos(query) };
export default service;
