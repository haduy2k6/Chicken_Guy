"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Stethoscope,
  Filter,
  AlertTriangle,
  Search,
  RefreshCw,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  X,
  FileText,
  User,
  ShieldCheck,
  Send,
  Loader2,
} from "lucide-react";
import { useDoctorStore } from "@/src/StoreUser/Doctor/DoctorStore";
import { useAuthStore } from "@/src/StoreUser/Global/AuthStore";
import { SpecialtyFilter, PatientQueueItem } from "../types";

export function DoctorWorkspace() {
  const {
    queue,
    selectedCase,
    filterSpecialty,
    filterStatus,
    searchQuery,
    reviewDraft,
    isLoading,
    isSubmittingReview,
    error,
    fetchQueue,
    selectCase,
    updateDraft,
    submitReview,
    setFilterSpecialty,
    setFilterStatus,
    setSearchQuery,
  } = useDoctorStore();

  const user = useAuthStore((s) => s.user);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  const filteredQueue = useMemo(() => {
    return queue.filter((item) => {
      const matchSpecialty =
        filterSpecialty === "all" || item.specialty === filterSpecialty;
      const matchStatus =
        filterStatus === "all" || item.status === filterStatus;
      const matchSearch =
        !searchQuery ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase());

      return matchSpecialty && matchStatus && matchSearch;
    });
  }, [queue, filterSpecialty, filterStatus, searchQuery]);

  const pendingCount = useMemo(
    () => queue.filter((i) => i.status === "pending").length,
    [queue]
  );

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase) return;

    const ok = await submitReview(selectedCase.id);
    if (ok) {
      setSuccessToast(`Đã hoàn tất kết luận chuyên môn cho ca #${selectedCase.id.slice(0, 6)}!`);
      setTimeout(() => setSuccessToast(null), 4000);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-stone-200/80 shadow-xs">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-100 text-cyan-900 text-xs font-bold uppercase tracking-wider">
            <Stethoscope className="w-3.5 h-3.5 text-cyan-700" />
            <span>Khu Vực Bác Sĩ Chuyên Khoa</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            Hàng Đợi Ca Khám & Đánh Giá AI
          </h1>
          <p className="text-xs sm:text-sm text-stone-500">
            Bác sĩ: <span className="font-semibold text-stone-800">{user?.name || "Bác sĩ Chuyên Khoa"}</span> •{" "}
            {pendingCount > 0 ? (
              <span className="text-amber-700 font-bold">
                Có {pendingCount} ca bệnh đang chờ đánh giá chuyên môn
              </span>
            ) : (
              <span className="text-emerald-700 font-medium">Tất cả ca bệnh đã được xử lý</span>
            )}
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchQueue(true)}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          <span>Làm mới danh sách</span>
        </button>
      </div>

      {/* Notifications */}
      {successToast && (
        <div className="rounded-2xl border border-emerald-300 bg-emerald-50 px-5 py-3 text-sm text-emerald-900 font-medium flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="cursor-pointer">
            <X className="w-4 h-4 text-emerald-700" />
          </button>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-rose-300 bg-rose-50 px-5 py-3 text-sm text-rose-900 font-medium flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="Tìm theo tên bệnh nhân, mã hồ sơ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-cyan-600"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 text-xs font-bold text-stone-500 mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Trạng thái:</span>
          </div>
          {[
            { id: "all", label: "Tất cả" },
            { id: "pending", label: "Đang chờ" },
            { id: "reviewed", label: "Đã duyệt" },
            { id: "escalated", label: "Chuyển tuyến" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setFilterStatus(t.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterStatus === t.id
                  ? "bg-stone-900 text-white shadow-xs"
                  : "bg-stone-100 text-stone-700 hover:bg-stone-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Queue items & Review split view */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Queue List */}
        <div className={selectedCase ? "lg:col-span-7 space-y-3" : "lg:col-span-12 space-y-3"}>
          {isLoading && queue.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-stone-200/80 shadow-xs">
              <Loader2 className="w-8 h-8 mx-auto animate-spin text-cyan-600 mb-3" />
              <p className="text-sm font-semibold text-stone-600">Đang tải danh sách ca bệnh...</p>
            </div>
          ) : filteredQueue.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-stone-200/80 shadow-xs">
              <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 mb-2" />
              <p className="text-base font-bold text-stone-800">Không có ca bệnh nào phù hợp bộ lọc</p>
              <p className="text-xs text-stone-500 mt-1">Vui lòng thay đổi từ khóa hoặc bộ lọc trạng thái</p>
            </div>
          ) : (
            filteredQueue.map((item) => {
              const isSelected = selectedCase?.id === item.id;
              const isHighRisk = (item.aiRiskScore || 0) >= 65;

              return (
                <div
                  key={item.id}
                  onClick={() => selectCase(item)}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer bg-white relative ${
                    isSelected
                      ? "border-cyan-600 ring-2 ring-cyan-600/20 shadow-md"
                      : "border-stone-200/80 hover:border-stone-300 hover:shadow-xs"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-stone-900 text-sm sm:text-base">
                          {item.name}
                        </span>
                        <span className="text-xs text-stone-500">
                          ({item.age} tuổi • {item.gender === "Female" ? "Nữ" : "Nam"})
                        </span>
                      </div>
                      <p className="text-xs text-stone-400">Mã ca: #{item.id.slice(0, 8)}</p>
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          item.status === "pending"
                            ? "bg-amber-100 text-amber-900"
                            : item.status === "escalated"
                            ? "bg-rose-100 text-rose-900"
                            : "bg-emerald-100 text-emerald-900"
                        }`}
                      >
                        {item.status === "pending"
                          ? "Đang chờ"
                          : item.status === "escalated"
                          ? "Khẩn cấp"
                          : "Đã duyệt"}
                      </span>

                      {item.aiRiskScore !== undefined && (
                        <div
                          className={`flex items-center gap-1 text-xs font-black ${
                            isHighRisk ? "text-rose-600" : "text-emerald-600"
                          }`}
                        >
                          {isHighRisk && <AlertTriangle className="w-3.5 h-3.5" />}
                          <span>AI Nguy cơ: {item.aiRiskScore}%</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(item.submissionDate).toLocaleDateString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </span>

                    <span className="text-cyan-700 font-bold flex items-center gap-0.5">
                      Xem chi tiết <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Case Review Panel */}
        {selectedCase && (
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-stone-200/90 shadow-lg sticky top-24 space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-700" />
                <h3 className="font-black text-stone-900 text-base">Đánh Giá Chuyên Môn</h3>
              </div>
              <button
                type="button"
                onClick={() => selectCase(null)}
                className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Patient Brief */}
            <div className="bg-stone-50 rounded-2xl p-4 space-y-2 border border-stone-100 text-xs sm:text-sm">
              <div className="flex justify-between">
                <span className="text-stone-500">Họ và tên:</span>
                <span className="font-bold text-stone-900">{selectedCase.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Tuổi & Giới tính:</span>
                <span className="font-semibold text-stone-800">
                  {selectedCase.age} tuổi • {selectedCase.gender}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Mã hồ sơ:</span>
                <span className="font-mono text-stone-600">#{selectedCase.id.slice(0, 8)}</span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-stone-200/60">
                <span className="text-stone-500 font-medium">Điểm đánh giá AI:</span>
                <span className="font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                  {selectedCase.aiRiskScore || 20}% Nguy cơ
                </span>
              </div>
            </div>

            {/* Doctor Decision Form */}
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Kết luận và hướng xử lý của Bác sĩ:
                </label>
                <textarea
                  rows={4}
                  placeholder="Ghi chú chẩn đoán lâm sàng, khuyến nghị sinh thiết vòm họng hoặc lịch tái khám..."
                  value={reviewDraft.notes}
                  onChange={(e) => updateDraft({ notes: e.target.value })}
                  className="w-full p-3 rounded-xl border border-stone-200 text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-cyan-600 bg-stone-50/50"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Phân loại trạng thái ca bệnh:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => updateDraft({ status: "reviewed" })}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      reviewDraft.status === "reviewed"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                    }`}
                  >
                    Đã Khám & Theo Dõi
                  </button>
                  <button
                    type="button"
                    onClick={() => updateDraft({ status: "escalated" })}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      reviewDraft.status === "escalated"
                        ? "bg-rose-600 text-white shadow-xs"
                        : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                    }`}
                  >
                    Khẩn Cấp / Chuyển Tuyến
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmittingReview || !reviewDraft.notes.trim()}
                className="w-full mt-2 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm bg-stone-900 text-white hover:bg-stone-800 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                {isSubmittingReview ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>Xác Nhận & Gửi Kết Luận</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default DoctorWorkspace;
