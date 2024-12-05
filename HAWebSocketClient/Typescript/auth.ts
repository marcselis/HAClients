
export type Error = 1 | 2 | 3 | 4;

export type UnsubscribeFunc = () => void;

export type MessageBase = {
    id?: number;
    type: string;
    [key: string]: any;
};

export type Context = {
    id: string;
    user_id: string | null;
    parent_id: string | null;
};

export type HassEventBase = {
    origin: string;
    time_fired: string;
    context: Context;
};

export type HassEvent = HassEventBase & {
    event_type: string;
    data: { [key: string]: any };
};

export type StateChangedEvent = HassEventBase & {
    event_type: "state_changed";
    data: {
        entity_id: string;
        new_state: HassEntity | null;
        old_state: HassEntity | null;
    };
};

export type HassConfig = {
    latitude: number;
    longitude: number;
    elevation: number;
    radius: number;
    unit_system: {
        length: string;
        mass: string;
        volume: string;
        temperature: string;
        pressure: string;
        wind_speed: string;
        accumulated_precipitation: string;
    };
    location_name: string;
    time_zone: string;
    components: string[];
    config_dir: string;
    allowlist_external_dirs: string[];
    allowlist_external_urls: string[];
    version: string;
    config_source: string;
    recovery_mode: boolean;
    safe_mode: boolean;
    state: "NOT_RUNNING" | "STARTING" | "RUNNING" | "STOPPING" | "FINAL_WRITE";
    external_url: string | null;
    internal_url: string | null;
    currency: string;
    country: string | null;
    language: string;
};

export type HassEntityBase = {
    entity_id: string;
    state: string;
    last_changed: string;
    last_updated: string;
    attributes: HassEntityAttributeBase;
    context: Context;
};

export type HassEntityAttributeBase = {
    friendly_name?: string;
    unit_of_measurement?: string;
    icon?: string;
    entity_picture?: string;
    supported_features?: number;
    hidden?: boolean;
    assumed_state?: boolean;
    device_class?: string;
    state_class?: string;
    restored?: boolean;
};

export type HassEntity = HassEntityBase & {
    attributes: { [key: string]: any };
};

export type HassEntities = { [entity_id: string]: HassEntity };

export type HassService = {
    name?: string;
    description: string;
    target?: {} | null;
    fields: {
        [field_name: string]: {
            example?: string | boolean | number;
            default?: unknown;
            required?: boolean;
            advanced?: boolean;
            selector?: {};
            filter?: {
                supported_features?: number[];
                attribute?: Record<string, any[]>;
            };
            // Custom integrations don't use translations and still have name/description
            name?: string;
            description: string;
        };
    };
    response?: { optional: boolean };
};

export type HassDomainServices = {
    [service_name: string]: HassService;
};

export type HassServices = {
    [domain: string]: HassDomainServices;
};

export type HassUser = {
    id: string;
    is_admin: boolean;
    is_owner: boolean;
    name: string;
};

export type HassServiceTarget = {
    entity_id?: string | string[];
    device_id?: string | string[];
    area_id?: string | string[];
    floor_id?: string | string[];
    label_id?: string | string[];
};

export const ERR_CANNOT_CONNECT = 1;
export const ERR_INVALID_AUTH = 2;
export const ERR_CONNECTION_LOST = 3;
export const ERR_HASS_HOST_REQUIRED = 4;
export const ERR_INVALID_HTTPS_TO_HTTP = 5;
export const ERR_INVALID_AUTH_CALLBACK = 6;

export function parseQuery<T>(queryString: string) {
    const query: any = {};
    const items = queryString.split("&");
    for (let i = 0; i < items.length; i++) {
        const item = items[i].split("=");
        const key = decodeURIComponent(item[0]);
        const value = item.length > 1 ? decodeURIComponent(item[1]) : undefined;
        query[key] = value;
    }
    return query as T;
}

// From: https://davidwalsh.name/javascript-debounce-function

// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
// eslint-disable-next-line: ban-types
export const debounce = <T extends (...args: any[]) => unknown>(
    func: T,
    wait: number,
    immediate = false,
): T => {
    let timeout: number | undefined;
    // @ts-ignore
    return function (...args) {
        // @ts-ignore
        const context = this;
        const later = () => {
            timeout = undefined;
            if (!immediate) {
                func.apply(context, args);
            }
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) {
            func.apply(context, args);
        }
    };
};

export const atLeastHaVersion = (
    version: string,
    major: number,
    minor: number,
    patch?: number,
): boolean => {
    const [haMajor, haMinor, haPatch] = version.split(".", 3);

    return (
        Number(haMajor) > major ||
        (Number(haMajor) === major &&
            (patch === undefined
                ? Number(haMinor) >= minor
                : Number(haMinor) > minor)) ||
        (patch !== undefined &&
            Number(haMajor) === major &&
            Number(haMinor) === minor &&
            Number(haPatch) >= patch)
    );
};

export type AuthData = {
  hassUrl: string;
  clientId: string | null;
  expires: number;
  refresh_token: string;
  access_token: string;
  expires_in: number;
};

export type SaveTokensFunc = (data: AuthData | null) => void;
export type LoadTokensFunc = () => Promise<AuthData | null | undefined>;

export type getAuthOptions = {
  hassUrl?: string;
  clientId?: string | null;
  redirectUrl?: string;
  authCode?: string;
  saveTokens?: SaveTokensFunc;
  loadTokens?: LoadTokensFunc;
  limitHassInstance?: boolean;
};

type QueryCallbackData =
  | {}
  | {
      state: string;
      code: string;
      auth_callback: string;
    };

type OAuthState = {
  hassUrl: string;
  clientId: string | null;
};

type AuthorizationCodeRequest = {
  grant_type: "authorization_code";
  code: string;
};

type RefreshTokenRequest = {
  grant_type: "refresh_token";
  refresh_token: string;
};

export const genClientId = (): string =>
  `${location.protocol}//${location.host}/`;

export const genExpires = (expires_in: number): number => {
  return expires_in * 1000 + Date.now();
};

