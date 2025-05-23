import {
  FBIcon,
  GithubIcon,
  InstaIcon,
  RedditIcon,
  TwitterIcon,
  YtIcon,
} from "../Icons/Icons.jsx";

function Footer() {
  return (
    <div className="relative bottom-0 w-full border-t border-gray-200 dark:border-gray-400">
      <div className="lg:h-[10vh] w-full py-5 bg-[#020102] dark:bg-gray-200 text-white dark:text-[#241B35] ">
        <div className="flex justify-center ">
          <div className="flex flex-col-reverse gap-y-4 lg:flex-row lg:justify-between w-[70vw] items-center">
            <div className="text-sm text-gray-300 dark:text-[#241B35]">
              &#169; 2023 Ecomm, Inc. All rights reserved.
            </div>
            <div>
              <ul className="flex flex-row gap-4 text-gray-300 text-xl dark:text-[#241B35]">
                <li className="hover:text-white p-2">
                  <a
                    href="https://twitter.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <TwitterIcon />
                  </a>
                </li>
                <li className="hover:text-white p-2">
                  <a
                    href="https://www.facebook.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FBIcon />
                  </a>
                </li>
                <li className="hover:text-white p-2">
                  <a
                    href="https://www.instagram.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <InstaIcon />
                  </a>
                </li>
                <li className="hover:text-white p-2">
                  <a
                    href="https://github.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <GithubIcon />
                  </a>
                </li>
                <li className="hover:text-white p-2">
                  <a
                    href="https://www.reddit.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <RedditIcon />
                  </a>
                </li>
                <li className="hover:text-white p-2">
                  <a
                    href="https://www.youtube.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <YtIcon />
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Footer;
