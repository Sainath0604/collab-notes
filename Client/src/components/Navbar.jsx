import { Link } from "react-router-dom";
import { Disclosure } from "@headlessui/react";
import Theme from "./Theme";
import { CrossIcon, HamburgerIcon, UserIcon } from "../Icons/Icons";

const navigation = [
  { name: "Dashboard", to: "/" },
  { name: "Shop", to: "#" },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

function Navbar() {
  return (
    <div>
      <Disclosure
        as="nav"
        className="bg-customDark-500 dark:bg-gray-200 sticky border-b border-gray-200 dark:border-gray-400"
      >
        {({ open }) => (
          <>
            <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8 ">
              <div className="relative h-[10vh] flex items-center justify-between">
                <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                  {/* Mobile menu button*/}
                  <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 dark:text-[#241B35] hover:bg-gray-700 dark:hover:bg-[#D9CFFC] hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                    <span className="sr-only">Open main menu</span>
                    {open ? (
                      <div className="block h-6 w-6 ">
                        <CrossIcon />
                      </div>
                    ) : (
                      <div className="block h-6 w-6">
                        <HamburgerIcon />
                      </div>
                    )}
                  </Disclosure.Button>
                </div>
                <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                  <div className="flex flex-shrink-0 items-center ">
                    <Link to="/">
                      <span className="font-bold text-3xl text-indigo-600 dark:text-indigo-800">
                        HEY
                      </span>
                    </Link>
                  </div>
                  <div className="hidden sm:ml-6 sm:block">
                    <div className="flex space-x-4">
                      {navigation.map((item) => (
                        <Link
                          key={item.name}
                          to={item.to}
                          className={classNames(
                            item.current
                              ? "bg-gray-900 text-[#241B35]"
                              : "text-gray-300 dark:text-[#241B35] hover:bg-gray-700 dark:hover:bg-[#D9CFFC] hover:text-white",
                            "rounded-md px-3 py-2 text-sm font-medium"
                          )}
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                  <div className="hidden sm:ml-6 sm:block">
                    <Theme />
                  </div>
                </div>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                  <Link to="#">
                    <button
                      type="button"
                      className="rounded-full dark:bg-gray-200 p-1 text-gray-400 dark:text-[#241B35] hover:text-white "
                    >
                      <span className="sr-only">User Account</span>
                      <div className="h-6 w-6 ">
                        <UserIcon />
                      </div>
                    </button>
                  </Link>
                </div>
              </div>
            </div>

            <Disclosure.Panel className="sm:hidden">
              <div className="space-y-1 px-2 pb-3 pt-2">
                {navigation.map((item) => (
                  <Link key={item.name} to={item.to}>
                    <Disclosure.Button
                      className={classNames(
                        item.current
                          ? "bg-gray-900 text-[#241B35]"
                          : "text-gray-300 dark:text-[#241B35] hover:bg-gray-700 dark:hover:bg-[#D9CFFC] hover:text-white",
                        "block rounded-md px-3 py-2 text-base font-medium"
                      )}
                    >
                      {item.name}
                    </Disclosure.Button>
                  </Link>
                ))}
                <div className="sm:hidden">
                  <Theme />
                </div>
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
    </div>
  );
}
export default Navbar;
