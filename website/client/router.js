import { Router, WebHistoryRouterDriver, ViewStateRestoration } from "@toptensoftware/codeonly";

export let router = new Router(new WebHistoryRouterDriver());

new ViewStateRestoration(router);

