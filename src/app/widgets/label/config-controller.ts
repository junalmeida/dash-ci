
namespace DashCI.Widgets.Label {

    export class LabelConfigController implements ng.IController {
        public static $inject = ["$mdDialog", "colors", "config"];
        constructor(
            private $mdDialog: ng.material.IDialogService,
            public colors: Models.ICodeDescription[],
            public vm: Models.IWidgetData
        ) { 
            this.init();
        }

        private init() {
        }

        public ok() {
            this.$mdDialog.hide(true);
        }
    }
    DashCI.app.controller("LabelConfigController", LabelConfigController);

}