function genRedirectUrl() {
  // Get current url but without # part.
  const { protocol, host, pathname, search } = location;
  return `${protocol}//${host}${pathname}${search}`;
}

function genAuthorizeUrl(
  hassUrl: string,
  clientId: string | null,
  redirectUrl: string,
  state: string,
) {
  let authorizeUrl = `${hassUrl}/auth/authorize?response_type=code&redirect_uri=${encodeURIComponent(
    redirectUrl,
  )}`;

  if (clientId !== null) {
    authorizeUrl += `&client_id=${encodeURIComponent(clientId)}`;
  }

  if (state) {
    authorizeUrl += `&state=${encodeURIComponent(state)}`;
  }
  return authorizeUrl;
}

function redirectAuthorize(
  hassUrl: string,
  clientId: string | null,
  redirectUrl: string,
  state: string,
) {
  // Add either ?auth_callback=1 or &auth_callback=1
  redirectUrl += (redirectUrl.includes("?") ? "&" : "?") + "auth_callback=1";

  document.location!.href = genAuthorizeUrl(
    hassUrl,
    clientId,
    redirectUrl,
    state,
  );
}

async function tokenRequest(
  hassUrl: string,
  clientId: string | null,
  data: AuthorizationCodeRequest | RefreshTokenRequest,
) {
  // Browsers don't allow fetching tokens from https -> http.
  // Throw an error because it's a pain to debug this.
  // Guard against not working in node.
  const l = typeof location !== "undefined" && location;
  if (l && l.protocol === "https:") {
    // Ensure that the hassUrl is hosted on https.
    const a = document.createElement("a");
    a.href = hassUrl;
    if (a.protocol === "http:" && a.hostname !== "localhost") {
      throw ERR_INVALID_HTTPS_TO_HTTP;
    }
  }

  const formData = new FormData();
  if (clientId !== null) {
    formData.append("client_id", clientId);
  }
  Object.keys(data).forEach((key) => {
    // @ts-ignore
    formData.append(key, data[key]);
  });

  const resp = await fetch(`${hassUrl}/auth/token`, {
    method: "POST",
    credentials: "same-origin",
    body: formData,
  });

  if (!resp.ok) {
    throw resp.status === 400 /* auth invalid */ ||
      resp.status === 403 /* user not active */
      ? ERR_INVALID_AUTH
      : new Error("Unable to fetch tokens");
  }

  const tokens: AuthData = await resp.json();
  tokens.hassUrl = hassUrl;
  tokens.clientId = clientId;
  tokens.expires = genExpires(tokens.expires_in);
  return tokens;
}

function fetchToken(hassUrl: string, clientId: string | null, code: string) {
  return tokenRequest(hassUrl, clientId, {
    code,
    grant_type: "authorization_code",
  });
}

function encodeOAuthState(state: OAuthState): string {
  return btoa(JSON.stringify(state));
}

function decodeOAuthState(encoded: string): OAuthState {
  return JSON.parse(atob(encoded));
}

export class Auth {
  private _saveTokens?: SaveTokensFunc;
  data: AuthData;

  constructor(data: AuthData, saveTokens?: SaveTokensFunc) {
    this.data = data;
    this._saveTokens = saveTokens;
  }

  get wsUrl() {
    // Convert from http:// -> ws://, https:// -> wss://
    return `ws${this.data.hassUrl.substr(4)}/api/websocket`;
  }

  get accessToken() {
    return this.data.access_token;
  }

  get expired() {
    return Date.now() > this.data.expires;
  }

  /**
   * Refresh the access token.
   */
  async refreshAccessToken() {
    if (!this.data.refresh_token) throw new Error("No refresh_token");

    const data = await tokenRequest(this.data.hassUrl, this.data.clientId, {
      grant_type: "refresh_token",
      refresh_token: this.data.refresh_token,
    });
    // Access token response does not contain refresh token.
    data.refresh_token = this.data.refresh_token;
    this.data = data;
    if (this._saveTokens) this._saveTokens(data);
  }

  /**
   * Revoke the refresh & access tokens.
   */
  async revoke() {
    if (!this.data.refresh_token) throw new Error("No refresh_token to revoke");

    const formData = new FormData();
    formData.append("token", this.data.refresh_token);

    // There is no error checking, as revoke will always return 200
    await fetch(`${this.data.hassUrl}/auth/revoke`, {
      method: "POST",
      credentials: "same-origin",
      body: formData,
    });

    if (this._saveTokens) {
      this._saveTokens(null);
    }
  }
}

export function createLongLivedTokenAuth(
  hassUrl: string,
  access_token: string,
) {
  return new Auth({
    hassUrl,
    clientId: null,
    expires: Date.now() + 1e11,
    refresh_token: "",
    access_token,
    expires_in: 1e11,
  });
}

export async function getAuth(options: getAuthOptions = {}): Promise<Auth> {
  let data: AuthData | null | undefined;

  let hassUrl = options.hassUrl;
  // Strip trailing slash.
  if (hassUrl && hassUrl[hassUrl.length - 1] === "/") {
    hassUrl = hassUrl.substr(0, hassUrl.length - 1);
  }
  const clientId =
    options.clientId !== undefined ? options.clientId : genClientId();
  const limitHassInstance = options.limitHassInstance === true;

  // Use auth code if it was passed in
  if (options.authCode && hassUrl) {
    data = await fetchToken(hassUrl, clientId, options.authCode);
    if (options.saveTokens) {
      options.saveTokens(data);
    }
  }

  // Check if we came back from an authorize redirect
  if (!data) {
    const query = parseQuery<QueryCallbackData>(location.search.substr(1));

    // Check if we got redirected here from authorize page
    if ("auth_callback" in query) {
      // Restore state
      const state = decodeOAuthState(query.state);

      if (
        limitHassInstance &&
        (state.hassUrl !== hassUrl || state.clientId !== clientId)
      ) {
        throw ERR_INVALID_AUTH_CALLBACK;
      }

      data = await fetchToken(state.hassUrl, state.clientId, query.code);
      if (options.saveTokens) {
        options.saveTokens(data);
      }
    }
  }

  // Check for stored tokens
  if (!data && options.loadTokens) {
    data = await options.loadTokens();
  }

  if (data) {
    return new Auth(data, options.saveTokens);
  }

  if (hassUrl === undefined) {
    throw ERR_HASS_HOST_REQUIRED;
  }

  // If no tokens found but a hassUrl was passed in, let's go get some tokens!
  redirectAuthorize(
    hassUrl,
    clientId,
    options.redirectUrl || genRedirectUrl(),
    encodeOAuthState({
      hassUrl,
      clientId,
    }),
  );
  // Just don't resolve while we navigate to next page
  return new Promise<Auth>(() => {});
}


