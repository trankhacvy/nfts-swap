import { Dialog, Transition } from "@headlessui/react";
import cx from "classnames";
import { Fragment, useRef } from "react";

export type ModalAnimation = "scale" | "slide-up";

type ModalProps = {
  isOpen: boolean;
  clickOutsideToDismiss?: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  className?: string;
  contentClass?: string;
  enableFocusTrap?: boolean;
  size?: string;
};

export const Modal = (props: ModalProps) => {
  const { isOpen, children, onClose, className } = props;

  const fakeRef = useRef<HTMLDivElement | null>(null);

  const animationProps = {
    enter: "ease-out duration-300",
    enterFrom: "opacity-0 translate-y-full",
    enterTo: "opacity-100 translate-y-0",
    leave: "ease-in duration-200",
    leaveFrom: "opacity-100 translate-y-0",
    leaveTo: "opacity-0 translate-y-full",
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-50 overflow-y-auto"
        onClose={onClose}
        initialFocus={fakeRef}
      >
        <div className={cx("min-h-screen px-4 relative", className)}>
          {/* This element is to trick the browser into centering the modal contents. */}
          <span
            className="inline-block h-screen align-middle"
            aria-hidden="true"
          >
            &#8203;
          </span>
          <div
            className={cx(
              "fixed flex items-center justify-center inset-0 px-5"
            )}
          >
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay
                className="fixed inset-0 bg-black bg-opacity-30"
                onClick={onClose}
              />
            </Transition.Child>
            <Transition.Child as={Fragment} {...animationProps}>
              {children}
            </Transition.Child>
          </div>
        </div>
        <div ref={fakeRef} className="h-0 w-0" />
      </Dialog>
    </Transition>
  );
};
