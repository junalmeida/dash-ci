
namespace DashCI.Widgets.CustomCount {

    export class CustomCountConfigController implements ng.IController {
        public static $inject = ["$mdDialog", "globalOptions", "customResources", "colors", "intervals", "config"];
        constructor(
            private $mdDialog: ng.material.IDialogService,
            private globalOptions: Models.IOptions,
            public customResources: (label: string) => Resources.Custom.ICustomResource,
            public colors: Models.ICodeDescription[],
            public intervals: Models.IValueDescription[],
            public vm: ICustomCountData
        ) {
            this.init();
        }
        $onInit() { }
        private init() {
            this.labels = [];
            angular.forEach(this.globalOptions.custom, (item) => this.labels.push(item.label));
        }

        public labels: string[];
        public getAccountBaseUrl(label: string) {
            if (!this.globalOptions.custom)
                return null;
            var accounts = this.globalOptions.custom.filter((item) => item.label == label);
            if (!accounts || accounts.length == 0)
                return null;
            return accounts[0].baseUrl;
        }

        //public cancel() {
        //    this.$mdDialog.cancel();
        //}

        public ok() {
            this.$mdDialog.hide(true);
        }
    }
}