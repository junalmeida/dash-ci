namespace DashCI.Widgets.Clock {
    export class ClockController implements ng.IController {
        public static $inject = ["$scope", "$interval"];


        constructor(
            private $scope: Models.IWidgetScope,
            private $interval: ng.IIntervalService
        ) {
            this.data = this.$scope.data;
            this.data.id = Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
            this.data.type = Models.WidgetType.clock;
            this.data.footer = false;
            this.data.header = true;

            this.$scope.$on("$destroy", () => this.finalize());
            this.$scope.$watch(
                () => this.$scope.$element.height(),
                (height: number) => this.fontSize(height)
            );

            this.init();
        }

        private data: Models.IWidgetData;
        public date: string;
        public time: string;

        private init() {
            this.data.title = this.$scope.data.title || "Clock";
            this.data.color = this.$scope.data.color || "green";

            this.handle = this.$interval(() => this.setClock(), 1000);
        }

        private handle: ng.IPromise<any>;
        private finalize() {
            if (this.handle)
                this.$interval.cancel(this.handle);
        }

        private fontSize(height: number) {

            var fontSizeTime = Math.round(height / 3.8) + "px";
            var lineTime = Math.round((height / 2) - 20) + "px";
            var fontSizeDate = Math.round(height / 5.9) + "px";
            var lineDate = Math.round((height / 2) - 30) + "px";
            var date = this.$scope.$element.find(".date");
            var time = this.$scope.$element.find(".time");
            date.css('font-size', fontSizeDate);
            date.css('line-height', lineDate);
            time.css('font-size', fontSizeTime);
            time.css('line-height', lineTime);
        }

        private _formatDoubleDigit(digit: number) {
            return ('0' + digit).slice(-2);
        }

        private setClock() {
            var now = new Date();
            var locale = 'pt-br';

            var status = {
                year: now.getFullYear(),
                month: (/[a-z]+/gi.exec(now.toLocaleString(locale, { month: "short" })))[0].substring(0, 3),
                day: now.getDate(),
                hours: this._formatDoubleDigit(now.getHours()),
                minutes: this._formatDoubleDigit(now.getMinutes()),
                seconds: this._formatDoubleDigit(now.getSeconds())
            };

            this.date = status.day + ' ' + status.month + ' ' + status.year;
            this.time = status.hours + ':' + status.minutes + ':' + status.seconds;
        }
    }
}