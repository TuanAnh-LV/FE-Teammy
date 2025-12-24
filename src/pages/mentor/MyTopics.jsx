import React, { useEffect, useState } from "react";
import { Loader2, Tag } from "lucide-react";
import { TopicService } from "../../services/topic.service";
import { useTranslation } from "../../hook/useTranslation";

const MyTopics = () => {
  const { t } = useTranslation();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      setLoading(true);
      const res = await TopicService.getOwnedOpenTopics();
      const data = Array.isArray(res?.data) ? res.data : [];
      setTopics(data);
    } catch {
      setTopics([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 min-h-screen">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-black">
          {t("topics") || "Topics"}
        </h1>
        <p className="text-gray-600">
          {t("browseAllTopics") || "Topics assigned to you."}
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
          </div>
        ) : topics.length === 0 ? (
          <div className="text-sm text-gray-500 py-6 text-center">
            {t("noTopicsFound") || "No topics found."}
          </div>
        ) : (
          <div className="space-y-3">
            {topics.map((topic) => (
              <div
                key={topic.id || topic.topicId}
                className="border border-gray-200 rounded-xl p-4 bg-gray-50"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {topic.title || topic.name || "Untitled topic"}
                    </h3>
                    {topic.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {topic.description}
                      </p>
                    )}
                  </div>
                  {topic.status && (
                    <span className="text-xs text-gray-600 border border-gray-200 rounded-full px-2 py-0.5 bg-white">
                      {topic.status}
                    </span>
                  )}
                </div>
                {Array.isArray(topic.skills) && topic.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {topic.skills.slice(0, 6).map((skill, idx) => {
                      const label =
                        typeof skill === "string" ? skill : skill?.token || skill?.name;
                      return (
                        <span
                          key={`${label}-${idx}`}
                          className="inline-flex items-center gap-1 rounded-full bg-blue-50 text-blue-700 text-xs px-2 py-0.5"
                        >
                          <Tag className="w-3 h-3" />
                          {label}
                        </span>
                      );
                    })}
                    {topic.skills.length > 6 && (
                      <span className="text-xs text-gray-500">
                        +{topic.skills.length - 6}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTopics;
