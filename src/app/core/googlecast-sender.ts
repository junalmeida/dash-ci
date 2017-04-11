namespace DashCI {
    export class GoogleCastSender {
        private script = '//www.gstatic.com/cv/js/sender/v1/cast_sender.js';
        private applicationID = 'E57E663D';
        private namespace = 'urn:x-cast:almasistemas.dashci';
        private session = <any>null;
        public static Cast = <any>null;
        public connected: boolean;
        public invalidOs = true;

        public constructor() {
            /**
            * Call initialization for Cast
            */

            var el = document.createElement('script');
            document.body.appendChild(el);
            el.onload = () => {
                setTimeout(() => this.initializeCastApi(), 1000);
            };
            el.type = "text/javascript";
            el.src = this.script;
        }
        /**
         * initialization
         */
        private initializeCastApi() {
            GoogleCastSender.Cast = (<any>window).chrome.cast;
            var sessionRequest = new GoogleCastSender.Cast.SessionRequest(this.applicationID);
            var apiConfig = new GoogleCastSender.Cast.ApiConfig(sessionRequest,
                (e: any) => this.sessionListener(e),
                (e: any) => this.receiverListener(e));
            GoogleCastSender.Cast.initialize(apiConfig, () => this.onInitSuccess(), (m: string) => this.onError(m));
        }
        /**
         * initialization success callback
         */
        private onInitSuccess() {
            console.info('Cast onInitSuccess');
            this.invalidOs = false;
        }
        /**
         * initialization error callback
         */
        private onError(message: string) {
            console.error('Cast onError: ' + JSON.stringify(message));
            this.connected = false;
        }
        /**
         * generic success callback
         */
        private onSuccess(message: string) {
            console.info('Cast onSuccess: ' + message);
            this.connected = true;
        }
        /**
         * callback on success for stopping app
         */
        private onStopAppSuccess() {
            console.info('Cast onStopAppSuccess');
            this.connected = false;
        }
        /**
         * session listener during initialization
         */
        private sessionListener(e:any) {
            console.info('Cast New session ID:' + e.sessionId);
            this.session = e;
            this.session.addUpdateListener((isAlive:boolean) => this.sessionUpdateListener(isAlive));
            this.session.addMessageListener(this.namespace, (namespace:string, message:string) => this.receiverMessage(namespace, message));
        }
        /**
         * listener for session updates
         */
        private sessionUpdateListener(isAlive: boolean) {
            var message = isAlive ? 'Session Updated' : 'Session Removed';
            message += ': ' + this.session.sessionId;
            console.debug(message);
            if (!isAlive) {
                this.session = null;
                this.connected = false;
            }
        }
        /**
         * utility private to log messages from the receiver
         * @param {string} namespace The namespace of the message
         * @param {string} message A message string
         */
        private receiverMessage(namespace: string, message: string) {
            console.debug('receiverMessage: ' + namespace + ', ' + message);
        }
        /**
         * receiver listener during initialization
         */
        private receiverListener(e: any) {
            if (e === 'available') {
                console.info('receiver found');
            }
            else {
                console.info('receiver list empty');
            }
        }
        /**
         * stop app/session
         */
        public stopApp() {
            if (this.session)
                this.session.stop(() => this.onStopAppSuccess(), (message: string) => this.onError(message));
        }
        /**
         * send a message to the receiver using the custom namespace
         * receiver CastMessageBus message handler will be invoked
         * @param {string} message A message string
         */
        public sendMessage(message: any) {
            if (this.session != null) {
                this.session.sendMessage(this.namespace, message,
                    () => this.onSuccess(message),
                    (m: string) => this.onError(m));
            }
            else {
                GoogleCastSender.Cast.requestSession((e: any) => {
                    this.session = e;
                    this.session.sendMessage(this.namespace, message,
                        () => this.onSuccess(message),
                        (m: string) => this.onError(m));
                }, (m: string) => this.onError(m));
            }
        }
        ///**
        // * append message to debug message window
        // * @param {string} message A message string
        // */
        //private appendMessage(message: string) {
        //    console.log(message);
        //    var dw = document.getElementById('debugmessage');
        //    dw.innerHTML += '\n' + JSON.stringify(message);
        //}
    }
}