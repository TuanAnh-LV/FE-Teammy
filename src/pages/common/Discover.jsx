import React, { useEffect, useState } from "react";
import FilterSidebar from "../../components/common/discover/FilterSidebar";
import ProjectCard from "../../components/common/discover/ProjectCard";
import { useTranslation } from "../../hook/useTranslation";
import { TopicService } from "../../services/topic.service";
import { message } from "antd";

const Discover = () => {
  const { t } = useTranslation();
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    let mounted = true;
    const fetchTopics = async () => {
      try {
        const res = await TopicService.getTopics();
        const payload = res?.data ?? res;
        const list = Array.isArray(payload) ? payload : payload?.data ?? [];
        const mapped = (list || []).map((t) => ({
          topicId: t.topicId || t.id,
          title: t.title || t.topicName || "Untitled",
          description: t.description || "",
          domain: t.majorName || "General",
          status: t.status || "open",
          tags: [t.status || "open"],
          mentor:
            (t.mentors && t.mentors[0] && t.mentors[0].mentorName) ||
            t.createdByName ||
            "",
          progress: 0,
          members: (t.mentors || []).map((m) =>
            m.mentorName
              ? m.mentorName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
              : "M"
          ),
          createdAt: t.createdAt,
          attachedFiles: t.attachedFiles || [],
          referenceDocs: t.referenceDocs || [],
        }));
        if (mounted) setProjects(mapped);
      } catch (err) {
        console.error(err);
        message.error("Failed to load topics");
      } finally {
        // no-op
      }
    };
    fetchTopics();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#f7fafc] pt-24 pb-12">
      {/*  Header section */}
      <div className="max-w-[1600px] mx-auto ml-48 mb-8">
        <h1 className="text-4xl font-extrabold text-[#1a1a1a] mb-2">
          {t("findProjects")}
        </h1>
        <p className="text-gray-500 text-lg">{t("discoverProjects")}</p>
      </div>

      {/* Main Layout */}
      <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-8 px-8">
        {/* Sidebar */}
        <div className="flex-shrink-0">
          <FilterSidebar />
        </div>

        {/* Main content */}
        <div className="flex flex-col gap-6">
          {/* Search */}
          <div className="flex items-center">
            <input
              type="text"
              placeholder={t("searchProjects")}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Projects */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-6">
            {projects.map((project, i) => (
              <ProjectCard key={i} project={project} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Discover;