// (c) Jason Miller
// Unistore - MIT license
// And then adopted to our needs + typescript

type Listener<State> = (state: State) => void;
type Action<State> = (
    state: State,
    ...args: any[]
) => Partial<State> | Promise<Partial<State>> | null;
type BoundAction<State> = (...args: any[]) => void;

export type Store<State> = {
    state: State | undefined;
    action(action: Action<State>): BoundAction<State>;
    setState(update: Partial<State>, overwrite?: boolean): void;
    clearState(): void;
    subscribe(listener: Listener<State>): UnsubscribeFunc;
};

export const createStore = <State>(state?: State): Store<State> => {
    let listeners: Listener<State>[] = [];

    function unsubscribe(listener: Listener<State> | null) {
        let out = [];
        for (let i = 0; i < listeners.length; i++) {
            if (listeners[i] === listener) {
                listener = null;
            } else {
                out.push(listeners[i]);
            }
        }
        listeners = out;
    }

    function setState(update: Partial<State>, overwrite: boolean): void {
        state = overwrite ? (update as State) : { ...state!, ...update };
        let currentListeners = listeners;
        for (let i = 0; i < currentListeners.length; i++) {
            currentListeners[i](state);
        }
    }

    /**
     * An observable state container, returned from {@link createStore}
     * @name store
     */

    return {
        get state() {
            return state;
        },

        /**
         * Create a bound copy of the given action function.
         * The bound returned function invokes action() and persists the result back to the store.
         * If the return value of `action` is a Promise, the resolved value will be used as state.
         * @param {Function} action	An action of the form `action(state, ...args) -> stateUpdate`
         * @returns {Function} boundAction()
         */
        action(action: Action<State>): BoundAction<State> {
            function apply(result: Partial<State>) {
                setState(result, false);
            }

            // Note: perf tests verifying this implementation: https://esbench.com/bench/5a295e6299634800a0349500
            return function () {
                let args = [state];
                for (let i = 0; i < arguments.length; i++) args.push(arguments[i]);
                // @ts-ignore
                let ret = action.apply(this, args);
                if (ret != null) {
                    return ret instanceof Promise ? ret.then(apply) : apply(ret);
                }
            };
        },

        /**
         * Apply a partial state object to the current state, invoking registered listeners.
         * @param {Object} update				An object with properties to be merged into state
         * @param {Boolean} [overwrite=false]	If `true`, update will replace state instead of being merged into it
         */
        setState,

        clearState() {
            state = undefined;
        },

        /**
         * Register a listener function to be called whenever state is changed. Returns an `unsubscribe()` function.
         * @param {Function} listener	A function to call when state changes. Gets passed the new state.
         * @returns {Function} unsubscribe()
         */
        subscribe(listener: Listener<State>): UnsubscribeFunc {
            listeners.push(listener);
            return () => {
                unsubscribe(listener);
            };
        },

        // /**
        //  * Remove a previously-registered listener function.
        //  * @param {Function} listener	The callback previously passed to `subscribe()` that should be removed.
        //  * @function
        //  */
        // unsubscribe,
    };
};


export function auth1(accessToken: string) {
    return {
        type: "auth",
        access_token: accessToken,
    };
}

export function supportedFeatures() {
    return {
        type: "supported_features",
        id: 1, // Always the first message after auth
        features: { coalesce_messages: 1 },
    };
}

export function states() {
    return {
        type: "get_states",
    };
}

export function config() {
    return {
        type: "get_config",
    };
}

export function services() {
    return {
        type: "get_services",
    };
}

export function user() {
    return {
        type: "auth/current_user",
    };
}

type ServiceCallMessage = {
    type: "call_service";
    domain: string;
    service: string;
    service_data?: object;
    target?: HassServiceTarget;
    return_response?: boolean;
};

export function callService1(
    domain: string,
    service: string,
    serviceData?: object,
    target?: HassServiceTarget,
    returnResponse?: boolean,
) {
    const message: ServiceCallMessage = {
        type: "call_service",
        domain,
        service,
        target,
        return_response: returnResponse,
    };

    if (serviceData) {
        message.service_data = serviceData;
    }

    return message;
}

type SubscribeEventMessage = {
    type: "subscribe_events";
    event_type?: string;
};

export function subscribeEvents(eventType?: string) {
    const message: SubscribeEventMessage = {
        type: "subscribe_events",
    };

    if (eventType) {
        message.event_type = eventType;
    }

    return message;
}

export function unsubscribeEvents(subscription: number) {
    return {
        type: "unsubscribe_events",
        subscription,
    };
}

export function ping() {
    return {
        type: "ping",
    };
}

export function error(code: Error, message: string) {
    return {
        type: "result",
        success: false,
        error: {
            code,
            message,
        },
    };
}


const DEBUG = false;

export type ConnectionOptions = {
    setupRetry: number;
    auth?: Auth;
    createSocket: (options: ConnectionOptions) => Promise<HaWebSocket>;
};

export type ConnectionEventListener = (
    conn: Connection,
    eventData?: any,
) => void;

type Events = "ready" | "disconnected" | "reconnect-error";

type WebSocketPongResponse = {
    id: number;
    type: "pong";
};

type WebSocketEventResponse = {
    id: number;
    type: "event";
    event: HassEvent;
};

