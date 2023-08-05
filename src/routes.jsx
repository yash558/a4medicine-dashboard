import {
  HomeIcon,
  UserCircleIcon,
  TableCellsIcon,
  BellIcon,
  PlusCircleIcon,
  ArrowRightOnRectangleIcon,
  UserPlusIcon,
  BookmarkSquareIcon,
  UserGroupIcon,
  UsersIcon,
  ChartBarIcon,
  PaperAirplaneIcon,
  PaperClipIcon,
} from "@heroicons/react/24/solid";
import { FaBeer, FaPagelines, FaPaperPlane } from "react-icons/fa";
import { Home, Profile, Tables, Notifications } from "./pages/dashboard";
import { SignIn, SignUp } from "./pages/auth";
import Quiz from "./pages/dashboard/Quiz";
import Book from "./pages/dashboard/Book";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Panelist from "./pages/dashboard/Pannelist";
import Charts from "./pages/dashboard/Charts";

const icon = {
  className: "w-5 h-5 text-inherit",
};

export const routes = [
  {
    layout: "dashboard",
    pages: [
   
      {
        icon: <ChartBarIcon {...icon} />,
        name: "Charts",
        path: "/charts",
        element: <Charts/>,
      },
      {
        icon: <BookmarkSquareIcon {...icon} />,
        name: "Books",
        path: "/books",
        element: <Book />,
      },
      {
        icon: <TableCellsIcon {...icon} />,
        name: "Webinars",
        path: "/users",
        element: <Tables />,
      },
      {
        icon: <UsersIcon {...icon} />,
        name: "Panelist",
        path: "/panelist",
        element: <Panelist />,
      },
      {
        icon:<PaperClipIcon {...icon} />,
        name: "AKT Revision",
        path: "/quiz",
        element: <Quiz />,
      },
    ],
  },
  {
    title: "auth pages",
    layout: "auth",
    pages: [
      {
        icon: <ArrowRightOnRectangleIcon {...icon} />,
        name: "sign in",
        path: "/sign-in",
        element: <SignIn />,
      },
      {
        icon: <UserPlusIcon {...icon} />,
        name: "sign up",
        path: "/sign-up",
        element: <SignUp />,
      },
    ],
  },
];

export default routes;
