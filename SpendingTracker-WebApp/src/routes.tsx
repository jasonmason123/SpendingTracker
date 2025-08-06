import React from "react";
import Home from "./pages/Dashboard/Home";
import DeveloperInfo from "./pages/DeveloperInfo";
import Calendar from "./pages/Calendar";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import LineChart from "./pages/Charts/LineChart";
import Transactions from "./pages/Transactions/Transactions";

type RouteType = {
    path?: string;
    title?: string;
    description?: string;
    subroutes?: RouteType[];
    element?: React.ReactNode;
}

const routes : RouteType[] = [
    {
        path: "/",
        title: "Home",
        description: "Home/Dashboard",
        element: <Home />,
    },
    {
        path: "/transactions",
        title: "Transactions",
        description: "Financial Transactions",
        element: <Transactions />,
    },
    {
        path: "/profile",
        title: "User Profiles",
        description: "User Profiles",
        element: <DeveloperInfo />,
    },
    {
        path: "/calendar",
        title: "Calendar",
        description: "Calendar",
        element: <Calendar />,
    },
    {
        path: "/form-elements",
        title: "Form Elements",
        description: "Form Elements",
        element: <FormElements />,
    },
    {
        path: "/basic-tables",
        title: "Basic Tables",
        description: "Basic Tables",
        element: <FormElements />,
    },
    {
        path: "/blank",
        title: "Blank Page",
        description: "Blank Page",
        element: <Blank />,
    },
    {
        path: "/error-404",
        title: "404 Error",
        description: "404 Error",
        element: <Blank />,
    },
    {
        path: "/line-chart",
        title: "Line Chart",
        description: "Line Chart",
        element: <LineChart />,
    },
    {
        path: "/line-chart",
        title: "Line Chart",
        description: "Line Chart",
        element: <LineChart />,
    }
]

export default routes;