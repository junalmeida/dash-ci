
namespace DashCI {
    export class GoogleCastReceiver {
        public static Cast = <any>null;
        private manager: any;
        private messageBus: any;
        private namespace = 'urn:x-cast:almasistemas.dashci';

        private script = '//www.gstatic.com/cast/sdk/libs/receiver/2.0.0/cast_receiver.js';
        public constructor() {
            var el = document.createElement('script');
            document.body.appendChild(el);
            el.onload = () => {
                setTimeout(() => this.initializeCastApi(), 1000);
            };
            el.type = "text/javascript";
            el.src = this.script;
        }

        private initializeCastApi() {
            GoogleCastReceiver.Cast = (<any>window).cast;

            GoogleCastReceiver.Cast.receiver.logger.setLevelValue(0);
            this.manager = GoogleCastReceiver.Cast.receiver.CastReceiverManager.getInstance();
            console.log('Starting Receiver Manager');

            this.manager.onReady = (event: any) => {
                console.log('Received Ready event: ' + JSON.stringify(event.data));
                this.manager.setApplicationState('chromecast-dashboard is ready...');
            };

            this.manager.onSenderConnected = (event: any) => {
                console.log('Received Sender Connected event: ' + event.senderId);
            };

            this.manager.onSenderDisconnected = (event : any) => {
                console.log('Received Sender Disconnected event: ' + event.senderId);
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
            console.log('Receiver Manager started');
        }

        private receiveMessage(event: any) {
            console.log('Message [' + event.senderId + ']: ' + event.data);

            if (event.data && this.receiveOptions)
                this.receiveOptions(event.data);

        }

        public receiveOptions: (options: DashCI.Models.IOptions) => void;
    }
}