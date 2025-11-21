import React, { useState, useEffect } from "react";
import { X, Search } from "lucide-react";
import { TopicService } from "../../../services/topic.service";
import { notification } from "antd";

export default function SelectTopicModal({
  t,
  open,
  currentTopicId,
  onClose,
  onSelect,
}) {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedTopicId, setSelectedTopicId] = useState(currentTopicId || "");

  useEffect(() => {
    if (open) {
      loadTopics();
      setSelectedTopicId(currentTopicId || "");
    }
  }, [open, currentTopicId]);

  const loadTopics = async () => {
    try {   
      setLoading(true);
      const res = await TopicService.getTopics();
      const topicList = res?.data?.data || res?.data || [];
      const validTopics = Array.isArray(topicList) ? topicList : [];
      const openTopics = validTopics.filter(
        (topic) =>
          String(topic?.status || topic?.topicStatus || topic?.state || "").toLowerCase() ===
          "open"
      );
      console.log("Loaded topics:", openTopics.map(t => ({ id: t.id, name: t.name })));
      setTopics(openTopics);
    } catch (err) {
      console.error("Failed to load topics:", err);
      setTopics([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredTopics = topics.filter((topic) => {
    // Filter out topics without mentor
    if (!topic.mentorId && !topic.mentor) return false;
    
    // Filter out topics already assigned to a group
    if (topic.isAssigned || topic.groupId) return false;
    
    const searchTerm = search.toLowerCase();
    const name = (topic.name || topic.title || "").toLowerCase();
    const description = (topic.description || "").toLowerCase();
    return name.includes(searchTerm) || description.includes(searchTerm);
  });

  const handleSubmit = () => {
    if (selectedTopicId) {
      const selectedTopic = topics.find((t) => {
        const topicId = t.id || t._id;
        return String(topicId) === String(selectedTopicId);
      });
      
      // Validate: check if topic has mentor
      if (!selectedTopic || (!selectedTopic.mentorId && !selectedTopic.mentor)) {
        notification.error({
          message: t("topicNoMentor") || "Topic Error",
          description: "Selected topic does not have an assigned mentor",
        });
        return;
      }
      
      console.log("Submitting topic:", selectedTopicId, selectedTopic);
      onSelect(selectedTopicId, selectedTopic);
    }
  };

  if (!open) return null;

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const label = (key, fallback) => t(key) || fallback;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      onClick={handleBackdrop}
    >
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative z-10 w-full max-w-2xl rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase text-green-500">
              {label("selectTopic", "Select Topic")}
            </p>
            <h3 className="text-lg font-semibold text-gray-900">
              {label("chooseTopicForGroup", "Choose a topic for your group")}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-gray-500 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={label("searchTopics", "Search topics...")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition"
            />
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto px-6">
          {loading ? (
            <div className="py-8 text-center text-sm text-gray-500">
              {label("loading", "Loading topics...")}
            </div>
          ) : filteredTopics.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-500">
              {label("noTopicsFound", "No topics found")}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTopics.map((topic, index) => {
                const topicId = topic.id || topic._id || topic.topicId;
                console.log("Rendering topic:", { index, topic, topicId });
                if (!topicId) {
                  console.error("Topic missing ID - full object:", JSON.stringify(topic));
                }
                const finalTopicId = topicId || `temp-${index}`;
                const isSelected = String(selectedTopicId) === String(finalTopicId);
                return (
                <button
                  key={finalTopicId}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!topicId) {
                      console.error("Cannot select topic without ID");
                      return;
                    }
                    console.log("Selected topic:", { id: finalTopicId, name: topic.name, fullTopic: topic });
                    setSelectedTopicId(finalTopicId);
                  }}
                  className={`w-full rounded-lg border-2 p-4 text-left transition ${
                    isSelected
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">
                        {topic.name || topic.title || topic.id}
                      </h4>
                      {topic.description && (
                        <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                          {topic.description}
                        </p>
                      )}
                    </div>
                    {isSelected && (
                      <div className="ml-4 flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white flex-shrink-0">
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {label("cancel", "Cancel")}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!selectedTopicId}
            className="rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {label("confirm", "Confirm")}
          </button>
        </div>
      </div>
    </div>
  );
}
