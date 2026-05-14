import { createBrowserRouter } from "react-router";
import { Landing } from "./pages/Landing";
import { Courses } from "./pages/Courses";
import { Login } from "./pages/Login";
import { PasswordRecovery } from "./pages/PasswordRecovery";
import { UserDashboard } from "./pages/UserDashboard";
import { AdminDashboard } from "./pages/AdminDashboard";
import { AdminCourseDetail } from "./pages/AdminCourseDetail";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Landing,
  },
  {
    path: "/courses",
    Component: Courses,
  },
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/password-recovery",
    Component: PasswordRecovery,
  },
  {
    path: "/dashboard",
    Component: UserDashboard,
  },
  {
    path: "/admin",
    Component: AdminDashboard,
  },
  {
    path: "/admin/course/:courseId",
    Component: AdminCourseDetail,
  },
]);