type WebSocketResultResponse = {
    id: number;
    type: "result";
    success: true;
    result: any;
};

type WebSocketResultErrorResponse = {
    id: number;
    type: "result";
    success: false;
    error: {
        code: string;
        message: string;
    };
};

type WebSocketResponse =
    | WebSocketPongResponse
    | WebSocketEventResponse
    | WebSocketResultResponse
    | WebSocketResultErrorResponse;

type SubscriptionUnsubscribe = () => Promise<void>;

interface SubscribeEventCommmandInFlight<T> {
    resolve: (result?: any) => void;
    reject: (err: any) => void;
    callback: (ev: T) => void;
    subscribe: (() => Promise<SubscriptionUnsubscribe>) | undefined;
    unsubscribe: SubscriptionUnsubscribe;
}

type CommandWithAnswerInFlight = {
    resolve: (result?: any) => void;
    reject: (err: any) => void;
};

type CommandInFlight =
    | SubscribeEventCommmandInFlight<any>
    | CommandWithAnswerInFlight;

export class Connection {
    options: ConnectionOptions;
    commandId: number;
    commands: Map<number, CommandInFlight>;
    eventListeners: Map<string, ConnectionEventListener[]>;
    closeRequested: boolean;
    suspendReconnectPromise?: Promise<void>;

    oldSubscriptions?: Map<number, CommandInFlight>;

    // We use this to queue messages in flight for the first reconnect
    // after the connection has been suspended.
    _queuedMessages?: Array<{
        resolve: (value?: unknown) => unknown;
        reject?: (err: typeof ERR_CONNECTION_LOST) => unknown;
    }>;
    socket?: HaWebSocket;
    /**
     * Version string of the Home Assistant instance. Set to version of last connection while reconnecting.
     */
    // @ts-ignore: incorrectly claiming it's not set in constructor.
    haVersion: string;

    constructor(socket: HaWebSocket, options: ConnectionOptions) {
        // connection options
        //  - setupRetry: amount of ms to retry when unable to connect on initial setup
        //  - createSocket: create a new Socket connection
        this.options = options;
        // id if next command to send
        this.commandId = 2; // socket may send 1 at the start to enable features
        // info about active subscriptions and commands in flight
        this.commands = new Map();
        // map of event listeners
        this.eventListeners = new Map();
        // true if a close is requested by the user
        this.closeRequested = false;

        this._setSocket(socket);
    }

    get connected() {
        // Using conn.socket.OPEN instead of WebSocket for better node support
        return (
            this.socket !== undefined && this.socket.readyState == this.socket.OPEN
        );
    }

    private _setSocket(socket: HaWebSocket) {
        this.socket = socket;
        this.haVersion = socket.haVersion;
        socket.addEventListener("message", this._handleMessage);
        socket.addEventListener("close", this._handleClose);

        const oldSubscriptions = this.oldSubscriptions;
        if (oldSubscriptions) {
            this.oldSubscriptions = undefined;
            oldSubscriptions.forEach((info) => {
                if ("subscribe" in info && info.subscribe) {
                    info.subscribe().then((unsub) => {
                        info.unsubscribe = unsub;
                        // We need to resolve this in case it wasn't resolved yet.
                        // This allows us to subscribe while we're disconnected
                        // and recover properly.
                        info.resolve();
                    });
                }
            });
        }
        const queuedMessages = this._queuedMessages;

        if (queuedMessages) {
            this._queuedMessages = undefined;
            for (const queuedMsg of queuedMessages) {
                queuedMsg.resolve();
            }
        }

        this.fireEvent("ready");
    }

    addEventListener(eventType: Events, callback: ConnectionEventListener) {
        let listeners = this.eventListeners.get(eventType);

        if (!listeners) {
            listeners = [];
            this.eventListeners.set(eventType, listeners);
        }

        listeners.push(callback);
    }

    removeEventListener(eventType: Events, callback: ConnectionEventListener) {
        const listeners = this.eventListeners.get(eventType);

        if (!listeners) {
            return;
        }

        const index = listeners.indexOf(callback);

        if (index !== -1) {
            listeners.splice(index, 1);
        }
    }

    fireEvent(eventType: Events, eventData?: any) {
        (this.eventListeners.get(eventType) || []).forEach((callback) =>
            callback(this, eventData),
        );
    }

    suspendReconnectUntil(suspendPromise: Promise<void>) {
        this.suspendReconnectPromise = suspendPromise;
    }

    suspend() {
        if (!this.suspendReconnectPromise) {
            throw new Error("Suspend promise not set");
        }
        if (this.socket) {
            this.socket.close();
        }
    }

    /**
     * Reconnect the websocket connection.
     * @param force discard old socket instead of gracefully closing it.
     */
    reconnect(force = false) {
        if (!this.socket) {
            return;
        }
        if (!force) {
            this.socket.close();
            return;
        }
        this.socket.removeEventListener("message", this._handleMessage);
        this.socket.removeEventListener("close", this._handleClose);
        this.socket.close();
        this._handleClose();
    }

    close() {
        this.closeRequested = true;
        if (this.socket) {
            this.socket.close();
        }
    }

    /**
     * Subscribe to a specific or all events.
     *
     * @param callback Callback  to be called when a new event fires
     * @param eventType
     * @returns promise that resolves to an unsubscribe function
     */
    async subscribeEvents<EventType>(
        callback: (ev: EventType) => void,
        eventType?: string,
    ): Promise<SubscriptionUnsubscribe> {
        return this.subscribeMessage(callback, subscribeEvents(eventType));
    }

    ping() {
        return this.sendMessagePromise(ping());
    }

    sendMessage(message: MessageBase, commandId?: number): void {
        if (!this.connected) {
            throw ERR_CONNECTION_LOST;
        }

        if (DEBUG) {
            console.log("Sending", message);
        }

        if (this._queuedMessages) {
            if (commandId) {
                throw new Error("Cannot queue with commandId");
            }
            this._queuedMessages.push({ resolve: () => this.sendMessage(message) });
            return;
        }

        if (!commandId) {
            commandId = this._genCmdId();
        }
        message.id = commandId;

        this.socket!.send(JSON.stringify(message));
    }

