
namespace DashCI {
    export class GoogleCastReceiver {
        public static Cast = <any>null;
        private manager: any;
        private messageBus: any;
        private namespace = 'urn:x-cast:almasistemas.dashci';

        private script = '//www.gstatic.com/cast/sdk/libs/receiver/2.0.0/cast_receiver.js';
        public constructor() {
            var el = document.createElement('script');
            el.onload = () => {
                setTimeout(() => this.initializeCastApi(), 100);
            };
            el.type = "text/javascript";
            el.src = this.script;
            document.body.appendChild(el);
        }

        private initializeCastApi() {

            GoogleCastReceiver.Cast = (<any>window).cast;

            GoogleCastReceiver.Cast.receiver.logger.setLevelValue(0);
            this.manager = GoogleCastReceiver.Cast.receiver.CastReceiverManager.getInstance();
            this.log('Starting Receiver Manager');

            this.manager.onReady = (event: any) => {
                this.log('Received Ready event: ' + JSON.stringify(event.data));
                this.manager.setApplicationState('chromecast-dashboard is ready...');
            };

            this.manager.onSenderConnected = (event: any) => {
                this.log('Received Sender Connected event: ' + event.senderId);
            };

            this.manager.onSenderDisconnected = (event: any) => {
                this.log('Received Sender Disconnected event: ' + event.senderId);
                if (this.manager.getSenders().length == 0 &&
                    event.reason == GoogleCastReceiver.Cast.receiver.system.DisconnectReason.REQUESTED_BY_SENDER) {
                    window.close();
                }
            };

            this.messageBus =
                this.manager.getCastMessageBus(
                    this.namespace, GoogleCastReceiver.Cast.receiver.CastMessageBus.MessageType.JSON);

            this.messageBus.onMessage = (event: any) => this.receiveMessage(event);

            // Initialize the CastReceiverManager with an application status message.
            this.manager.start({ statusText: 'Application is starting' });
            this.log('Receiver Manager started');
        }

        private receiveMessage(event: any) {
            this.log('Message [' + event.senderId + ']: ' + event.data);
            if (typeof (event.data) == "object")
                this.log(JSON.stringify(event.data));
            try {
                if (event.data && this.receiveOptions) {
                    var opt = <DashCI.Models.IOptions>event.data;
                    this.receiveOptions(opt);
                }
                else
                    $("#debug").show().append("<p>Error receiving cast</p>");
            } catch (err) {
                const ex: Error = err;
                this.log(ex.message);
            }

        }

        public receiveOptions: (options: DashCI.Models.IOptions) => void;


        private log(txt: string) {
            DashCI.DEBUG && console.log(txt);
            DashCI.DEBUG && $("#debug").append("<p>" + txt + "</p>");
            DashCI.DEBUG && $("#debug").show();
        }
    }
}