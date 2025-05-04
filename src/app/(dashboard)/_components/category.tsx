import { Archive, Dock, Egg, Table } from "lucide-react";
import { FaDumpster } from "react-icons/fa6";

export const Category = () => {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        <div className="flex h-[180px] w-[150px] sm:w-[180px] md:w-[220px] flex-col items-center justify-center rounded-lg bg-gradient-to-b from-amber-50 to-white p-4 transition hover:to-amber-50">
          <div className="relative flex h-full w-full flex-col items-center justify-center rounded-lg bg-white p-2 drop-shadow-sm">
            <div className="absolute right-1 top-1 rounded bg-emerald-500 px-2 py-0.5 text-xs font-medium text-white">
              30%
            </div>
            <div className="mb-4">
              <Archive className="size-8 text-teal-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-800">Live Poultry</h3>
            <p className="mt-1 text-sm text-gray-500">320 items</p>
          </div>
        </div>
        <div className="flex h-[180px] w-[150px] sm:w-[180px] md:w-[220px] flex-col items-center justify-center rounded-lg bg-gradient-to-b from-green-50 to-white p-4 transition hover:to-green-50">
          <div className="relative flex h-full w-full flex-col items-center justify-center rounded-lg bg-white p-2 drop-shadow-sm">
            <div className="absolute right-1 top-1 rounded bg-emerald-500 px-2 py-0.5 text-xs font-medium text-white">
              30%
            </div>
            <div className="mb-4">
              <Dock className="size-8 text-teal-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-800">Meat</h3>
            <p className="mt-1 text-sm text-gray-500">66 items</p>
          </div>
        </div>

        <div className="flex h-[180px] w-[150px] sm:w-[180px] md:w-[220px] flex-col items-center justify-center rounded-lg bg-gradient-to-b from-orange-50 to-white p-4 transition hover:to-orange-50">
          <div className="relative flex h-full w-full flex-col items-center justify-center rounded-lg bg-white p-2 drop-shadow-sm">
            <div className="absolute right-1 top-1 rounded bg-emerald-500 px-2 py-0.5 text-xs font-medium text-white">
              30%
            </div>
            <div className="mb-4">
              <Egg className="size-8 text-teal-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-800">Eggs</h3>
            <p className="mt-1 text-sm text-gray-500">48 items</p>
          </div>
        </div>
        <div className="flex h-[180px] w-[150px] sm:w-[180px] md:w-[220px] flex-col items-center justify-center rounded-lg bg-gradient-to-b from-pink-50 to-white p-4 transition hover:to-pink-50">
          <div className="relative flex h-full w-full flex-col items-center justify-center rounded-lg bg-white p-2 drop-shadow-sm">
            <div className="absolute right-1 top-1 rounded bg-emerald-500 px-2 py-0.5 text-xs font-medium text-white">
              30%
            </div>
            <div className="mb-4">
              <FaDumpster className="size-8 text-teal-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-800">Equipments</h3>
            <p className="mt-1 text-sm text-gray-500">548 items</p>
          </div>
        </div>
        <div className="flex h-[180px] w-[150px] sm:w-[180px] md:w-[220px] flex-col items-center justify-center rounded-lg bg-gradient-to-b from-blue-50 to-white p-4 transition hover:to-blue-50">
          <div className="relative flex h-full w-full flex-col items-center justify-center rounded-lg bg-white p-2 drop-shadow-sm">
            <div className="absolute right-1 top-1 rounded bg-emerald-500 px-2 py-0.5 text-xs font-medium text-white">
              30%
            </div>
            <div className="mb-4">
              <Table className="size-8 text-teal-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-800">
              Feed & Supplies
            </h3>
            <p className="mt-1 text-sm text-gray-500">112 items</p>
          </div>
        </div>
      </div>
    </section>
  );
};