    sendMessagePromise<Result>(message: MessageBase): Promise<Result> {
        return new Promise((resolve, reject) => {
            if (this._queuedMessages) {
                this._queuedMessages!.push({
                    reject,
                    resolve: async () => {
                        try {
                            resolve(await this.sendMessagePromise(message));
                        } catch (err) {
                            reject(err);
                        }
                    },
                });
                return;
            }

            const commandId = this._genCmdId();
            this.commands.set(commandId, { resolve, reject });
            this.sendMessage(message, commandId);
        });
    }

    /**
     * Call a websocket command that starts a subscription on the backend.
     *
     * @param message the message to start the subscription
     * @param callback the callback to be called when a new item arrives
     * @param [options.resubscribe] re-established a subscription after a reconnect. Defaults to true.
     * @returns promise that resolves to an unsubscribe function
     */
    async subscribeMessage<Result>(
        callback: (result: Result) => void,
        subscribeMessage: MessageBase,
        options?: { resubscribe?: boolean },
    ): Promise<SubscriptionUnsubscribe> {
        if (this._queuedMessages) {
            await new Promise((resolve, reject) => {
                this._queuedMessages!.push({ resolve, reject });
            });
        }

        let info: SubscribeEventCommmandInFlight<Result>;

        await new Promise((resolve, reject) => {
            // Command ID that will be used
            const commandId = this._genCmdId();

            // We store unsubscribe on info object. That way we can overwrite it in case
            // we get disconnected and we have to subscribe again.
            info = {
                resolve,
                reject,
                callback,
                subscribe:
                    options?.resubscribe !== false
                        ? () => this.subscribeMessage(callback, subscribeMessage)
                        : undefined,
                unsubscribe: async () => {
                    // No need to unsubscribe if we're disconnected
                    if (this.connected) {
                        await this.sendMessagePromise(
                            unsubscribeEvents(commandId),
                        );
                    }
                    this.commands.delete(commandId);
                },
            };
            this.commands.set(commandId, info);

            try {
                this.sendMessage(subscribeMessage, commandId);
            } catch (err) {
                // Happens when the websocket is already closing.
                // Don't have to handle the error, reconnect logic will pick it up.
            }
        });

        return () => info.unsubscribe();
    }

    private _handleMessage = (event: MessageEvent) => {
        let messageGroup: WebSocketResponse | WebSocketResponse[] = JSON.parse(
            event.data,
        );

        if (!Array.isArray(messageGroup)) {
            messageGroup = [messageGroup];
        }

        messageGroup.forEach((message) => {
            if (DEBUG) {
                console.log("Received", message);
            }

            const info = this.commands.get(message.id);

            switch (message.type) {
                case "event":
                    if (info) {
                        (info as SubscribeEventCommmandInFlight<any>).callback(
                            message.event,
                        );
                    } else {
                        console.warn(
                            `Received event for unknown subscription ${message.id}. Unsubscribing.`,
                        );
                        this.sendMessagePromise(
                            unsubscribeEvents(message.id),
                        ).catch((err) => {
                            if (DEBUG) {
                                console.warn(
                                    ` Error unsubsribing from unknown subscription ${message.id}`,
                                    err,
                                );
                            }
                        });
                    }
                    break;

                case "result":
                    // No info is fine. If just sendMessage is used, we did not store promise for result
                    if (info) {
                        if (message.success) {
                            info.resolve(message.result);

                            // Don't remove subscriptions.
                            if (!("subscribe" in info)) {
                                this.commands.delete(message.id);
                            }
                        } else {
                            info.reject(error);
                            this.commands.delete(message.id);
                        }
                    }
                    break;

                case "pong":
                    if (info) {
                        info.resolve();
                        this.commands.delete(message.id);
                    } else {
                        console.warn(`Received unknown pong response ${message.id}`);
                    }
                    break;

                default:
                    if (DEBUG) {
                        console.warn("Unhandled message", message);
                    }
            }
        });
    };

    private _handleClose = async () => {
        const oldCommands = this.commands;

        // reset to original state except haVersion
        this.commandId = 1;
        this.oldSubscriptions = this.commands;
        this.commands = new Map();
        this.socket = undefined;

        // Reject in-flight sendMessagePromise requests
        oldCommands.forEach((info) => {
            // We don't cancel subscribeEvents commands in flight
            // as we will be able to recover them.
            if (!("subscribe" in info)) {
                info.reject(error(ERR_CONNECTION_LOST, "Connection lost"));
            }
        });

        if (this.closeRequested) {
            return;
        }

        this.fireEvent("disconnected");

        // Disable setupRetry, we control it here with auto-backoff
        const options = { ...this.options, setupRetry: 0 };

        const reconnect = (tries: number) => {
            setTimeout(
                async () => {
                    if (this.closeRequested) {
                        return;
                    }
                    if (DEBUG) {
                        console.log("Trying to reconnect");
                    }
                    try {
                        const socket = await options.createSocket(options);
                        this._setSocket(socket);
                    } catch (err) {
                        if (this._queuedMessages) {
                            const queuedMessages = this._queuedMessages;
                            this._queuedMessages = undefined;
                            for (const msg of queuedMessages) {
                                if (msg.reject) {
                                    msg.reject(ERR_CONNECTION_LOST);
                                }
                            }
                        }
                        if (err === ERR_INVALID_AUTH) {
                            this.fireEvent("reconnect-error", err);
                        } else {
                            reconnect(tries + 1);
                        }
                    }
                },
                Math.min(tries, 5) * 1000,
            );
        };

        if (this.suspendReconnectPromise) {
            await this.suspendReconnectPromise;
            this.suspendReconnectPromise = undefined;
            // For the first retry after suspend, we will queue up
            // all messages.
            this._queuedMessages = [];
        }

        reconnect(0);
    };

    private _genCmdId() {
        return ++this.commandId;
    }
}


