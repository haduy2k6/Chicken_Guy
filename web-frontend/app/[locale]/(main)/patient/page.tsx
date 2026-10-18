import { UploadStep } from "@/src/Component/Patient/AreaUpload/UploadStep";

export default function PatientPage() {
  return (
    <main className=" bg-linear-to-b from-[#FFFDFB] via-[#FFF7F2] to-[#FFF0E8] px-4 pb-16 pt-20 sm:px-6 lg:px-8">
      <div className="w-full rounded-2xl bg-orange-400 text-xl">
        <span>Toi vi ngu a dung ai lam phien toi, toi bi ngu </span>
      </div>
      <div className="flex  ">
        <UploadStep />
        <div></div>
        
         </div>
    </main>
  );
}
