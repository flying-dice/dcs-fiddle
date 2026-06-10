const normalize = (path: string) => (path !== "/" && path.endsWith("/") ? path.slice(0, -1) : path);

class Router {
	path = $state(normalize(window.location.pathname));

	constructor() {
		window.addEventListener("popstate", () => {
			this.path = normalize(window.location.pathname);
		});
	}

	navigate(to: string) {
		history.pushState(null, "", to);
		this.path = normalize(new URL(to, window.location.origin).pathname);
	}
}

export const router = new Router();