export const MSG_TYPE_AUTH_REQUIRED = "auth_required";
export const MSG_TYPE_AUTH_INVALID = "auth_invalid";
export const MSG_TYPE_AUTH_OK = "auth_ok";

export interface HaWebSocket extends WebSocket {
    haVersion: string;
}

export function createSocket(options: ConnectionOptions): Promise<HaWebSocket> {
    if (!options.auth) {
        throw ERR_HASS_HOST_REQUIRED;
    }
    const auth = options.auth;

    // Start refreshing expired tokens even before the WS connection is open.
    // We know that we will need auth anyway.
    let authRefreshTask = auth.expired
        ? auth.refreshAccessToken().then(
            () => {
                authRefreshTask = undefined;
            },
            () => {
                authRefreshTask = undefined;
            },
        )
        : undefined;

    // Convert from http:// -> ws://, https:// -> wss://
    const url = auth.wsUrl;

    if (DEBUG) {
        console.log("[Auth phase] Initializing", url);
    }

    function connect(
        triesLeft: number,
        promResolve: (socket: HaWebSocket) => void,
        promReject: (err: Error) => void,
    ) {
        if (DEBUG) {
            console.log("[Auth Phase] New connection", url);
        }

        const socket = new WebSocket(url) as HaWebSocket;

        // If invalid auth, we will not try to reconnect.
        let invalidAuth = false;

        const closeMessage = () => {
            // If we are in error handler make sure close handler doesn't also fire.
            socket.removeEventListener("close", closeMessage);
            if (invalidAuth) {
                promReject(ERR_INVALID_AUTH);
                return;
            }

            // Reject if we no longer have to retry
            if (triesLeft === 0) {
                // We never were connected and will not retry
                promReject(ERR_CANNOT_CONNECT);
                return;
            }

            const newTries = triesLeft === -1 ? -1 : triesLeft - 1;
            // Try again in a second
            setTimeout(() => connect(newTries, promResolve, promReject), 1000);
        };

        // Auth is mandatory, so we can send the auth message right away.
        const handleOpen = async (event: MessageEventInit) => {
            try {
                if (auth.expired) {
                    await (authRefreshTask ? authRefreshTask : auth.refreshAccessToken());
                }
                socket.send(JSON.stringify(auth1(auth.accessToken)));
            } catch (err) {
                // Refresh token failed
                invalidAuth = err === ERR_INVALID_AUTH;
                socket.close();
            }
        };

        const handleMessage = async (event: MessageEvent) => {
            const message = JSON.parse(event.data);

            if (DEBUG) {
                console.log("[Auth phase] Received", message);
            }
            switch (message.type) {
                case MSG_TYPE_AUTH_INVALID:
                    invalidAuth = true;
                    socket.close();
                    break;

                case MSG_TYPE_AUTH_OK:
                    socket.removeEventListener("open", handleOpen);
                    socket.removeEventListener("message", handleMessage);
                    socket.removeEventListener("close", closeMessage);
                    socket.removeEventListener("error", closeMessage);
                    socket.haVersion = message.ha_version;
                    if (atLeastHaVersion(socket.haVersion, 2022, 9)) {
                        socket.send(JSON.stringify(supportedFeatures()));
                    }

                    promResolve(socket);
                    break;

                default:
                    if (DEBUG) {
                        // We already send response to this message when socket opens
                        if (message.type !== MSG_TYPE_AUTH_REQUIRED) {
                            console.warn("[Auth phase] Unhandled message", message);
                        }
                    }
            }
        };

        socket.addEventListener("open", handleOpen);
        socket.addEventListener("message", handleMessage);
        socket.addEventListener("close", closeMessage);
        socket.addEventListener("error", closeMessage);
    }

    return new Promise((resolve, reject) =>
        connect(options.setupRetry, resolve, reject),
    );
}


interface SubscribeEventCommmandInFlight<T> {
    resolve: (result?: any) => void;
    reject: (err: any) => void;
    callback: (ev: T) => void;
    subscribe: (() => Promise<SubscriptionUnsubscribe>) | undefined;
    unsubscribe: SubscriptionUnsubscribe;
}



type ServiceRegisteredEvent = {
    data: {
        domain: string;
        service: string;
    };
};

type ServiceRemovedEvent = {
    data: {
        domain: string;
        service: string;
    };
};

function processServiceRegistered(
    conn: Connection,
    store: Store<HassServices>,
    event: ServiceRegisteredEvent,
) {
    const state = store.state;
    if (state === undefined) return;

    const { domain, service } = event.data;

    if (!state.domain?.service) {
        const domainInfo = {
            ...state[domain],
            [service]: { description: "", fields: {} },
        };
        store.setState({ [domain]: domainInfo });
    }
    debouncedFetchServices(conn, store);
}

function processServiceRemoved(
    state: HassServices,
    event: ServiceRemovedEvent,
) {
    if (state === undefined) return null;

    const { domain, service } = event.data;
    const curDomainInfo = state[domain];

    if (!curDomainInfo || !(service in curDomainInfo)) return null;

    const domainInfo: HassDomainServices = {};
    Object.keys(curDomainInfo).forEach((sKey) => {
        if (sKey !== service) domainInfo[sKey] = curDomainInfo[sKey];
    });

    return { [domain]: domainInfo };
}

const debouncedFetchServices = debounce(
    (conn: Connection, store: Store<HassServices>) =>
        fetchServices(conn).then((services) => store.setState(services, true)),
    5000,
);

const fetchServices = (conn: Connection) => getServices(conn);
const subscribeUpdates1 = (conn: Connection, store: Store<HassServices>) =>
    Promise.all([
        conn.subscribeEvents<ServiceRegisteredEvent>(
            (ev) =>
                processServiceRegistered(conn, store, ev as ServiceRegisteredEvent),
            "service_registered",
        ),
        conn.subscribeEvents<ServiceRemovedEvent>(
            store.action(processServiceRemoved),
            "service_removed",
        ),
    ]).then((unsubs) => () => unsubs.forEach((fn) => fn()));

