namespace DashCI.Widgets.TfsQueryChart {

    export interface ITfsQueryChartData extends Models.IWidgetData {
        project?: string;
        team?: string;
        poolInterval?: number;
        queryCount?: number;
        queryIds?: string[];
        queryColors?: string[];
    }

    export class TfsQueryChartController implements ng.IController {
        public static $inject = ["$scope", "$q", "$timeout", "$interval", "$mdDialog", "tfsResources"];

        private data: ITfsQueryChartData;

        constructor(
            private $scope: Models.IWidgetScope,
            private $q: ng.IQService,
            private $timeout: ng.ITimeoutService,
            private $interval: ng.IIntervalService,
            private $mdDialog: ng.material.IDialogService,
            private tfsResources: () => Resources.Tfs.ITfsResource
        ) {
            this.data = this.$scope.data;
            this.data.id = Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
            this.data.type = Models.WidgetType.tfsQueryChart;
            this.data.footer = false;
            this.data.header = true;

            this.$scope.$watch(
                () => this.$scope.$element.height(),
                (height: number) => this.resizeBy(this.$scope.$element.width(), height)
            );
            this.$scope.$watch(
                () => this.$scope.$element.width(),
                (width: number) => this.resizeBy(width, this.$scope.$element.height())
            );
            this.$scope.$watch(
                () => this.data.poolInterval,
                (value: number) => this.updateInterval()
            );
            this.$scope.$on("$destroy", () => this.finalize());

            this.init();
        }
        $onInit() { }
        private handle: ng.IPromise<any>;
        private finalize() {
            if (this.handle) {
                this.$timeout.cancel(this.handle);
                this.$interval.cancel(this.handle);
            }
            DashCI.DEBUG && console.log("dispose: " + this.data.id + "-" + this.data.title);
        }

        private init() {
            this.data.title = this.data.title || "Chart";
            this.data.color = this.data.color || "grey";

            //default values
            this.data.queryCount = this.data.queryCount || 2;
            this.data.queryIds = this.data.queryIds || ["", ""];
            this.data.queryColors = this.data.queryColors || ["", ""];
            this.data.poolInterval = this.data.poolInterval || 20000;
            this.updateInterval();
        }

        private resizeBy(width: number, height: number) {
            this.width = width;
            this.height = height - 40;

            this.fontSize = Math.round(height / 1.3);
            this.lineSize = Math.round((height) - 60);

            var canvas = <HTMLCanvasElement>this.$scope.$element.find("canvas").get(0);
            if (canvas)
            {
                canvas.width = this.width;
                canvas.height = this.height;
            }

            this.$timeout(() => this.drawGraph(), 50);
        }

        public config() {
            this.$mdDialog.show({
                controller: TfsQueryChartConfigController,
                controllerAs: "ctrl",
                templateUrl: 'app/widgets/tfs-query-chart/config.html',
                parent: angular.element(document.body),
                //targetEvent: ev,
                clickOutsideToClose: true,
                fullscreen: false,
                resolve: {
                    config: () => {
                        var deferred = this.$q.defer();
                        this.$timeout(() => deferred.resolve(this.data), 1);
                        return deferred.promise;
                    }
                }
            });
            //.then((ok) => this.createWidget(type));

        }

        public queryValues: number[];
        public total: number = null;
        public width: number = 50;
        public height: number = 50;
        public fontSize: number = 12;
        public lineSize: number = 12;

        private updateInterval() {
            if (this.handle) {
                this.$timeout.cancel(this.handle);
                this.$interval.cancel(this.handle);
            }
            this.handle = this.$timeout(() => {
                this.handle = this.$interval(() => this.update(), this.data.poolInterval);
            }, DashCI.randomNess()); //this should create some randomness to avoid a lot of calls at the same moment.
            this.update();
        }

        private update() {
            if (!this.data.project || !this.data.queryIds || this.data.queryIds.length == 0)
                return;
            var res = this.tfsResources();
            if (!res)
                return;


            var queries:ng.IPromise<DashCI.Resources.Tfs.IRunQueryResult>[] = [];
            for (var q in this.data.queryIds) {
                var query = this.data.queryIds[q];
                if (query)
                    queries.push(res.run_query({
                        project: this.data.project,
                        team: this.data.team,
                        queryId: query
                    }).$promise);
            }
            if (queries.length == 0)
                return;

            DashCI.DEBUG && console.log("start tfs request: " + this.data.id + "; " + this.data.title + "; " + new Date().toLocaleTimeString("en-us"));
            this.$q.all(queries)
                .then(res => {
                    var resValues: number[] = [];
                    this.total = 0;
                    for (var i in res) {
                        resValues.push(res[i].workItems.length);
                        this.total += res[i].workItems.length;
                    }
                    
                    this.queryValues = resValues;
                    this.drawGraph();
                    DashCI.DEBUG && console.log("end tfs request: " + this.data.id + "; " + this.data.title + "; " + new Date().toLocaleTimeString("en-us"));
                })
                .catch((reason) => {
                    this.queryValues = null;
                    console.error(reason);
                });
            this.$timeout(() => this.resizeBy(this.$scope.$element.width(), this.$scope.$element.height()), 500);
        }

