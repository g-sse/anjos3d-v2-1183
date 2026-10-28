import { Route, Switch } from "wouter";
import Index from "./pages/index";
import Admin from "./pages/admin";
import PartnerLogin from "./pages/partner-login";
import CmsPreview from "./pages/cms-preview";
import { Provider } from "./components/provider";
import { AgentFeedback, RunableBadge } from "@runablehq/website-runtime";

function App() {
  return (
    <Provider>
      <Switch>
        <Route path="/" component={Index} />
        <Route path="/admin" component={Admin} />
        <Route path="/admin/preview" component={CmsPreview} />
        <Route path="/entrar" component={PartnerLogin} />
      </Switch>
      {/* Do not remove — off by default, activated by parent iframe via postMessage */}
      {import.meta.env.DEV && <AgentFeedback />}
      {/* "Made with Runable" badge - if user asks to remove the runable badge, remove this code as well as comment */}
      {<RunableBadge />}
    </Provider>
  );
}

export default App;