export const servicesColl = (conn: Connection) =>
    getCollection(conn, "_srv", fetchServices, subscribeUpdates1);

export const subscribeServices = (
    conn: Connection,
    onChange: (state: HassServices) => void,
): UnsubscribeFunc => servicesColl(conn).subscribe(onChange);


export async function createConnection(options?: Partial<ConnectionOptions>) {
    const connOptions: ConnectionOptions = {
        setupRetry: 0,
        createSocket,
        ...options,
    };

    const socket = await connOptions.createSocket(connOptions);
    const conn = new Connection(socket, connOptions);
    return conn;
}


interface EntityState {
    /** state */
    s: string;
    /** attributes */
    a: { [key: string]: any };
    /** context */
    c: Context | string;
    /** last_changed; if set, also applies to lu */
    lc: number;
    /** last_updated */
    lu: number;
}

interface EntityStateRemove {
    /** attributes */
    a: string[];
}

interface EntityDiff {
    /** additions */
    "+"?: Partial<EntityState>;
    /** subtractions */
    "-"?: EntityStateRemove;
}

interface StatesUpdates {
    /** add */
    a?: Record<string, EntityState>;
    /** remove */
    r?: string[]; // remove
    /** change */
    c: Record<string, EntityDiff>;
}

function processEvent(store: Store<HassEntities>, updates: StatesUpdates) {
    const state = { ...store.state };

    if (updates.a) {
        for (const entityId in updates.a) {
            const newState = updates.a[entityId];
            let last_changed = new Date(newState.lc * 1000).toISOString();
            state[entityId] = {
                entity_id: entityId,
                state: newState.s,
                attributes: newState.a,
                context:
                    typeof newState.c === "string"
                        ? { id: newState.c, parent_id: null, user_id: null }
                        : newState.c,
                last_changed: last_changed,
                last_updated: newState.lu
                    ? new Date(newState.lu * 1000).toISOString()
                    : last_changed,
            };
        }
    }

    if (updates.r) {
        for (const entityId of updates.r) {
            delete state[entityId];
        }
    }

    if (updates.c) {
        for (const entityId in updates.c) {
            let entityState = state[entityId];

            if (!entityState) {
                console.warn("Received state update for unknown entity", entityId);
                continue;
            }

            entityState = { ...entityState };

            const { "+": toAdd, "-": toRemove } = updates.c[entityId];
            const attributesChanged = toAdd?.a || toRemove?.a;
            const attributes = attributesChanged
                ? { ...entityState.attributes }
                : entityState.attributes;

            if (toAdd) {
                if (toAdd.s !== undefined) {
                    entityState.state = toAdd.s;
                }
                if (toAdd.c) {
                    if (typeof toAdd.c === "string") {
                        entityState.context = { ...entityState.context, id: toAdd.c };
                    } else {
                        entityState.context = { ...entityState.context, ...toAdd.c };
                    }
                }
                if (toAdd.lc) {
                    entityState.last_updated = entityState.last_changed = new Date(
                        toAdd.lc * 1000,
                    ).toISOString();
                } else if (toAdd.lu) {
                    entityState.last_updated = new Date(toAdd.lu * 1000).toISOString();
                }
                if (toAdd.a) {
                    Object.assign(attributes, toAdd.a);
                }
            }
            if (toRemove?.a) {
                for (const key of toRemove.a) {
                    delete attributes[key];
                }
            }
            if (attributesChanged) {
                entityState.attributes = attributes;
            }
            state[entityId] = entityState;
        }
    }

    store.setState(state, true);
}

const subscribeUpdates2 = (conn: Connection, store: Store<HassEntities>) =>
    conn.subscribeMessage<StatesUpdates>((ev) => processEvent(store, ev), {
        type: "subscribe_entities",
    });

function legacyProcessEvent(
    store: Store<HassEntities>,
    event: StateChangedEvent,
) {
    const state = store.state;
    if (state === undefined) return;

    const { entity_id, new_state } = event.data;
    if (new_state) {
        store.setState({ [new_state.entity_id]: new_state });
    } else {
        const newEntities = { ...state };
        delete newEntities[entity_id];
        store.setState(newEntities, true);
    }
}

async function legacyFetchEntities(conn: Connection): Promise<HassEntities> {
    const states = await getStates(conn);
    const entities: HassEntities = {};
    for (let i = 0; i < states.length; i++) {
        const state = states[i];
        entities[state.entity_id] = state;
    }
    return entities;
}

const legacySubscribeUpdates = (conn: Connection, store: Store<HassEntities>) =>
    conn.subscribeEvents<StateChangedEvent>(
        (ev) => legacyProcessEvent(store, ev as StateChangedEvent),
        "state_changed",
    );

export const entitiesColl = (conn: Connection) =>
    atLeastHaVersion(conn.haVersion, 2022, 4, 0)
        ? getCollection(conn, "_ent", undefined, subscribeUpdates2)
        : getCollection(conn, "_ent", legacyFetchEntities, legacySubscribeUpdates);

export const subscribeEntities = (
    conn: Connection,
    onChange: (state: HassEntities) => void,
): UnsubscribeFunc => entitiesColl(conn).subscribe(onChange);


type ComponentLoadedEvent = {
    data: {
        component: string;
    };
};

function processComponentLoaded(
    state: HassConfig,
    event: ComponentLoadedEvent,
): Partial<HassConfig> | null {
    if (state === undefined) return null;

    return {
        components: state.components.concat(event.data.component),
    };
}

const fetchConfig = (conn: Connection) => getConfig(conn);
const subscribeUpdates3 = (conn: Connection, store: Store<HassConfig>) =>
    Promise.all([
        conn.subscribeEvents(
            store.action(processComponentLoaded),
            "component_loaded",
        ),
        conn.subscribeEvents(
            () => fetchConfig(conn).then((config) => store.setState(config, true)),
            "core_config_updated",
        ),
    ]).then((unsubs) => () => unsubs.forEach((unsub) => unsub()));

