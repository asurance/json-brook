import { render } from "solid-js/web";
import "./index.css";
import "solid-devtools";

import App from "./App";

const root = document.getElementById("root") as HTMLDivElement;

render(() => <App />, root);
