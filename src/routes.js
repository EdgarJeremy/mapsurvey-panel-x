import Login from "./pages/Login";
import Panel from "./pages/Panel";

const routes = [
    { component: Login, path: '/', exact: true },
    { component: Panel, path: '/panel' }
];
export default routes;