        private doughnutHoleSize = 0.5;
        private drawGraph() {
            var data: number[] = [];
            var labels: string[] = [];
            var colors: string[] = [];

            DashCI.DEBUG && console.log("chart draw start: " + this.data.title);


            var bgColor =
                this.data.color == 'transparent' || this.data.color == 'semi-transparent' ? "black" :
                this.getStyleRuleValue("background-color", "." + this.data.color);
            for (var i in this.queryValues) {
                data.push(this.queryValues[i]);
                labels.push(this.queryValues[i].toString());
                var color = this.getStyleRuleValue("background-color", "." + this.data.queryColors[i]);
                colors.push(color);
            }

            //todo: draw segments at canvas.

            var canvas = <HTMLCanvasElement>this.$scope.$element.find("canvas").get(0);
            if (!canvas)
                return;
            var ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            var total_value = this.total;
            var color_index = 0;
            var start_angle = 0;

            for (var i in data) {
                var val = data[i];
                var slice_angle = 2 * Math.PI * val / total_value;

                this.drawPieSlice(
                    ctx,
                    canvas.width / 2,
                    canvas.height / 2,
                    Math.min(canvas.width / 2, canvas.height / 2),
                    start_angle,
                    start_angle + slice_angle,
                    colors[i]
                );

                start_angle += slice_angle;
                color_index++;
            }

            //drawing a white circle over the chart
            //to create the doughnut chart
            if (this.doughnutHoleSize) {
                this.drawPieSlice(
                    ctx,
                    canvas.width / 2,
                    canvas.height / 2,
                    this.doughnutHoleSize * Math.min(canvas.width / 2, canvas.height / 2),
                    0,
                    2 * Math.PI,
                    bgColor
                );
            }

            start_angle = 0;
            for (i in data) {
                var val = data[i];
                slice_angle = 2 * Math.PI * val / total_value;
                var pieRadius = Math.min(canvas.width / 2, canvas.height / 2);
                var labelX = canvas.width / 2 + (pieRadius / 2) * Math.cos(start_angle + slice_angle / 2);
                var labelY = canvas.height / 2 + (pieRadius / 2) * Math.sin(start_angle + slice_angle / 2);

                if (this.doughnutHoleSize) {
                    var offset = (pieRadius * this.doughnutHoleSize) / 2;
                    labelX = canvas.width / 2 + (offset + pieRadius / 2) * Math.cos(start_angle + slice_angle / 2);
                    labelY = canvas.height / 2 + (offset + pieRadius / 2) * Math.sin(start_angle + slice_angle / 2);
                }

                var labelText = Math.round(100 * val / total_value);
                if (labelText > 4) {
                    ctx.fillStyle = "white";
                    ctx.font = "bold 20px Arial";
                    ctx.fillText(labelText + "%", labelX, labelY);
                    start_angle += slice_angle;
                }
            }
            DashCI.DEBUG && console.log("chart draw complete: " + this.data.title);
        }

        /*
        private drawLine(ctx:CanvasRenderingContext2D, startX: number, startY: number, endX: number, endY: number) {
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
        }

        private drawArc(ctx: CanvasRenderingContext2D, centerX: number, centerY: number, radius: number, startAngle: number, endAngle: number) {
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            ctx.stroke();
        }
        */
        private drawPieSlice(ctx: CanvasRenderingContext2D, centerX: number, centerY: number, radius: number, startAngle: number, endAngle: number, color: string) {
            if(color)ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            ctx.closePath();
            //if (!color) {
            //    ctx.clip();
            //    ctx.clearRect(centerX - radius - 1, centerY - radius - 1,
            //        radius * 2 + 2, radius * 2 + 2);

            //}
            ctx.fill();
        }

        private getStyleRuleValue(style: string, selector: string, sheet?: StyleSheet):any {
            var sheets = typeof sheet !== 'undefined' ? [sheet] : document.styleSheets;
            for (var i = 0, l = sheets.length; i < l; i++) {
                var currentSheet = <CSSStyleSheet>sheets[i];
                var rules = currentSheet.cssRules || currentSheet.rules;
                if (!rules) { continue; }
                for (var j = 0, k = rules.length; j < k; j++) {
                    var rule = <CSSPageRule>rules[j];
                    if (rule.selectorText && rule.selectorText.split(',').indexOf(selector) !== -1) {
                        return rule.style[<any>style];
                    }
                }
            }
            return null;
        }
    }
}