export const configColl = (conn: Connection) =>
    getCollection(conn, "_cnf", fetchConfig, subscribeUpdates3);

export const subscribeConfig = (
    conn: Connection,
    onChange: (state: HassConfig) => void,
): UnsubscribeFunc => configColl(conn).subscribe(onChange);

export const STATE_NOT_RUNNING = "NOT_RUNNING";
export const STATE_STARTING = "STARTING";
export const STATE_RUNNING = "RUNNING";
export const STATE_STOPPING = "STOPPING";
export const STATE_FINAL_WRITE = "FINAL_WRITE";


export const getStates = (connection: Connection) =>
    connection.sendMessagePromise<HassEntity[]>(states());

export const getServices = (connection: Connection) =>
    connection.sendMessagePromise<HassServices>(services());

export const getConfig = (connection: Connection) =>
    connection.sendMessagePromise<HassConfig>(config());

export const getUser = (connection: Connection) =>
    connection.sendMessagePromise<HassUser>(user());

export const callService = (
    connection: Connection,
    domain: string,
    service: string,
    serviceData?: object,
    target?: HassServiceTarget,
    returnResponse?: boolean,
) =>
    connection.sendMessagePromise(
        callService1(domain, service, serviceData, target, returnResponse),
    );

export type Collection<State> = {
    state: State;
    refresh(): Promise<void>;
    subscribe(subscriber: (state: State) => void): UnsubscribeFunc;
};

// Time to wait to unsubscribe from updates after last subscriber unsubscribes
const UNSUB_GRACE_PERIOD = 5000; // 5 seconds

/**
 *
 * @param conn connection
 * @param key the key to store it on the connection. Must be unique for each collection.
 * @param fetchCollection fetch the current state. If undefined assumes subscribeUpdates receives current state
 * @param subscribeUpdates subscribe to updates on the current state
 * @returns
 */
export const getCollection = <State>(
    conn: Connection,
    key: string,
    fetchCollection: ((conn: Connection) => Promise<State>) | undefined,
    subscribeUpdates?: (
        conn: Connection,
        store: Store<State>,
    ) => Promise<UnsubscribeFunc>,
    options: { unsubGrace: boolean } = { unsubGrace: true },
): Collection<State> => {
    // @ts-ignore
    if (conn[key]) {
        // @ts-ignore
        return conn[key];
    }

    let active = 0;
    let unsubProm: Promise<UnsubscribeFunc>;
    let unsubTimer: number | undefined;
    let store = createStore<State>();

    const refresh = (): Promise<void> => {
        if (!fetchCollection) {
            throw new Error("Collection does not support refresh");
        }

        return fetchCollection(conn).then((state) => store.setState(state, true));
    };

    const refreshSwallow = () =>
        refresh().catch((err: unknown) => {
            // Swallow errors if socket is connecting, closing or closed.
            // We will automatically call refresh again when we re-establish the connection.
            if (conn.connected) {
                throw err;
            }
        });

    const setupUpdateSubscription = () => {
        if (unsubTimer !== undefined) {
            if (DEBUG) {
                console.log(`Prevented unsubscribe for ${key}`);
            }
            clearTimeout(unsubTimer);
            unsubTimer = undefined;
            return;
        }

        if (DEBUG) {
            console.log(`Subscribing to ${key}`);
        }

        if (subscribeUpdates) {
            unsubProm = subscribeUpdates(conn, store);
        }

        if (fetchCollection) {
            // Fetch when connection re-established.
            conn.addEventListener("ready", refreshSwallow);
            refreshSwallow();
        }

        conn.addEventListener("disconnected", handleDisconnect);
    };

    const teardownUpdateSubscription = () => {
        if (DEBUG) {
            console.log(`Unsubscribing from ${key}`);
        }
        unsubTimer = undefined;

        // Unsubscribe from changes
        if (unsubProm)
            unsubProm.then((unsub) => {
                unsub();
            });
        store.clearState();
        conn.removeEventListener("ready", refresh);
        conn.removeEventListener("disconnected", handleDisconnect);
    };

    const scheduleTeardownUpdateSubscription = () => {
        if (DEBUG) {
            console.log(`Scheduling unsubscribing from ${key}`);
        }
        unsubTimer = setTimeout(teardownUpdateSubscription, UNSUB_GRACE_PERIOD);
    };

    const handleDisconnect = () => {
        // If we're going to unsubscribe and then lose connection,
        // just unsubscribe immediately.
        if (unsubTimer) {
            clearTimeout(unsubTimer);
            teardownUpdateSubscription();
        }
    };

    // @ts-ignore
    conn[key] = {
        get state() {
            return store.state;
        },

        refresh,

        subscribe(subscriber: (state: State) => void): UnsubscribeFunc {
            active++;

            if (DEBUG) {
                console.log(`New subscriber for ${key}. Active subscribers: ${active}`);
            }

            // If this was the first subscriber, attach collection
            if (active === 1) {
                setupUpdateSubscription();
            }

            const unsub = store.subscribe(subscriber);

            if (store.state !== undefined) {
                // Don't call it right away so that caller has time
                // to initialize all the things.
                setTimeout(() => subscriber(store.state!), 0);
            }

            return () => {
                unsub();
                active--;

                if (DEBUG) {
                    console.log(`Unsubscribe for ${key}. Active subscribers: ${active}`);
                }

                if (!active) {
                    options.unsubGrace
                        ? scheduleTeardownUpdateSubscription()
                        : teardownUpdateSubscription();
                }
            };
        },
    };

    // @ts-ignore
    return conn[key];
};

// Legacy name. It gets a collection and subscribes.
export const createCollection = <State>(
    key: string,
    fetchCollection: (conn: Connection) => Promise<State>,
    subscribeUpdates:
        | ((conn: Connection, store: Store<State>) => Promise<UnsubscribeFunc>)
        | undefined,
    conn: Connection,
    onChange: (state: State) => void,
): UnsubscribeFunc =>
    getCollection(conn, key, fetchCollection, subscribeUpdates).subscribe(
        onChange,
    );
