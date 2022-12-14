import { Toaster, ToastIcon, resolveValue } from "react-hot-toast";
import { Transition } from "@headlessui/react";

export const AppToaster = () => (
  <Toaster
    toastOptions={{
      duration: 2 * 1000,
    }}
    containerClassName="rounded-xl"
  >
    {(t) => (
      <Transition
        appear
        show={t.visible}
        className="transform p-4 flex bg-gray-800 rounded shadow-lg"
        enter="transition-all duration-150"
        enterFrom="opacity-0 scale-50"
        enterTo="opacity-100 scale-100"
        leave="transition-all duration-150"
        leaveFrom="opacity-100 scale-100"
        leaveTo="opacity-0 scale-75"
      >
        <ToastIcon toast={t} />
        {/* @ts-ignore */}
        <p className="px-4 text-lg max-w-lg">{resolveValue(t.message)}</p>
      </Transition>
    )}
  </Toaster>
);
