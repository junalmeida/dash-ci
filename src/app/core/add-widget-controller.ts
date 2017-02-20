/// <reference path="../app.ts" />

namespace DashCI.Controllers {

    export class AddWidgetController implements ng.IController {
        public static $inject = ["$mdDialog", "widgets"];
        constructor(
            private $mdDialog: ng.material.IDialogService,
            public widgets: Widgets.IWidgetDescription[]
        ) { }

        public cancel() {
            this.$mdDialog.cancel();
        }

        public select(type: Widgets.WidgetType) {
            this.$mdDialog.hide(type);
        }
    }
    DashCI.app.controller("AddWidgetController", AddWidgetController);
}