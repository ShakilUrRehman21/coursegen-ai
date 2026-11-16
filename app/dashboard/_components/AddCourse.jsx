"use client";
import React, { useContext } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { UserCourseListContext } from '@/app/_context/UserCourseListContext';
import { Button } from '@/components/ui/button';
import { HiOutlineSparkles, HiOutlinePlus } from 'react-icons/hi2';

function AddCourse() {
  const { user } = useUser();
  const { userCourseList } = useContext(UserCourseListContext);
  const courseCount = Array.isArray(userCourseList) ? userCourseList.length : 0;
  const isLimitReached = courseCount >= 5;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white border-[3px] border-[#111] p-6 sm:p-8 text-[#111] shadow-[8px_8px_0_#111]">
      {/* Background decorative glow */}
      <div className="absolute right-0 top-0 -mt-6 -mr-6 hidden pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#111] text-[#fde047] text-xs font-semibold mb-3">
            <HiOutlineSparkles className="w-3.5 h-3.5" />
            <span>AI Curriculum Engine</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-[-0.04em] leading-none">
            Welcome back, {user?.firstName || user?.fullName || 'Creator'}!
          </h2>
          <p className="mt-2 text-[#111]/80 text-sm max-w-xl leading-relaxed">
            Create high-quality, comprehensive courses with synchronized YouTube lessons and interactive code snippets in just a few clicks.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Link href={isLimitReached ? '/dashboard/vision' : '/create-course'}>
            <Button
              size="lg"
              className="w-full sm:w-auto bg-white text-[#111] hover:bg-[#ff5fa2] border-2 border-[#111] font-bold shadow-[4px_4px_0_#111] rounded-xl px-6"
            >
              <HiOutlinePlus className="w-5 h-5 mr-1.5 text-primary" />
              <span>{isLimitReached ? 'Plan Limit Reached' : 'Create AI Course'}</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AddCourse;