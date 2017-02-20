/// <reference path="../types.ts" />

namespace DashCI.Widgets {

    export class LabelConfigController implements ng.IController {
        public static $inject = ["$mdDialog", "colors", "config"];
        constructor(
            private $mdDialog: ng.material.IDialogService,
            public colors: Widgets.ICodeDescription[],
            public vm: Widgets.IWidgetData
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